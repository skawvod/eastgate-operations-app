/* ── Section Checklist Modal ────────────────────────────── */
const CHECKLIST_SECTIONS=[
  {icon:'🍳',title:'Kitchen',items:[
    {q:'Clean kitchen towels set up?'},
    {q:'Dishes clean and put away?'},
    {q:'Coffee station set up?',hint:'Specify anything missing?',noteKey:true},
    {q:'All kitchen surfaces cleaned?'},
    {q:'Fridge clean?',hint:'All old food discarded'},
    {q:'Oven clean?'},
    {q:'Microwave clean?'},
    {q:'Kettle clean?'},
    {q:'Kitchen cabinets & drawers clean & tidy?',hint:'All bags and unrelated items discarded'},
    {q:'Clean rag & sponges set?'},
    {q:'Paper towel roll stocked?'},
    {q:'Dishsoap full?'},
    {q:'Dishwasher pods provided?'},
  ]},
  {icon:'🚿',title:'Bathrooms',items:[
    {q:'Handsoap filled in all bathrooms?'},
    {q:'Shampoo, conditioner & body soap in all bathrooms?'},
    {q:'Bathroom vanity surfaces & drawers/cabinets cleaned?'},
    {q:'All mirrors clean?'},
    {q:'All toilets clean?'},
    {q:'All shower & sink drains clear?',hint:'No hair or gunk'},
    {q:'All water drains 🌀 working well?'},
    {q:'All shower glass doors clean?'},
    {q:'All water taps 🚿🚰 running well?'},
    {q:'Enough toilet paper in all bathrooms?'},
    {q:'Clean hand towels in bathrooms?'},
    {q:'Clean body towels for each guest?'},
    {q:'Laundry pods by washing machine?'},
  ]},
  {icon:'🛏',title:'Bedrooms, Living & Outdoor',items:[
    {q:'All floors swept & mopped?'},
    {q:'All beds made?'},
    {q:'Bedside tables & drawers clean?'},
    {q:'Bedroom closets tidy?'},
    {q:'Sofa surfaces clean, living area tidy?'},
    {q:'Dining table wiped down?'},
    {q:'Dining chairs organized & tidy?'},
    {q:'All garbage bins cleaned and set with new trash bag?'},
    {q:'Spare trash bags under sink?'},
    {q:'Mirpeset clean?'},
    {q:'Outdoor/garden area swept & clean?'},
  ]},
  {icon:'💡',title:'Lighting & Tech',items:[
    {q:'Mood lighting on?'},
    {q:'Light bulbs all work?'},
    {q:'TV remotes all work?'},
    {q:'AirCon remotes all work?'},
    {q:'Boiler timer set?'},
  ]},
];
// flatten for easy total count
function clAllItems(){return CHECKLIST_SECTIONS.flatMap((s,si)=>s.items.map((it,ii)=>({...it,si,ii,key:`${si}_${ii}`})));}

function showChecklistModal(jobId,jobName,propertyName){
  checklistJobId=jobId;checklistSection=0;checklistAnswers={jobName,propertyName};
  renderChecklistSection();
}
function renderChecklistSection(){
  let overlay=document.getElementById('checklist-overlay');
  if(!overlay){overlay=document.createElement('div');overlay.id='checklist-overlay';overlay.className='checklist-overlay';document.body.appendChild(overlay);}
  const sec=CHECKLIST_SECTIONS[checklistSection];
  const totalSec=CHECKLIST_SECTIONS.length;
  const isLast=checklistSection===totalSec-1;
  const pct=Math.round((checklistSection/totalSec)*100);
  // count how many items unanswered
  const unanswered=sec.items.filter((_,ii)=>!checklistAnswers[`${checklistSection}_${ii}`]).length;
  const itemsHtml=sec.items.map((item,ii)=>{
    const key=`${checklistSection}_${ii}`;
    const noteKey=`${key}_note`;
    const ans=checklistAnswers[key]||'';
    const noteVal=checklistAnswers[noteKey]||'';
    const showNote=item.noteKey||ans==='no';
    return`<div class="checklist-item">
      <div class="checklist-item-left">
        <div class="checklist-item-q">${h(item.q)}</div>
        ${item.hint?`<div class="checklist-item-hint">${h(item.hint)}</div>`:''}
        ${showNote?`<div class="checklist-item-note"><textarea placeholder="${item.noteKey?'Specify…':'Describe the issue…'}" oninput="checklistAnswers['${noteKey}']=this.value">${h(noteVal)}</textarea></div>`:''}
      </div>
      <div class="checklist-yn">
        <button class="cl-yn yes${ans==='yes'?' active':''}" onclick="clSetAns(${checklistSection},${ii},'yes')">✓</button>
        <button class="cl-yn no${ans==='no'?' active':''}" onclick="clSetAns(${checklistSection},${ii},'no')">✗</button>
      </div>
    </div>`;
  }).join('');
  overlay.innerHTML=`<div class="checklist-modal">
    <div class="checklist-progress-bar"><div class="checklist-progress-fill" style="width:${pct}%;"></div></div>
    <div class="checklist-head">
      <div class="checklist-sec-label">Section ${checklistSection+1} of ${totalSec}</div>
      <div class="checklist-sec-title">${sec.icon} ${sec.title}</div>
      <div class="checklist-sec-count">${sec.items.length} items</div>
    </div>
    <div class="checklist-body">${itemsHtml}</div>
    <div class="checklist-foot">
      <button class="btn" onclick="${checklistSection>0?'clPrev()':'cancelChecklist()'}">${checklistSection>0?'← Back':'Cancel'}</button>
      ${unanswered>0
        ?`<span class="checklist-warn">${unanswered} item${unanswered>1?'s':''} unanswered</span><button class="btn btn-primary" disabled style="opacity:.45;">${isLast?'Submit & Complete ✓':'Next Section →'}</button>`
        :`<button class="btn btn-primary" onclick="${isLast?'checklistSubmit()':'clNext()'}"> ${isLast?'Submit & Complete ✓':'Next Section →'}</button>`
      }
    </div>
  </div>`;
}
function clSetAns(si,ii,val){
  checklistAnswers[`${si}_${ii}`]=val;
  renderChecklistSection();
}
function clNext(){checklistSection++;renderChecklistSection();}
function clPrev(){checklistSection--;renderChecklistSection();}
function cancelChecklist(){document.getElementById('checklist-overlay')?.remove();}
async function checklistSubmit(){
  // Build responses text grouped by section
  const lines=CHECKLIST_SECTIONS.map(sec=>{
    const si=CHECKLIST_SECTIONS.indexOf(sec);
    const itemLines=sec.items.map((item,ii)=>{
      const ans=checklistAnswers[`${si}_${ii}`]||'—';
      const note=checklistAnswers[`${si}_${ii}_note`]||'';
      const mark=ans==='yes'?'✓':ans==='no'?'✗':'—';
      return`  ${mark} ${item.q}${note?` [${note}]`:''}`;
    }).join('\n');
    return`${sec.icon} ${sec.title}\n${itemLines}`;
  }).join('\n\n');
  const responses=lines;
  cancelChecklist();
  try{
    // 1) Mark job Complete
    await updatePage(checklistJobId,{Status:wp('select','Complete')});
    // 2) Record for Ops Manager
    const key=`complete-${checklistJobId}`;notifTimestamps[key]=Date.now();
    localStorage.setItem('notif_ts',JSON.stringify(notifTimestamps));
    // 3) Auto-update property status to "Needs Inspection"
    const job=_cleanerJobs.find(j=>j.id===checklistJobId);
    if(job?.property){
      const prop=st.properties.find(p=>p.name===job.property);
      if(prop&&prop.propStatus==='Dirty'){
        await updatePage(prop.id,{'Property Status':wp('select','Needs Inspection')});
        prop.propStatus='Needs Inspection';
      }
    }
    // 4) Write checklist answers directly onto the cleaning job page
    await updatePage(checklistJobId,{
      'Submitted At':wp('date',new Date().toISOString().split('T')[0]),
      'Responses':wp('text',responses),
    }).catch(()=>{});
    // 5) Update local state
    if(job)job.status='Complete';
    toast('Job completed ✓');renderCleanerContent();
  }catch(e){toast('Error completing job: '+(e.message||e));}
}
