/* ── Section Nav ────────────────────────────────────────── */
function setSection(sec){
  st.section=sec;localStorage.setItem('ops_section',sec);
  window.scrollTo(0,0);document.querySelector('.content')?.scrollTo(0,0);
  ['tasks','workorders','cleaning','mydash','notifications'].forEach(s=>{
    const b=document.getElementById('nav-'+s);if(b)b.classList.toggle('active',s===sec);
    const mb=document.getElementById('mnav-'+s);if(mb)mb.classList.toggle('active',s===sec);
  });
  const titles={tasks:t('Tasks'),workorders:t('Work Orders'),cleaning:t('Cleaning'),mydash:t('My Dashboard'),notifications:t('Notifications')};
  document.getElementById('topbar-title').textContent=titles[sec]||sec;
  const showVT=sec==='tasks'||sec==='workorders';
  const noNew=sec==='mydash'||sec==='notifications';
  const newLabel={tasks:t('+ New Task'),workorders:t('+ New Work Order'),cleaning:t('+ New Cleaning Job')}[sec]||t('+ New');
  const vtD=document.getElementById('view-toggle-d');if(vtD)vtD.style.display=showVT?'flex':'none';
  const nb=document.getElementById('new-btn');if(nb){nb.style.display=noNew?'none':'inline-flex';nb.textContent=newLabel;}
  const isMob=window.innerWidth<=700;
  const r2=document.getElementById('topbar-r2');
  const vtM=document.getElementById('view-toggle');if(vtM)vtM.style.display=showVT?'flex':'none';
  if(r2)r2.style.display=(isMob&&!noNew)?'flex':'none';
  const nbm=document.getElementById('new-btn-m');if(nbm){nbm.textContent=newLabel;}
  const gp=document.getElementById('guesty-panel');if(gp)gp.style.display=sec==='cleaning'?'block':'none';
  if(sec==='cleaning'){renderPropStatusBoard();if(propBoardTab==='calendar')loadGuestyCalendar();}
  if(sec==='notifications')loadNotifications();
  closeDetail();renderSection();
}
function setView(v){
  st.view=v;localStorage.setItem('ops_view',v);
  ['vt-board','vt-board-m'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('active',v==='board');});
  ['vt-list','vt-list-m'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('active',v==='list');});
  renderSection();
}
function renderSection(){
  const el=document.getElementById('main-section');
  if(st.loading){el.innerHTML='<div class="loading-msg">Loading…</div>';return;}
  if(st.section==='tasks')el.innerHTML=renderTasks();
  else if(st.section==='workorders')el.innerHTML=renderWorkOrders();
  else if(st.section==='cleaning')el.innerHTML=renderCleaning();
  else if(st.section==='mydash')el.innerHTML=renderMyDash();
  else if(st.section==='notifications')el.innerHTML=renderNotificationsView();
}

/* ── Display helpers ────────────────────────────────────── */
function statusTag(s){const map={'Open':'tag-blue','In Progress':'tag-yellow','Blocked':'tag-red','Done':'tag-green','Draft':'tag-gray','Active':'tag-blue','Complete':'tag-green','Accepted':'tag-purple','On Hold':'tag-orange','Cancelled':'tag-red','Scheduled':'tag-blue'};return`<span class="tag ${map[s]||'tag-gray'}">${h(t(s))}</span>`;}
function priorityTag(p){if(!p)return'';const map={High:'tag-red',Medium:'tag-yellow',Low:'tag-gray'};return`<span class="tag ${map[p]||'tag-gray'}">${h(t(p))}</span>`;}
function fmtRelDate(d){
  if(!d)return'';
  try{
    const dt=new Date(d.length===10?d+'T00:00:00':d);
    const today=new Date();today.setHours(0,0,0,0);
    const diff=Math.round((dt-today)/86400000);
    if(diff===0)return'Today';
    if(diff===1)return'Tomorrow';
    if(diff===-1)return'Yesterday';
    const curY=today.getFullYear(),dtY=dt.getFullYear();
    const opts={month:'short',day:'numeric'};
    if(dtY!==curY)opts.year='numeric';
    return dt.toLocaleDateString('en-US',opts);
  }catch{return d;}
}
function fmtRelTime(isoStr){
  if(!isoStr)return'';
  try{
    const dt=new Date(isoStr);
    const now=new Date();
    const diffMs=now-dt;
    const diffMin=Math.floor(diffMs/60000);
    const diffHrs=Math.floor(diffMs/3600000);
    if(diffMin<1)return'just now';
    if(diffMin<60)return diffMin===1?'1 min ago':`${diffMin} mins ago`;
    if(diffHrs<24)return diffHrs===1?'1 hr ago':`${diffHrs} hrs ago`;
    const today=new Date();today.setHours(0,0,0,0);
    const yesterday=new Date(today);yesterday.setDate(yesterday.getDate()-1);
    const dtDay=new Date(dt);dtDay.setHours(0,0,0,0);
    const timeStr=dt.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
    if(dtDay.getTime()===today.getTime())return`Today ${timeStr}`;
    if(dtDay.getTime()===yesterday.getTime())return`Yesterday ${timeStr}`;
    const curY=today.getFullYear(),dtY=dt.getFullYear();
    const dateStr=dt.toLocaleDateString('en-US',{month:'short',day:'numeric',...(dtY!==curY?{year:'numeric'}:{})});
    return`${dateStr} ${timeStr}`;
  }catch{return'';}
}
function dueTag(d){
  if(!d)return'';
  try{
    const dt=new Date(d+'T00:00:00');
    const today=new Date();today.setHours(0,0,0,0);
    const ov=dt<today;
    return`<span class="due${ov?' overdue':''}">${fmtRelDate(d)}</span>`;
  }catch{return`<span class="due">${h(d)}</span>`;}
}
const colorToAvCls={purple:'av-a',blue:'av-b',green:'av-c',orange:'av-d',pink:'av-e'};
function avFor(name){
  if(!name)return'';
  const m=loginUsers.find(u=>name.toLowerCase().includes(u.name.toLowerCase()))||TEAM.find(t=>name.toLowerCase().includes(t.name.toLowerCase()));
  if(!m)return'';
  const cls=m.avCls||(colorToAvCls[m.color]||'av-a');
  const ini=m.initials||(m.name||'').substring(0,2).toUpperCase();
  return`<span class="avatar ${cls}" title="${h(m.name)}">${h(ini)}</span>`;
}
function fmtMoney(n){return n!=null&&n!==''?'$'+Number(n).toLocaleString():'—';}
function sortByDeadline(arr,field='deadline'){return [...arr].sort((a,b)=>{const da=a[field]||'9999',db=b[field]||'9999';return da.localeCompare(db);});}

/* ── Tasks ──────────────────────────────────────────────── */
function renderTasks(){
  const tasks=sortByDeadline(st.tasks.filter(t=>(st.tf.status==='all'||t.status===st.tf.status)&&(st.tf.priority==='all'||t.priority===st.tf.priority)&&(st.tf.prop==='all'||t.property===st.tf.prop)));
  const propOpts=[...new Set(st.tasks.map(t=>t.property).filter(Boolean))].map(p=>`<option${st.tf.prop===p?' selected':''}>${h(p)}</option>`).join('');
  const filters=`<div class="filters"><select class="sel" onchange="st.tf.status=this.value;renderSection()"><option value="all">${t('All statuses')}</option><option value="Open">${t('Open')}</option><option value="In Progress">${t('In Progress')}</option><option value="Blocked">${t('Blocked')}</option><option value="Done">${t('Done')}</option></select><select class="sel" onchange="st.tf.priority=this.value;renderSection()"><option value="all">${t('All priorities')}</option><option value="High">${t('High')}</option><option value="Medium">${t('Medium')}</option><option value="Low">${t('Low')}</option></select><select class="sel" onchange="st.tf.prop=this.value;renderSection()"><option value="all">${t('All properties')}</option>${propOpts}</select></div>`;
  if(!tasks.length)return filters+`<div class="empty"><div class="empty-icon">📋</div><div>${t('No tasks yet')}</div></div>`;
  if(st.view==='board'){
    const cols=[['Open','#3b82f6'],['In Progress','#eab308'],['Blocked','#ef4444'],['Done','#22c55e']];
    return filters+`<div class="board">${cols.map(([s,c])=>`<div class="kcol"><div class="kcol-head"><div class="kcol-title"><span class="sdot" style="background:${c}"></span>${t(s)}</div><span class="kcnt">${tasks.filter(t=>t.status===s).length}</span></div>${tasks.filter(t=>t.status===s).map(t=>`<div class="card" onclick="openDetail('task','${aa(t.id)}')"><div class="card-title">${h(t.name)}</div>${t.property?`<div style="font-size:10px;color:#7F77DD;font-weight:600;margin-bottom:4px;">${h(t.property)}</div>`:''}<div class="card-meta">${priorityTag(t.priority)}${dueTag(t.deadline)}${avFor(t.assignee)}${Array.isArray(t.linkedWOs)&&t.linkedWOs.length?`<span class="tag tag-gray">🔧 ${t.linkedWOs.length}</span>`:''}</div></div>`).join('')}</div>`).join('')}</div>`;
  }
  return filters+`<div class="list-view">${tasks.map(t=>`<div class="list-item" onclick="openDetail('task','${aa(t.id)}')"><div class="list-item-main"><div class="list-item-title">${h(t.name)}</div><div class="list-item-meta">${statusTag(t.status)}${priorityTag(t.priority)}${t.property?`<span class="tag tag-prop">${h(t.property)}</span>`:''}</div></div><div class="list-item-right">${avFor(t.assignee)}${dueTag(t.deadline)}</div></div>`).join('')}</div>`;
}

/* ── Work Orders ────────────────────────────────────────── */
function renderWorkOrders(){
  const wos=st.workOrders.filter(w=>(st.wf.status==='all'||w.status===st.wf.status)&&(st.wf.prop==='all'||w.property===st.wf.prop));
  const propOpts=[...new Set(st.workOrders.map(w=>w.property).filter(Boolean))].map(p=>`<option${st.wf.prop===p?' selected':''}>${h(p)}</option>`).join('');
  const filters=`<div class="filters"><select class="sel" onchange="st.wf.status=this.value;renderSection()"><option value="all">${t('All statuses')}</option><option value="Draft">${t('Draft')}</option><option value="Active">${t('Active')}</option><option value="In Progress">${t('In Progress')}</option><option value="Complete">${t('Complete')}</option><option value="On Hold">${t('On Hold')}</option><option value="Cancelled">${t('Cancelled')}</option></select><select class="sel" onchange="st.wf.prop=this.value;renderSection()"><option value="all">${t('All properties')}</option>${propOpts}</select></div>`;
  if(!wos.length)return filters+`<div class="empty"><div class="empty-icon">🔧</div><div>${t('No work orders yet')}</div></div>`;
  if(st.view==='board'){
    const cols=[['Draft','#9ca3af'],['Active','#3b82f6'],['In Progress','#eab308'],['Complete','#22c55e'],['On Hold','#f97316'],['Cancelled','#ef4444']];
    return filters+`<div class="board">${cols.map(([s,c])=>`<div class="kcol"><div class="kcol-head"><div class="kcol-title"><span class="sdot" style="background:${c}"></span>${h(s)}</div><span class="kcnt">${wos.filter(w=>w.status===s).length}</span></div>${wos.filter(w=>w.status===s).map(w=>`<div class="card" onclick="openDetail('wo','${aa(w.id)}')"><div class="card-title">${h(w.name)}</div>${w.property?`<div style="font-size:10px;color:#7F77DD;font-weight:600;margin-bottom:4px;">${h(w.property)}</div>`:''}<div class="card-meta">${w.estCost?`<span class="tag tag-gray">${fmtMoney(w.estCost)}</span>`:''}${dueTag(w.estCompletion)}${avFor(w.supervisor)}</div></div>`).join('')}</div>`).join('')}</div>`;
  }
  return filters+`<div class="list-view">${wos.map(w=>`<div class="list-item" onclick="openDetail('wo','${aa(w.id)}')"><div class="list-item-main"><div class="list-item-title">${h(w.name)}</div><div class="list-item-meta">${statusTag(w.status)}${w.property?`<span class="tag tag-prop">${h(w.property)}</span>`:''}${w.contractor?`<span class="tag tag-gray">${h(w.contractor)}</span>`:''}</div></div><div class="list-item-right">${w.estCost?`<span style="font-size:12px;font-weight:500;">${fmtMoney(w.estCost)}</span>`:''}${dueTag(w.estCompletion)}</div></div>`).join('')}</div>`;
}

/* ── Cleaning ───────────────────────────────────────────── */
function renderCleaning(){
  const tabs=`<div class="tab-bar">
    <button class="tab-btn${st.cleaningTab==='jobs'?' active':''}" onclick="setCleaningTab('jobs')" data-i18n="Cleaning Jobs">Cleaning Jobs</button>
    <button class="tab-btn${st.cleaningTab==='submissions'?' active':''}" onclick="setCleaningTab('submissions')" data-i18n="Submissions">Submissions</button>
    <button class="tab-btn${st.cleaningTab==='payments'?' active':''}" onclick="setCleaningTab('payments')" data-i18n="Payment Dashboard">Payment Dashboard</button>
  </div>`;
  let content='';
  if(st.cleaningTab==='payments')content=renderPaymentDashboard();
  else if(st.cleaningTab==='submissions')content=renderSubmissions();
  else content=renderCleaningJobs();
  return tabs+content;
}
function setCleaningTab(tab){st.cleaningTab=tab;localStorage.setItem('cl_tab',tab);renderSection();}

function formatChecklistResponses(raw){
  if(!raw)return'';
  const sections=raw.split(/\n\n+/);
  return sections.map(sec=>{
    const lines=sec.split('\n');
    const title=lines[0]||'';
    const items=lines.slice(1).map(line=>{
      const isYes=line.startsWith('  ✓');
      const isNo=line.startsWith('  ✗');
      const color=isYes?'#166534':isNo?'#991b1b':'#555';
      const bg=isYes?'#dcfce7':isNo?'#fee2e2':'#f1f5f9';
      return`<div style="display:flex;align-items:flex-start;gap:6px;padding:3px 0;">
        <span style="font-size:11px;background:${bg};color:${color};border-radius:4px;padding:1px 5px;flex-shrink:0;font-weight:600;">${isYes?'✓':isNo?'✗':'—'}</span>
        <span style="font-size:12px;color:${isNo?'#991b1b':'#374151'};">${h(line.replace(/^\s+[✓✗—]\s*/,''))}</span>
      </div>`;
    }).join('');
    return`<div style="margin-bottom:10px;">
      <div style="font-size:11px;font-weight:700;color:#6b7280;margin-bottom:4px;">${h(title)}</div>
      ${items}
    </div>`;
  }).join('');
}
function renderSubmissions(){
  const subs=st.cleaningJobs.filter(j=>j.responses||j.submittedAt);
  if(!subs.length){
    return`<div class="empty"><div class="empty-icon">📋</div><div>No checklist submissions yet.<br><span style="font-size:12px;color:#aaa;">Make sure you've added <em>Submitted At</em> (Date) and <em>Responses</em> (Text) fields to your Cleaning Jobs DB in Notion.</span></div></div>`;
  }
  const sorted=[...subs].sort((a,b)=>(b.submittedAt||'').localeCompare(a.submittedAt||''));
  return`<div style="display:flex;flex-direction:column;gap:10px;">${sorted.map(j=>{
    const noCount=(j.responses.match(/^\s+✗/gm)||[]).length;
    return`<div style="background:#fff;border:1px solid #e5e4e0;border-radius:10px;padding:12px 14px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
        <div style="font-size:13px;font-weight:600;flex:1;">${h(j.name)}</div>
        ${noCount?`<span class="tag tag-red">⚠ ${noCount} issue${noCount>1?'s':''}</span>`:'<span class="tag tag-green">✓ All clear</span>'}
        <span style="font-size:10px;color:#aaa;">${j.submittedAt?fmtRelDate(j.submittedAt):''}</span>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
        ${j.property?`<span class="tag tag-prop">${h(j.property)}</span>`:''}
        ${j.cleaner?`<span class="tag tag-gray">🧹 ${h(j.cleaner)}</span>`:''}
      </div>
      ${j.responses?`<details style="margin-top:4px;"><summary style="font-size:11px;color:#7F77DD;cursor:pointer;font-weight:500;">View checklist answers</summary><div style="margin-top:8px;padding-top:8px;border-top:1px solid #f0f0ee;">${formatChecklistResponses(j.responses)}</div></details>`:''}
    </div>`;
  }).join('')}</div>`;
}
function renderCleaningJobs(){
  const jobs=st.cleaningJobs.filter(j=>(st.cf.status==='all'||j.status===st.cf.status)&&(st.cf.prop==='all'||j.property===st.cf.prop)&&(st.cf.cleaner==='all'||j.cleaner===st.cf.cleaner)&&(st.cf.paid==='all'||(st.cf.paid==='unpaid'&&!j.paid)||(st.cf.paid==='paid'&&j.paid)));
  const propOpts=[...new Set(st.cleaningJobs.map(j=>j.property).filter(Boolean))].map(p=>`<option${st.cf.prop===p?' selected':''}>${h(p)}</option>`).join('');
  const cleanerOpts=[...new Set(st.cleaningJobs.map(j=>j.cleaner).filter(Boolean))].map(c=>`<option${st.cf.cleaner===c?' selected':''}>${h(c)}</option>`).join('');
  const filters=`<div class="filters"><select class="sel" onchange="st.cf.status=this.value;renderSection()"><option value="all">${t('All statuses')}</option><option value="Scheduled">${t('Scheduled')}</option><option value="Accepted">${t('Accepted')}</option><option value="In Progress">${t('In Progress')}</option><option value="Complete">${t('Complete')}</option><option value="Cancelled">${t('Cancelled')}</option></select><select class="sel" onchange="st.cf.prop=this.value;renderSection()"><option value="all">${t('All properties')}</option>${propOpts}</select><select class="sel" onchange="st.cf.cleaner=this.value;renderSection()"><option value="all">${t('All cleaners')}</option>${cleanerOpts}</select><select class="sel" onchange="st.cf.paid=this.value;renderSection()"><option value="all">${t('All payment status')}</option><option value="unpaid">${t('Unpaid only')}</option><option value="paid">${t('Paid only')}</option></select></div>`;
  if(!jobs.length)return filters+`<div class="empty"><div class="empty-icon">🧹</div><div>${t('No cleaning jobs yet')}</div></div>`;
  return filters+`<div class="list-view">${jobs.map(j=>`<div class="list-item" onclick="openDetail('cleaning','${aa(j.id)}')"><div class="list-item-main"><div class="list-item-title">${h(j.name)}</div><div class="list-item-meta">${statusTag(j.status)}${j.property?`<span class="tag tag-prop">${h(j.property)}</span>`:''}${j.cleaner?`<span class="tag tag-gray">🧹 ${h(j.cleaner)}</span>`:''}${j.type?`<span class="tag tag-blue">${h(j.type)}</span>`:''}${j.gResv?`<span class="tag tag-purple" title="${h(j.gResv.guestName||'')}">🔗 Guesty</span>`:''}</div></div><div class="list-item-right">${j.rate?`<span style="font-size:12px;font-weight:500;">${fmtMoney(j.rate)}</span>`:''}<span class="tag ${j.paid?'tag-green':'tag-red'}">${j.paid?t('✓ Paid'):t('Unpaid')}</span>${dueTag(j.deadline)}</div></div>`).join('')}</div>`;
}
function renderPaymentDashboard(){
  const unpaid=st.cleaningJobs.filter(j=>!j.paid&&j.status!=='Cancelled');
  const total=unpaid.reduce((s,j)=>s+(j.rate||0),0);
  const byCleanerMap={};unpaid.forEach(j=>{const c=j.cleaner||'Unknown';if(!byCleanerMap[c])byCleanerMap[c]={name:c,total:0,count:0};byCleanerMap[c].total+=(j.rate||0);byCleanerMap[c].count++;});
  const byCleaner=Object.values(byCleanerMap).sort((a,b)=>b.total-a.total);
  return`<div class="pay-dash"><div class="pay-summary"><div class="pay-stat"><div class="pay-stat-n">${fmtMoney(total)}</div><div class="pay-stat-l">${t('Outstanding')}</div></div><div class="pay-stat"><div class="pay-stat-n">${unpaid.length}</div><div class="pay-stat-l">${t('Unpaid jobs')}</div></div><div class="pay-stat"><div class="pay-stat-n">${byCleaner.length}</div><div class="pay-stat-l">${t('Cleaners owed')}</div></div></div>${byCleaner.length?byCleaner.map(c=>`<div class="pay-cleaner-row"><div class="pay-cleaner-name">🧹 ${h(c.name)}</div><div class="pay-cleaner-cnt">${c.count} job${c.count>1?'s':''}</div><div class="pay-cleaner-amt">${fmtMoney(c.total)}</div><button class="btn btn-sm" onclick="st.cf.cleaner='${aa(c.name)}';st.cf.paid='unpaid';setCleaningTab('jobs')">${t('View')}</button></div>`).join(''):`<div class="empty"><div class="empty-icon">✅</div><div>${t('All cleaners paid up!')}</div></div>`}`;
}

/* ── My Dashboard ───────────────────────────────────────── */
function renderMyDash(){
  const me=currentSession?.name||'';
  const isAdmin=currentSession?.role==='Admin'||currentSession?.role==='Supervisor'||currentSession?.role==='Operations Manager';
  const propNames=[...new Set([...st.tasks.map(t=>t.property),...st.cleaningJobs.map(j=>j.property)].filter(Boolean))];
  const propFilter=propNames.length?`<div style="margin-bottom:12px;"><select class="sel" onchange="st.myDashProp=this.value;renderSection()"><option value="all">${t('All properties')}</option>${propNames.map(p=>`<option${st.myDashProp===p?' selected':''}>${h(p)}</option>`).join('')}</select></div>`:'';
  const tabs=`<div style="display:flex;gap:6px;margin-bottom:14px;"><button class="filter-chip${st.myDashTab==='assigned'?' active':''}" onclick="st.myDashTab='assigned';localStorage.setItem('md_tab','assigned');renderSection()">${isAdmin?t('All Tasks'):t('Assigned to me')}</button><button class="filter-chip${st.myDashTab==='supervising'?' active':''}" onclick="st.myDashTab='supervising';localStorage.setItem('md_tab','supervising');renderSection()">${t('Work Orders')}</button></div>`;
  let content='';
  if(st.myDashTab==='assigned'){
    let myT=isAdmin
      ?st.tasks.filter(t=>t.status!=='Done')
      :st.tasks.filter(t=>t.assignee&&t.assignee.toLowerCase().includes(me.toLowerCase())&&t.status!=='Done');
    if(st.myDashProp!=='all')myT=myT.filter(t=>t.property===st.myDashProp);
    myT=sortByDeadline(myT);
    let myC=isAdmin
      ?st.cleaningJobs.filter(j=>j.status!=='Complete'&&j.status!=='Cancelled')
      :st.cleaningJobs.filter(j=>j.cleaner&&j.cleaner.toLowerCase().includes(me.toLowerCase())&&j.status!=='Complete'&&j.status!=='Cancelled');
    if(st.myDashProp!=='all')myC=myC.filter(j=>j.property===st.myDashProp);
    myC=sortByDeadline(myC);
    content=(myT.length?`<div class="section-group"><div class="section-group-title">${t('Tasks')} (${myT.length})</div><div class="list-view">${myT.map(tk=>`<div class="list-item" onclick="openDetail('task','${aa(tk.id)}')"><div class="list-item-main"><div class="list-item-title">${h(tk.name)}</div><div class="list-item-meta">${statusTag(tk.status)}${priorityTag(tk.priority)}${tk.property?`<span class="tag tag-prop">${h(tk.property)}</span>`:''}${tk.assignee?`<span class="tag tag-gray">${h(tk.assignee)}</span>`:''}</div></div><div class="list-item-right">${dueTag(tk.deadline)}</div></div>`).join('')}</div></div>`:'')+
      (myC.length?`<div class="section-group"><div class="section-group-title">${t('Cleaning Jobs')} (${myC.length})</div><div class="list-view">${myC.map(j=>`<div class="list-item" onclick="openDetail('cleaning','${aa(j.id)}')"><div class="list-item-main"><div class="list-item-title">${h(j.name)}</div><div class="list-item-meta">${statusTag(j.status)}${j.property?`<span class="tag tag-prop">${h(j.property)}</span>`:''}${j.cleaner?`<span class="tag tag-gray">🧹 ${h(j.cleaner)}</span>`:''}</div></div><div class="list-item-right">${dueTag(j.deadline)}</div></div>`).join('')}</div></div>`:'')||`<div class="empty"><div class="empty-icon">✅</div><div>${isAdmin?t('No open tasks or jobs'):t('Nothing assigned to you right now')}</div></div>`;
  }else{
    let myW=isAdmin
      ?st.workOrders.filter(w=>w.status!=='Complete'&&w.status!=='Cancelled')
      :st.workOrders.filter(w=>w.supervisor&&w.supervisor.toLowerCase().includes(me.toLowerCase())&&w.status!=='Complete'&&w.status!=='Cancelled');
    if(st.myDashProp!=='all')myW=myW.filter(w=>w.property===st.myDashProp);
    myW=sortByDeadline(myW,'estCompletion');
    content=myW.length?`<div class="list-view">${myW.map(w=>`<div class="list-item" onclick="openDetail('wo','${aa(w.id)}')"><div class="list-item-main"><div class="list-item-title">${h(w.name)}</div><div class="list-item-meta">${statusTag(w.status)}${w.property?`<span class="tag tag-prop">${h(w.property)}</span>`:''}${w.supervisor?`<span class="tag tag-gray">${h(w.supervisor)}</span>`:''}</div></div><div class="list-item-right">${dueTag(w.estCompletion)}</div></div>`).join('')}</div>`:`<div class="empty"><div class="empty-icon">👀</div><div>${t('No active work orders')}</div></div>`;
  }
  return propFilter+tabs+content;
}
