/* ── Detail Panel ───────────────────────────────────────── */
function openDetail(type,id){
  st.detailType=type;st.detailId=id;
  const item=type==='task'?st.tasks.find(t=>t.id===id):type==='wo'?st.workOrders.find(w=>w.id===id):st.cleaningJobs.find(j=>j.id===id);
  if(!item)return;
  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('dp-title').textContent=item.name||'Detail';
  document.getElementById('dp-notion-link').href=item.url||'#';
  document.getElementById('dp-body').innerHTML=renderDetailBody(type,item);
  loadComments(id);
}
function closeDetail(){st.detailType=null;st.detailId=null;document.getElementById('detail-panel').classList.remove('open');}

function renderDetailBody(type,item){
  let fields='',extra='';
  if(type==='task'){
    fields=`
      <div class="detail-field"><div class="df-label">Status</div><div class="df-val"><select onchange="updateField('task','${aa(item.id)}','Status','select',this.value)">${['Open','In Progress','Blocked','Done'].map(s=>`<option${item.status===s?' selected':''}>${s}</option>`).join('')}</select></div></div>
      <div class="detail-field"><div class="df-label">Priority</div><div class="df-val"><select onchange="updateField('task','${aa(item.id)}','Priority','select',this.value)"><option value=""${!item.priority?' selected':''}>—</option>${['High','Medium','Low'].map(p=>`<option${item.priority===p?' selected':''}>${p}</option>`).join('')}</select></div></div>
      <div class="detail-field"><div class="df-label">Property</div><div class="df-val"><select onchange="updateField('task','${aa(item.id)}','Property','text',this.value)"><option value="">— none —</option>${st.properties.map(p=>`<option${item.property===p.name?' selected':''}>${h(p.name)}</option>`).join('')}</select></div></div>
      <div class="detail-field"><div class="df-label">Assignee</div><div class="df-val"><select onchange="updateField('task','${aa(item.id)}','Assignee','text',this.value)"><option value=""${!item.assignee?' selected':''}>— none —</option>${(loginUsers.length?loginUsers.filter(u=>u.role!=='Cleaner'):TEAM).map(u=>`<option${item.assignee&&item.assignee.includes(u.name)?' selected':''}>${h(u.name)}</option>`).join('')}</select></div></div>
      <div class="detail-field"><div class="df-label">Deadline</div><div class="df-val"><input type="date" value="${h(item.deadline||'')}" style="border:1px solid #d5d4d0;border-radius:5px;padding:2px 6px;font-size:12px;font-family:inherit;color:#1a1a1a;" onchange="updateField('task','${aa(item.id)}','Deadline','date',this.value)"></div></div>
      <div class="detail-field"><div class="df-label">Created by</div><div class="df-val">${h(item.createdBy)||'—'}</div></div>
      ${item.description?`<div class="detail-field"><div class="df-label">Description</div><div class="df-val" style="white-space:pre-wrap;line-height:1.5;">${h(item.description)}</div></div>`:''}`;
    const wos=Array.isArray(item.linkedWOs)?item.linkedWOs:[];
    extra=`<div class="detail-section"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><div class="detail-section-label">Linked Work Orders (${wos.length})</div><button class="btn btn-sm btn-primary" onclick="openModal('wo',{linkedTaskId:'${aa(item.id)}',linkedTaskName:'${aa(item.name)}',property:'${aa(item.property)}'})">+ Add Work Order</button></div><div class="linked-list">${wos.length?wos.map(w=>`<div class="linked-item"><span class="linked-item-name">${h(w.name||w)}</span></div>`).join(''):'<div style="font-size:12px;color:#aaa;">No linked work orders</div>'}</div></div>`;
  }else if(type==='wo'){
    fields=`
      <div class="detail-field"><div class="df-label">Status</div><div class="df-val"><select onchange="updateField('wo','${aa(item.id)}','Status','select',this.value)">${['Draft','Active','In Progress','Complete','On Hold','Cancelled'].map(s=>`<option${item.status===s?' selected':''}>${s}</option>`).join('')}</select></div></div>
      <div class="detail-field"><div class="df-label">Property</div><div class="df-val">${h(item.property)||'—'}</div></div>
      <div class="detail-field"><div class="df-label">Contractor</div><div class="df-val">${h(item.contractor)||'—'}</div></div>
      <div class="detail-field"><div class="df-label">Supervisor</div><div class="df-val">${h(item.supervisor)||'—'} ${avFor(item.supervisor)}</div></div>
      <div class="detail-field"><div class="df-label">Est. Cost</div><div class="df-val">${fmtMoney(item.estCost)}</div></div>
      <div class="detail-field"><div class="df-label">Est. Completion</div><div class="df-val">${item.estCompletion?fmtRelDate(item.estCompletion):'—'}</div></div>
      ${item.linkedTask?`<div class="detail-field"><div class="df-label">Linked Task</div><div class="df-val"><button class="btn-ghost" onclick="openDetail('task','${aa(item.linkedTask.id||'')}')">${h(item.linkedTask.name||'View task')}</button></div></div>`:''}
      ${item.description?`<div class="detail-field"><div class="df-label">Description</div><div class="df-val" style="white-space:pre-wrap;line-height:1.5;">${h(item.description)}</div></div>`:''}`;
    const pays=Array.isArray(item.payments)?item.payments:[];
    const payTotal=pays.reduce((s,p)=>s+(p.amount||0),0);
    extra=`<div class="detail-section"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;"><div class="detail-section-label">Payments${pays.length?` · ${fmtMoney(payTotal)}`:''} (${pays.length})</div><button class="btn btn-sm btn-primary" onclick="openModal('payment',{woId:'${aa(item.id)}',woName:'${aa(item.name)}'})" >+ Add Payment</button></div><div class="linked-list">${pays.length?pays.map(p=>`<div class="linked-item"><span class="linked-item-name">${h(p.name||'Payment')}</span>${p.amount?`<span style="font-size:11px;font-weight:600;color:#166534;">${fmtMoney(p.amount)}</span>`:''}</div>`).join(''):'<div style="font-size:12px;color:#aaa;">No payments yet</div>'}</div></div>`;
  }else if(type==='cleaning'){
    fields=`
      <div class="detail-field"><div class="df-label">Status</div><div class="df-val"><select onchange="updateField('cleaning','${aa(item.id)}','Status','select',this.value)">${['Scheduled','Accepted','In Progress','Complete','Cancelled'].map(s=>`<option${item.status===s?' selected':''}>${s}</option>`).join('')}</select></div></div>
      <div class="detail-field"><div class="df-label">Paid?</div><div class="df-val"><label style="cursor:pointer;display:flex;align-items:center;gap:6px;"><input type="checkbox" ${item.paid?'checked':''} onchange="updateField('cleaning','${aa(item.id)}','Paid?','checkbox',this.checked)"><span>${item.paid?'✓ Paid':'Not paid'}</span></label></div></div>
      <div class="detail-field"><div class="df-label">Property</div><div class="df-val">${h(item.property)||'—'}</div></div>
      <div class="detail-field"><div class="df-label">Cleaner</div><div class="df-val">${h(item.cleaner)||'—'}</div></div>
      <div class="detail-field"><div class="df-label">Type of Clean</div><div class="df-val">${h(item.type)||'—'}</div></div>
      <div class="detail-field"><div class="df-label">Agreed Rate</div><div class="df-val">${fmtMoney(item.rate)}</div></div>
      <div class="detail-field"><div class="df-label">Deadline</div><div class="df-val">${item.deadline?fmtRelDate(item.deadline):'—'}</div></div>
      ${item.notes?`<div class="detail-field"><div class="df-label">Notes</div><div class="df-val" style="white-space:pre-wrap;line-height:1.5;">${h(item.notes)}</div></div>`:''}
      ${item.gResv?`<div class="detail-field"><div class="df-label">Reservation</div><div class="df-val" style="font-size:12px;"><div style="font-weight:500;">${h(item.gResv.listingName||'')}</div><div style="color:#555;">👤 ${h(item.gResv.guestName||'')}</div><div style="color:#888;">${item.gResv.checkIn?`↓ ${new Date(item.gResv.checkIn+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:''} → ${item.gResv.checkOut?`↑ ${new Date(item.gResv.checkOut+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'})}`:''}</div><div style="color:#aaa;font-size:10px;">ID: ${h(item.gResv.id||'')}</div></div></div>`:''}`;
  }
  return`<div class="detail-section"><div class="detail-section-label">${t('Details')}</div>${fields}</div>${extra}<div class="detail-section"><div class="detail-section-label" style="margin-bottom:10px;">${t('Comments')}</div><div id="dp-comments" class="comment-list"><div style="color:#aaa;font-size:12px;">${t('Loading…')}</div></div><div class="comment-input-wrap"><textarea class="comment-input" id="dp-comment-input" rows="2" placeholder="${t('Add a comment…')}"></textarea><button class="btn btn-primary" style="align-self:flex-end;" onclick="submitComment('${aa(item.id)}')">${t('Send')}</button></div></div>`;
}

async function updateField(type,id,field,propType,value){
  try{
    const props={};
    if(propType==='select')props[field]=wp('select',value);
    else if(propType==='checkbox')props[field]=wp('checkbox',value);
    else props[field]=wp('text',value);
    await updatePage(id,props);
    const item=type==='task'?st.tasks.find(t=>t.id===id):type==='wo'?st.workOrders.find(w=>w.id===id):st.cleaningJobs.find(j=>j.id===id);
    if(item){
      if(field==='Status')item.status=value;
      else if(field==='Priority')item.priority=value;
      else if(field==='Paid?')item.paid=value;
      else if(field==='Property')item.property=value;
      else if(field==='Assignee')item.assignee=value;
      else if(field==='Deadline')item.deadline=value;
    }
    toast('Updated ✓');renderSection();
  }catch(e){toast('Error: '+(e.message||e));}
}

/* ── Comments ───────────────────────────────────────────── */
let deletedCommentIds=JSON.parse(localStorage.getItem('deleted_comments')||'[]');
let editingCommentId=null;

function markCommentDeleted(commentId,pageId){
  if(!deletedCommentIds.includes(commentId))deletedCommentIds.push(commentId);
  localStorage.setItem('deleted_comments',JSON.stringify(deletedCommentIds));
  loadComments(pageId);
}

function startEditComment(commentId,pageId,currentBody){
  editingCommentId=commentId;
  const el=document.getElementById('dp-comments');
  if(!el)return;
  const cards=el.querySelectorAll('.comment');
  cards.forEach(card=>{
    if(card.dataset.cid===commentId){
      card.innerHTML=`<textarea id="edit-comment-ta" style="width:100%;padding:6px;border:1px solid #7F77DD;border-radius:6px;font-size:13px;font-family:inherit;resize:none;" rows="3">${currentBody.replace(/</g,'&lt;')}</textarea><div style="display:flex;gap:6px;margin-top:5px;"><button class="btn btn-primary btn-sm" onclick="submitEditComment('${aa(commentId)}','${aa(pageId)}')">Save</button><button class="btn btn-sm" onclick="editingCommentId=null;loadComments('${aa(pageId)}')">Cancel</button></div>`;
      card.querySelector('#edit-comment-ta').focus();
    }
  });
}

async function submitEditComment(commentId,pageId){
  const ta=document.getElementById('edit-comment-ta');
  const newBody=(ta?.value||'').trim();if(!newBody)return;
  const name=currentSession?.name||'Team';
  const prefixed=`[${name}]: ${newBody}`;
  try{
    markCommentDeleted(commentId,pageId);
    await addComment(pageId,prefixed);
    editingCommentId=null;
    toast('Comment updated ✓');
    loadComments(pageId);
  }catch(e){toast('Error: '+(e.message||e));}
}

async function loadComments(pageId){
  const el=document.getElementById('dp-comments');if(!el)return;
  try{
    const res=await getComments(pageId);
    const comments=(res.results||[]).filter(c=>!deletedCommentIds.includes(c.id));
    if(!comments.length){el.innerHTML='<div style="color:#aaa;font-size:12px;">No comments yet</div>';return;}
    el.innerHTML=comments.map(c=>{
      const rawText=(c.rich_text||[]).map(rt=>rt.plain_text||rt.text?.content||'').join('');
      const match=rawText.match(/^\[([^\]]+?)\]:\s([\s\S]*)$/);
      const author=match?match[1].split(' · ')[0]:(c.created_by?.name||'Team');
      const body=match?match[2]:rawText;
      const timeStr=c.created_time?fmtRelTime(c.created_time):'';
      const isMe=author===currentSession?.name;
      const actions=isMe?`<span style="display:flex;gap:4px;opacity:0.6;"><button onclick="startEditComment('${aa(c.id)}','${aa(pageId)}','${aa(body)}')" style="background:none;border:none;cursor:pointer;font-size:11px;color:#7F77DD;padding:0 2px;" title="Edit">✏️</button><button onclick="markCommentDeleted('${aa(c.id)}','${aa(pageId)}')" style="background:none;border:none;cursor:pointer;font-size:11px;color:#ef4444;padding:0 2px;" title="Delete">🗑</button></span>`:'';
      return`<div class="comment" data-cid="${h(c.id)}"><div class="comment-author" style="display:flex;align-items:center;justify-content:space-between;"><span style="font-weight:600;">${h(author)}<span style="font-weight:400;color:#aaa;font-size:10px;"> · ${h(timeStr)}</span></span>${actions}</div><div class="comment-text">${h(body)}</div></div>`;
    }).join('');
  }catch(e){if(el)el.innerHTML='<div style="color:#aaa;font-size:12px;">Comments unavailable</div>';}
}

async function submitComment(pageId){
  const inp=document.getElementById('dp-comment-input');
  const text=(inp?.value||'').trim();if(!text)return;
  const name=currentSession?.name||'Team';
  const prefixed=`[${name}]: ${text}`;
  inp.value='';inp.disabled=true;
  try{await addComment(pageId,prefixed);toast('Comment added ✓');loadComments(pageId);}
  catch(e){toast('Error: '+(e.message||e));}
  finally{if(inp)inp.disabled=false;}
}
