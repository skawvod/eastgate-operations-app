/* ── Modals ─────────────────────────────────────────────── */
function openModal(type,prefill){
  st.modalType=type;st.modalPrefill=prefill||{};
  document.getElementById('modal-overlay').style.display='flex';
  const box=document.getElementById('modal-box');
  if(type==='task')box.innerHTML=taskForm();
  else if(type==='wo')box.innerHTML=woForm();
  else if(type==='cleaning'){box.innerHTML=cleaningForm();loadResvDropdown();}
  else if(type==='payment')box.innerHTML=paymentForm();
  else if(type==='newcleaner')box.innerHTML=newCleanerForm();
  else if(type==='newcontractor')box.innerHTML=newContractorForm();
}
function closeModal(){document.getElementById('modal-overlay').style.display='none';}
function openNewModal(){openModal(st.section==='workorders'?'wo':st.section==='cleaning'?'cleaning':'task');}
function propOptions(){return st.properties.map(p=>`<option>${h(p.name)}</option>`).join('');}
function teamOptions(){
  const users=loginUsers.length?loginUsers.filter(u=>u.role!=='Cleaner'):TEAM;
  return users.map(u=>`<option>${h(u.name)}</option>`).join('');
}

function taskForm(){
  return`<div class="modal-title">New Task</div>
    <div class="frow"><label class="flabel">Task name *</label><input class="finput" id="f-name" placeholder="e.g. Fix AC – Villa Marina"></div>
    <div class="fgrid"><div class="frow"><label class="flabel">Property</label><select class="finput" id="f-prop"><option value="">— select —</option>${propOptions()}</select></div><div class="frow"><label class="flabel">Priority</label><select class="finput" id="f-prio"><option value="">— select —</option><option>High</option><option>Medium</option><option>Low</option></select></div></div>
    <div class="fgrid"><div class="frow"><label class="flabel">Assign to</label><select class="finput" id="f-assignee"><option value="">— select —</option>${teamOptions()}</select></div><div class="frow"><label class="flabel">Deadline</label><input class="finput" type="date" id="f-deadline"></div></div>
    <div class="frow"><label class="flabel">Description</label><textarea class="finput" id="f-desc" rows="3" placeholder="Optional details…"></textarea></div>
    <div class="mactions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" id="submit-btn" onclick="submitTask()">Create Task</button></div>`;
}

function woForm(){
  const p=st.modalPrefill;
  const contrOpts=st.contractors.filter(c=>c.active).map(c=>`<option>${h(c.name)}${c.specialty?` (${c.specialty})`:''}</option>`).join('');
  return`<div class="modal-title">New Work Order</div>
    <div class="frow"><label class="flabel">Work order name *</label><input class="finput" id="f-name" placeholder="e.g. Plumbing repair – Maple View"></div>
    <div class="fgrid"><div class="frow"><label class="flabel">Property</label><select class="finput" id="f-prop"><option value="">— select —</option>${propOptions()}</select></div><div class="frow"><label class="flabel">Status</label><select class="finput" id="f-status"><option>Draft</option><option>Active</option><option>In Progress</option></select></div></div>
    <div class="frow"><label class="flabel">Contractor</label><select class="finput" id="f-contractor"><option value="">— select —</option>${contrOpts}<option value="__new__">+ Add new contractor…</option></select></div>
    <div class="fgrid"><div class="frow"><label class="flabel">Supervisor</label><select class="finput" id="f-supervisor"><option value="">— select —</option>${teamOptions()}</select></div><div class="frow"><label class="flabel">Est. Cost ($)</label><input class="finput" type="number" id="f-cost" placeholder="0"></div></div>
    <div class="frow"><label class="flabel">Est. Completion</label><input class="finput" type="date" id="f-completion"></div>
    <div class="frow"><label class="flabel">Description</label><textarea class="finput" id="f-desc" rows="2" placeholder="Optional details…"></textarea></div>
    ${p.linkedTaskId?`<input type="hidden" id="f-linked-task-id" value="${h(p.linkedTaskId)}"><input type="hidden" id="f-linked-task-name" value="${h(p.linkedTaskName||'')}"><div style="font-size:11px;color:#7F77DD;margin-bottom:8px;">Linked to task: <strong>${h(p.linkedTaskName||p.linkedTaskId)}</strong></div>`:''}
    <div class="mactions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" id="submit-btn" onclick="submitWO()">Create Work Order</button></div>`;
}

function cleaningForm(){
  const cleanerOpts=st.cleaners.filter(c=>c.active).map(c=>`<option>${h(c.name)}</option>`).join('');
  return`<div class="modal-title">${t('New Cleaning Job')}</div>
    <div class="frow"><label class="flabel">${t('Link to Guesty reservation')} <span style="font-size:10px;color:#aaa;">(${t('optional — auto-fills property & deadline')})</span></label><div style="display:flex;gap:6px;align-items:center;"><select class="finput" id="f-resv" onchange="onReservationSelect(this)" style="flex:1;"><option value="">— ${t('Loading…')} —</option></select><button class="btn btn-sm" type="button" onclick="loadResvDropdown()" title="Reload">↻</button></div><div id="f-resv-detail" style="font-size:11px;color:#7F77DD;margin-top:4px;min-height:14px;"></div></div>
    <div class="frow"><label class="flabel">${t('Job name')} *</label><input class="finput" id="f-name" placeholder="e.g. Turnover – Villa Marina"></div>
    <div class="fgrid"><div class="frow"><label class="flabel">${t('Property')}</label><select class="finput" id="f-prop"><option value="">— ${t('select')} —</option>${propOptions()}</select></div><div class="frow"><label class="flabel">${t('Type of clean')}</label><select class="finput" id="f-type"><option value="Regular Turnover">${t('Regular Turnover')}</option><option value="Deep Clean">${t('Deep Clean')}</option><option value="Move-in / Move-out">${t('Move-in / Move-out')}</option><option value="Other">${t('Other')}</option></select></div></div>
    <div class="frow"><label class="flabel">${t('Cleaner')}</label><select class="finput" id="f-cleaner" onchange="if(this.value==='__new__')openModal('newcleaner')"><option value="">— ${t('select')} —</option>${cleanerOpts}<option value="__new__">+ ${t('Add new cleaner…')}</option></select></div>
    <div class="fgrid"><div class="frow"><label class="flabel">${t('Agreed rate ($)')}</label><input class="finput" type="number" id="f-rate" placeholder="0"></div><div class="frow"><label class="flabel">${t('Deadline')}</label><input class="finput" type="date" id="f-deadline"></div></div>
    <div class="frow"><label class="flabel">${t('Status')}</label><select class="finput" id="f-status"><option value="Scheduled">${t('Scheduled')}</option><option value="In Progress">${t('In Progress')}</option><option value="Complete">${t('Complete')}</option><option value="Cancelled">${t('Cancelled')}</option></select></div>
    <div class="frow"><label class="flabel">${t('Notes')}</label><textarea class="finput" id="f-notes" rows="2" placeholder="${t('Access codes, special instructions…')}"></textarea></div>
    <div class="mactions"><button class="btn" onclick="closeModal()">${t('Cancel')}</button><button class="btn btn-primary" id="submit-btn" onclick="submitCleaning()">${t('Create Cleaning Job')}</button></div>`;
}

function paymentForm(){
  const p=st.modalPrefill;
  return`<div class="modal-title">${t('Add Payment')}</div>
    <div class="frow"><label class="flabel">${t('Payment name *')}</label><input class="finput" id="f-name" value="${h(p.woName?'Payment – '+p.woName:'')}"></div>
    ${p.woName?`<div style="font-size:11px;color:#7F77DD;margin-bottom:10px;">${t('Work Orders').replace(/s$/,'')}: <strong>${h(p.woName)}</strong></div>`:''}
    <div class="fgrid"><div class="frow"><label class="flabel">${t('Amount paid ($) *')}</label><input class="finput" type="number" id="f-amount" placeholder="0"></div><div class="frow"><label class="flabel">${t('Payment date')}</label><input class="finput" type="date" id="f-date" value="${new Date().toISOString().split('T')[0]}"></div></div>
    <div class="frow"><label class="flabel">${t('Receipt image URL')}</label><input class="finput" id="f-receipt" placeholder="Paste image URL or leave blank"></div>
    <div class="frow"><label class="flabel">${t('Notes')}</label><textarea class="finput" id="f-notes" rows="2" placeholder="e.g. Invoice #1234, deposit"></textarea></div>
    <div class="mactions"><button class="btn" onclick="closeModal()">${t('Cancel')}</button><button class="btn btn-primary" id="submit-btn" onclick="submitPayment()">${t('Save Payment')}</button></div>`;
}

function newCleanerForm(){
  return`<div class="modal-title">${t('Add New Cleaner')}</div>
    <div class="frow"><label class="flabel">${t('Name *')}</label><input class="finput" id="f-name" placeholder="${t('Full name')}"></div>
    <div class="fgrid"><div class="frow"><label class="flabel">${t('Phone')}</label><input class="finput" id="f-phone" type="tel"></div><div class="frow"><label class="flabel">${t('Default rate ($/job)')}</label><input class="finput" id="f-rate" type="number"></div></div>
    <div class="frow"><label class="flabel">${t('Email')}</label><input class="finput" id="f-email" type="email"></div>
    <div class="frow"><label class="flabel">${t('Notes')}</label><textarea class="finput" id="f-notes" rows="2"></textarea></div>
    <div class="mactions"><button class="btn" onclick="openModal('cleaning')">← ${t('Back')}</button><button class="btn btn-primary" id="submit-btn" onclick="submitNewCleaner()">${t('Add Cleaner')}</button></div>`;
}

function newContractorForm(){
  return`<div class="modal-title">Add New Contractor</div>
    <div class="frow"><label class="flabel">Name / Company *</label><input class="finput" id="f-name"></div>
    <div class="fgrid"><div class="frow"><label class="flabel">Specialty</label><select class="finput" id="f-specialty"><option>General</option><option>Plumbing</option><option>Electrical</option><option>Carpentry</option><option>HVAC</option><option>Painting</option><option>Landscaping</option><option>Other</option></select></div><div class="frow"><label class="flabel">Phone</label><input class="finput" id="f-phone" type="tel"></div></div>
    <div class="frow"><label class="flabel">Email</label><input class="finput" id="f-email" type="email"></div>
    <div class="frow"><label class="flabel">Notes</label><textarea class="finput" id="f-notes" rows="2"></textarea></div>
    <div class="mactions"><button class="btn" onclick="openModal('wo',st.modalPrefill)">← Back</button><button class="btn btn-primary" id="submit-btn" onclick="submitNewContractor()">Add Contractor</button></div>`;
}

/* ── Submit functions ───────────────────────────────────── */
async function submitTask(){
  const name=document.getElementById('f-name')?.value.trim();if(!name){alert('Task name is required');return;}
  const btn=document.getElementById('submit-btn');btn.textContent='Creating…';btn.disabled=true;
  try{
    const props={'Task Name':wp('title',name),'Status':wp('select','Open')};
    const prop_=document.getElementById('f-prop')?.value,prio=document.getElementById('f-prio')?.value,assignee=document.getElementById('f-assignee')?.value,deadline=document.getElementById('f-deadline')?.value,desc=document.getElementById('f-desc')?.value.trim();
    if(prop_)props.Property=wp('text',prop_);if(prio)props.Priority=wp('select',prio);if(assignee)props.Assignee=wp('text',assignee);if(deadline)props.Deadline=wp('date',deadline);if(desc)props.Description=wp('text',desc);
    props['Created By']=wp('text',currentSession?.name||'');
    await createPage(DBID_TASKS,props);closeModal();toast('Task created ✓');await loadAll();
  }catch(e){alert('Error: '+(e.message||e));}
  finally{btn.textContent='Create Task';btn.disabled=false;}
}

async function submitWO(){
  const name=document.getElementById('f-name')?.value.trim();if(!name){alert('Work order name is required');return;}
  const btn=document.getElementById('submit-btn');btn.textContent='Creating…';btn.disabled=true;
  try{
    const status=document.getElementById('f-status')?.value||'Draft';
    const props={'Work Order Name':wp('title',name),'Status':wp('select',status)};
    const prop_=document.getElementById('f-prop')?.value,contr=document.getElementById('f-contractor')?.value,super_=document.getElementById('f-supervisor')?.value,cost=document.getElementById('f-cost')?.value,completion=document.getElementById('f-completion')?.value,desc=document.getElementById('f-desc')?.value.trim();
    const linkedTaskId=document.getElementById('f-linked-task-id')?.value,linkedTaskName=document.getElementById('f-linked-task-name')?.value;
    if(prop_)props.Property=wp('text',prop_);if(contr&&contr!=='__new__')props.Contractor=wp('text',contr);if(super_)props.Supervisor=wp('text',super_);if(cost)props['Est. Cost']=wp('number',parseFloat(cost));if(completion)props['Est. Completion']=wp('date',completion);if(desc)props.Description=wp('text',desc);
    if(linkedTaskId)props['Linked Task']=wp('text',JSON.stringify({id:linkedTaskId,name:linkedTaskName||linkedTaskId}));
    const res=await createPage(DBID_WO,props);
    if(linkedTaskId){
      const task=st.tasks.find(t=>t.id===linkedTaskId);
      if(task){const existing=Array.isArray(task.linkedWOs)?task.linkedWOs:[];const updated=[...existing,{id:res.id||'',name,status}];await updatePage(linkedTaskId,{'Linked Work Orders':wp('text',JSON.stringify(updated))}).catch(()=>{});}
    }
    closeModal();toast('Work order created ✓');await loadAll();
  }catch(e){alert('Error: '+(e.message||e));}
  finally{btn.textContent='Create Work Order';btn.disabled=false;}
}

async function submitCleaning(){
  const name=document.getElementById('f-name')?.value.trim();if(!name){alert('Job name is required');return;}
  const btn=document.getElementById('submit-btn');btn.textContent='Creating…';btn.disabled=true;
  try{
    const props={'Job Name':wp('title',name),'Status':wp('select',document.getElementById('f-status')?.value||'Scheduled')};
    const prop_=document.getElementById('f-prop')?.value,cleaner=document.getElementById('f-cleaner')?.value,type=document.getElementById('f-type')?.value,rate=document.getElementById('f-rate')?.value,deadline=document.getElementById('f-deadline')?.value,notes=document.getElementById('f-notes')?.value.trim();
    if(prop_)props.Property=wp('text',prop_);if(cleaner&&cleaner!=='__new__')props.Cleaner=wp('text',cleaner);if(type)props['Type of Clean']=wp('select',type);if(rate)props['Agreed Rate']=wp('number',parseFloat(rate));if(deadline)props.Deadline=wp('date',deadline);if(notes)props.Notes=wp('text',notes);
    const resvSel=document.getElementById('f-resv');const resvJson=resvSel?.dataset?.resvJson;if(resvJson)props['Guesty Reservation']=wp('text',resvJson);
    await createPage(DBID_CLEANING,props);closeModal();toast('Cleaning job created ✓');await loadAll();
  }catch(e){alert('Error: '+(e.message||e));}
  finally{btn.textContent='Create Cleaning Job';btn.disabled=false;}
}

async function submitPayment(){
  const name=document.getElementById('f-name')?.value.trim(),amount=document.getElementById('f-amount')?.value;
  if(!name||!amount){alert('Name and amount are required');return;}
  const btn=document.getElementById('submit-btn');btn.textContent='Saving…';btn.disabled=true;
  try{
    const p=st.modalPrefill;
    const props={'Payment Name':wp('title',name),'Amount Paid':wp('number',parseFloat(amount))};
    const date=document.getElementById('f-date')?.value,notes=document.getElementById('f-notes')?.value.trim(),receipt=document.getElementById('f-receipt')?.value.trim();
    if(date)props['Payment Date']=wp('date',date);if(notes)props.Notes=wp('text',notes);if(receipt)props['Receipt Image URL']=wp('text',receipt);
    if(p.woId)props['Work Order']=wp('text',JSON.stringify({id:p.woId,name:p.woName||''}));
    const res=await createPage(DBID_PAYMENTS,props);
    if(p.woId){const wo=st.workOrders.find(w=>w.id===p.woId);if(wo){const existing=Array.isArray(wo.payments)?wo.payments:[];const updated=[...existing,{id:res.id||'',name,amount:parseFloat(amount)}];await updatePage(p.woId,{Payments:wp('text',JSON.stringify(updated))}).catch(()=>{});}}
    closeModal();toast('Payment saved ✓');await loadAll();
  }catch(e){alert('Error: '+(e.message||e));}
  finally{btn.textContent='Save Payment';btn.disabled=false;}
}

async function submitNewCleaner(){
  const name=document.getElementById('f-name')?.value.trim();if(!name){alert('Name is required');return;}
  const btn=document.getElementById('submit-btn');btn.textContent='Saving…';btn.disabled=true;
  try{
    const props={Name:wp('title',name),Active:wp('checkbox',true)};
    const phone=document.getElementById('f-phone')?.value.trim(),email=document.getElementById('f-email')?.value.trim(),rate=document.getElementById('f-rate')?.value,notes=document.getElementById('f-notes')?.value.trim();
    if(phone)props.Phone={phone_number:phone};if(email)props.Email={email};if(rate)props['Default Rate']=wp('number',parseFloat(rate));if(notes)props.Notes=wp('text',notes);
    await createPage(DBID_CLEANERS,props);toast('Cleaner added ✓');await loadAll();openModal('cleaning');
  }catch(e){alert('Error: '+(e.message||e));}finally{btn.textContent='Add Cleaner';btn.disabled=false;}
}

async function submitNewContractor(){
  const name=document.getElementById('f-name')?.value.trim();if(!name){alert('Name is required');return;}
  const btn=document.getElementById('submit-btn');btn.textContent='Saving…';btn.disabled=true;
  try{
    const props={Name:wp('title',name),Active:wp('checkbox',true)};
    const spec=document.getElementById('f-specialty')?.value,phone=document.getElementById('f-phone')?.value.trim(),email=document.getElementById('f-email')?.value.trim(),notes=document.getElementById('f-notes')?.value.trim();
    if(spec)props.Specialty=wp('select',spec);if(phone)props.Phone={phone_number:phone};if(email)props.Email={email};if(notes)props.Notes=wp('text',notes);
    await createPage(DBID_CONTRS,props);toast('Contractor added ✓');await loadAll();openModal('wo',st.modalPrefill);
  }catch(e){alert('Error: '+(e.message||e));}finally{btn.textContent='Add Contractor';btn.disabled=false;}
}
