/* ── Cleaner view ───────────────────────────────────────── */
let _cleanerJobs=[]; // cached for switching tabs without reload

function launchCleanerView(){
  document.getElementById('cleaner-view').style.display='flex';
  const avEl=document.getElementById('cv-av');
  avEl.className=`cleaner-user-av ${COLOR_CLS[currentSession.color]||'lav-green'}`;
  avEl.textContent=currentSession.initials;
  document.getElementById('cv-name').textContent=currentSession.name;
  applyMobile();loadCleanerJobs();
}
function setCleanerTab(tab){
  cleanerViewTab=tab;localStorage.setItem('cv_tab',tab);
  document.getElementById('cv-tab-dash')?.classList.toggle('active',tab==='dash');
  document.getElementById('cv-tab-jobs')?.classList.toggle('active',tab==='jobs');
  window.scrollTo(0,0);document.getElementById('cv-content')?.scrollTo(0,0);
  if(_cleanerJobs.length)renderCleanerContent();
}
async function loadCleanerJobs(){
  const el=document.getElementById('cv-content');
  el.innerHTML='<div style="text-align:center;padding:40px;color:#aaa;">'+t('Loading…')+'</div>';
  try{
    const pages=await queryDB(DBID_CLEANING);
    _cleanerJobs=pages.map(parseCleaning).filter(j=>j.cleaner&&j.cleaner.toLowerCase().includes(currentSession.name.toLowerCase()));
    renderCleanerContent();
  }catch(e){el.innerHTML=`<div style="text-align:center;padding:40px;color:#aaa;">Error: ${h(e.message)}</div>`;}
}
function renderCleanerContent(){
  if(cleanerViewTab==='dash')renderCleanerDashboard();
  else renderCleanerJobsList();
}

/* ── Cleaner Dashboard tab ──────────────────────────────── */
function renderCleanerDashboard(){
  const el=document.getElementById('cv-content');
  const jobs=_cleanerJobs;
  const completed=jobs.filter(j=>j.status==='Complete');
  const upcoming=jobs.filter(j=>j.status!=='Complete'&&j.status!=='Cancelled');
  const totalEarned=completed.reduce((s,j)=>s+(j.rate||0),0);
  const paid=completed.filter(j=>j.paid).reduce((s,j)=>s+(j.rate||0),0);
  const outstanding=completed.filter(j=>!j.paid).reduce((s,j)=>s+(j.rate||0),0);

  // Earnings chart — last 8 weeks
  const now=new Date();now.setHours(0,0,0,0);
  const weeks=[];
  for(let i=7;i>=0;i--){
    const wStart=new Date(now);wStart.setDate(wStart.getDate()-wStart.getDay()-i*7);
    const wEnd=new Date(wStart);wEnd.setDate(wEnd.getDate()+7);
    const wJobs=completed.filter(j=>{if(!j.deadline)return false;const d=new Date(j.deadline+'T00:00:00');return d>=wStart&&d<wEnd;});
    const earned=wJobs.reduce((s,j)=>s+(j.rate||0),0);
    const wpaid=wJobs.filter(j=>j.paid).reduce((s,j)=>s+(j.rate||0),0);
    const label=wStart.toLocaleDateString('en-US',{month:'short',day:'numeric'});
    weeks.push({label,earned,paid:wpaid});
  }
  const maxEarned=Math.max(...weeks.map(w=>w.earned),1);
  const chartHtml=`<div class="earn-chart">
    <div style="font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">${t('My Earnings')} — last 8 weeks</div>
    <div class="earn-bars">${weeks.map(w=>{
      const barH=Math.round((w.earned/maxEarned)*68)||2;
      const paidH=Math.round((w.paid/maxEarned)*68)||0;
      return`<div class="earn-bar-col">
        <div class="earn-bar-bg" style="height:${barH}px;">
          <div class="earn-bar-fill" style="height:${paidH}px;"></div>
        </div>
        <div class="earn-bar-lbl">${w.label}</div>
      </div>`;
    }).join('')}</div>
    <div style="display:flex;gap:12px;margin-top:5px;font-size:10px;color:#888;">
      <div><span style="display:inline-block;width:8px;height:8px;background:#e5e4e0;border-radius:2px;margin-right:3px;"></span>${t('Earned')}</div>
      <div><span style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:2px;margin-right:3px;"></span>${t('Paid')}</div>
    </div>
  </div>`;

  // Recent jobs preview
  const recentJobs=sortByDeadline(upcoming).slice(0,5);
  const jobsHtml=recentJobs.length?`
    <div style="margin-bottom:4px;font-size:11px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.05em;">${t('Upcoming Jobs')}</div>
    ${recentJobs.map(j=>`<div class="job-card" style="margin-bottom:8px;">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <div class="job-card-prop">${h(j.property||'—')}</div>
        ${statusTag(j.status)}
      </div>
      <div class="job-card-title" style="font-size:14px;">${h(j.name)}</div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
        <span class="due">${j.deadline?fmtRelDate(j.deadline):''}</span>
        ${j.rate!=null?`<span style="font-size:15px;font-weight:700;color:#166534;">${fmtMoney(j.rate)}</span>`:''}
      </div>
    </div>`).join('')}`
    :'<div style="text-align:center;padding:20px;color:#aaa;font-size:13px;">'+t('All clear for today 🎉')+'</div>';

  el.innerHTML=`
    <div class="cv-summary-grid">
      <div class="cv-stat"><div class="cv-stat-n">${upcoming.length}</div><div class="cv-stat-l">${t('Upcoming')}</div></div>
      <div class="cv-stat owed"><div class="cv-stat-n">${fmtMoney(outstanding)}</div><div class="cv-stat-l">${t('Outstanding')}</div></div>
      <div class="cv-stat earned"><div class="cv-stat-n">${fmtMoney(totalEarned)}</div><div class="cv-stat-l">${t('Total Earned')}</div></div>
    </div>
    ${chartHtml}
    ${jobsHtml}`;
}

/* ── Cleaner Jobs tab ───────────────────────────────────── */
function renderCleanerJobsList(){
  const el=document.getElementById('cv-content');
  const jobs=_cleanerJobs;
  const today=new Date();today.setHours(0,0,0,0);
  const todayEnd=new Date(today.getTime()+86400000);
  const in7=new Date(today.getTime()+7*86400000);

  const todayJ=sortByDeadline(jobs.filter(j=>!['Complete','Cancelled'].includes(j.status)&&j.deadline&&new Date(j.deadline+'T00:00:00')>=today&&new Date(j.deadline+'T00:00:00')<todayEnd));
  const upcoming=sortByDeadline(jobs.filter(j=>!['Complete','Cancelled'].includes(j.status)&&j.deadline&&new Date(j.deadline+'T00:00:00')>=todayEnd));
  const noDate=jobs.filter(j=>!['Complete','Cancelled'].includes(j.status)&&!j.deadline);
  const done=jobs.filter(j=>j.status==='Complete');
  const cancelled=jobs.filter(j=>j.status==='Cancelled');

  function jCard(j){
    const isAccepted=j.status==='Accepted';
    const isDone=j.status==='Complete';
    const isSched=j.status==='Scheduled';
    const noteOpen=cleanerNoteOpen[j.id];
    return`<div class="job-card${isDone?' done-card':''}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:3px;">
        <div class="job-card-prop">${h(j.property||'—')}</div>
        ${statusTag(j.status)}
      </div>
      <div class="job-card-title">${h(j.name)}</div>
      <div class="job-card-meta">
        ${j.type?`<span class="tag tag-blue">${h(j.type)}</span>`:''}
        <span class="due">${j.deadline?fmtRelDate(j.deadline):''}</span>
        ${j.rate!=null?`<span style="font-size:13px;font-weight:700;color:#166534;">${fmtMoney(j.rate)}</span>`:''}
        ${j.gResv?`<span class="tag tag-purple">🔗 ${h(j.gResv.guestName||'Guest')}</span>`:''}
      </div>
      <div class="job-card-actions">
        ${isSched?`<button class="job-accept-btn" onclick="cleanerAcceptJob('${aa(j.id)}')">✓ ${t('Accept')}</button>`:''}
        ${isAccepted?`<button class="job-done-btn" onclick="showChecklistModal('${aa(j.id)}','${aa(j.name)}','${aa(j.property||'')}')">✓ ${t('Mark done')}</button>`:''}
        ${isDone?`<button class="job-done-btn undo-btn" onclick="cleanerUndoDone('${aa(j.id)}')">${t('Undo')}</button>`:''}
        ${(isSched||isAccepted)?`<button class="job-note-btn" onclick="cleanerToggleNote('${aa(j.id)}')">📝</button>`:''}
      </div>
      ${noteOpen&&!isDone?`<div class="job-note-area"><textarea class="job-note-input" id="note-${aa(j.id)}" placeholder="Add a note…"></textarea><button class="job-note-save" onclick="cleanerSaveNote('${aa(j.id)}')">Save</button></div>`:''}
    </div>`;
  }
  function sec(title,items,urgent){
    if(!items.length)return'';
    const badge=`<span class="cleaner-sec-badge${urgent?' urgent':''}">${items.length}</span>`;
    return`<div class="cleaner-section"><div class="cleaner-sec-head"><span class="cleaner-sec-title">${title}</span>${badge}</div>${items.map(jCard).join('')}</div>`;
  }
  const html=(todayJ.length?sec(t("Today's jobs"),todayJ,true):'<div class="cleaner-section"><div class="cleaner-sec-head"><span class="cleaner-sec-title">'+t("Today's jobs")+'</span></div><div style="text-align:center;padding:16px;color:#aaa;font-size:13px;">'+t('All clear for today 🎉')+'</div></div>')+
    sec(t('Next 7 days'),upcoming,false)+sec(t('No date'),noDate,false)+
    (done.length?sec(t('✓ Done'),done,false):'')+
    (cancelled.length?sec(t('Cancelled'),cancelled,false):'');
  el.innerHTML=html||`<div class="empty"><div class="empty-icon">🧹</div><div>${t('No cleaning jobs found.')}</div></div>`;
}

async function cleanerAcceptJob(id){
  try{
    await updatePage(id,{Status:wp('select','Accepted')});
    // Record timestamp for Ops Manager notifications
    const key=`accept-${id}`;notifTimestamps[key]=Date.now();
    localStorage.setItem('notif_ts',JSON.stringify(notifTimestamps));
    toast('Job accepted ✓');
    const j=_cleanerJobs.find(j=>j.id===id);if(j)j.status='Accepted';
    renderCleanerContent();
  }catch(e){toast('Error: '+(e.message||e));}
}
async function cleanerUndoDone(id){
  try{await updatePage(id,{Status:wp('select','Accepted')});toast('Moved back to Accepted ✓');const j=_cleanerJobs.find(j=>j.id===id);if(j)j.status='Accepted';renderCleanerContent();}catch(e){toast('Error: '+(e.message||e));}
}
function cleanerToggleNote(id){cleanerNoteOpen[id]=!cleanerNoteOpen[id];renderCleanerContent();}
async function cleanerSaveNote(id){
  const txt=(document.getElementById('note-'+id)||{}).value?.trim()||'';if(!txt)return;
  try{await updatePage(id,{Notes:wp('text',txt)});cleanerNoteOpen[id]=false;toast('Note saved ✓');renderCleanerContent();}catch(e){toast('Error: '+(e.message||e));}
}
