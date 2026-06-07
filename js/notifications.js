/* ── Notifications ──────────────────────────────────────── */
let notifState={items:[],loading:false,lastSeen:parseInt(localStorage.getItem('notif_last_seen')||'0')};
let archivedNotifIds=JSON.parse(localStorage.getItem('archived_notifs')||'[]');
function archiveNotif(nid,e){
  e.stopPropagation();
  if(!archivedNotifIds.includes(nid))archivedNotifIds.push(nid);
  localStorage.setItem('archived_notifs',JSON.stringify(archivedNotifIds));
  renderSection();
}
function clearAllNotifs(){
  archivedNotifIds=[...archivedNotifIds,...notifState.items.map(n=>n.id)];
  localStorage.setItem('archived_notifs',JSON.stringify(archivedNotifIds));
  renderSection();
}
function renderNotificationsView(){
  if(notifState.loading)return'<div class="loading-msg">Loading notifications…</div>';
  const visible=notifState.items.filter(n=>!archivedNotifIds.includes(n.id));
  const newCount=visible.filter(n=>n.ts>notifState.lastSeen).length;
  if(!visible.length)return`<div class="empty"><div class="empty-icon">🔔</div><div>All caught up!</div></div>`;
  return`<div>
    <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
      <button class="btn btn-sm" onclick="clearAllNotifs()">Archive all</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:6px;">${visible.map(n=>{
    const isNew=n.ts>notifState.lastSeen;
    return`<div class="list-item" style="${isNew?'border-left:3px solid #7F77DD;background:#faf9ff;':''}" onclick="openDetail('${n.type}','${aa(n.itemId)}')">
      <div class="list-item-main">
        <div class="list-item-title" style="display:flex;align-items:center;gap:6px;">
          <span>${n.icon}</span><span>${h(n.title)}</span>${isNew?`<span style="background:#7F77DD;color:#fff;font-size:9px;padding:1px 6px;border-radius:99px;font-weight:700;">NEW</span>`:''}
        </div>
        <div style="font-size:11px;color:#888;margin-top:2px;">${h(n.detail)}</div>
        <div style="font-size:10px;color:#bbb;margin-top:2px;">${h(n.timeStr)}</div>
      </div>
      <button onclick="archiveNotif('${aa(n.id)}',event)" style="background:none;border:none;cursor:pointer;color:#ccc;font-size:14px;padding:4px 6px;flex-shrink:0;" title="Archive">✕</button>
    </div>`;
  }).join('')}</div></div>`;
}
async function loadNotifications(){
  const user=currentSession?.name||'';
  notifState.loading=true;renderSection();
  const items=[];
  try{
    // Tasks assigned to me — record first-seen time so "received" is stable
    const myTasks=st.tasks.filter(t=>t.assignee&&t.assignee.toLowerCase().includes(user.toLowerCase()));
    let tsChanged=false;
    myTasks.forEach(t=>{
      const key=`task-${t.id}`;
      if(!notifTimestamps[key]){notifTimestamps[key]=Date.now();tsChanged=true;}
      const ts=notifTimestamps[key];
      items.push({
        id:key,type:'task',itemId:t.id,icon:'📋',
        title:`Task assigned to you: ${t.name}`,
        detail:`${t.property?t.property+' · ':''}${t.status}${t.deadline?' · Due '+fmtRelDate(t.deadline):''}`,
        ts,timeStr:fmtRelTime(new Date(ts).toISOString()),
      });
    });
    if(tsChanged)localStorage.setItem('notif_ts',JSON.stringify(notifTimestamps));
    // Fetch comments on tasks/WOs involving current user (limit API calls)
    const myItems=[
      ...st.tasks.filter(t=>t.assignee&&t.assignee.toLowerCase().includes(user.toLowerCase())),
      ...st.workOrders.filter(w=>w.supervisor&&w.supervisor.toLowerCase().includes(user.toLowerCase())),
    ].slice(0,10);
    await Promise.all(myItems.map(async item=>{
      try{
        const res=await getComments(item.id);
        (res.results||[]).filter(c=>!deletedCommentIds.includes(c.id)).forEach(c=>{
          const rawText=(c.rich_text||[]).map(rt=>rt.plain_text||rt.text?.content||'').join('');
          const match=rawText.match(/^\[([^\]]+?)\]:\s([\s\S]*)$/);
          const author=match?match[1].split(' · ')[0]:(c.created_by?.name||'Team');
          const body=match?match[2]:rawText;
          const ts=c.created_time?new Date(c.created_time).getTime():0;
          if(author!==user){
            items.push({
              id:`comment-${c.id}`,
              type:item.status!==undefined?'task':'wo',
              itemId:item.id,icon:'💬',
              title:`${author} commented on "${item.name}"`,
              detail:body.substring(0,80)+(body.length>80?'…':''),
              ts,timeStr:c.created_time?fmtRelTime(c.created_time):'',
            });
          }
        });
      }catch{}
    }));
    // Operations Manager: receive activity for ALL cleaning jobs
    if(currentSession?.role==='Operations Manager'){
      let opsChanged=false;
      st.cleaningJobs.forEach(j=>{
        if(j.status==='Accepted'){
          const key=`accept-${j.id}`;
          if(!notifTimestamps[key]){notifTimestamps[key]=Date.now();opsChanged=true;}
          items.push({id:key,type:'cleaning',itemId:j.id,icon:'✅',
            title:`Job accepted: ${j.name}`,
            detail:`${j.cleaner?j.cleaner+' · ':''}${j.property||''}`,
            ts:notifTimestamps[key],timeStr:fmtRelTime(new Date(notifTimestamps[key]).toISOString())});
        }
        if(j.status==='Complete'){
          const key=`complete-${j.id}`;
          if(!notifTimestamps[key]){notifTimestamps[key]=Date.now();opsChanged=true;}
          items.push({id:key,type:'cleaning',itemId:j.id,icon:'🏁',
            title:`Job completed: ${j.name}`,
            detail:`${j.cleaner?j.cleaner+' · ':''}${j.property||''}`,
            ts:notifTimestamps[key],timeStr:fmtRelTime(new Date(notifTimestamps[key]).toISOString())});
        }
      });
      if(opsChanged)localStorage.setItem('notif_ts',JSON.stringify(notifTimestamps));
    }
    items.sort((a,b)=>b.ts-a.ts);
  }catch(e){console.error('notifications',e);}
  notifState.items=items;
  notifState.loading=false;
  // Update unread badge
  updateNotifBadge();
  // Mark all as seen after a short delay (so NEW labels show briefly)
  setTimeout(()=>{
    notifState.lastSeen=Date.now();
    localStorage.setItem('notif_last_seen',notifState.lastSeen.toString());
    renderSection();
  },3000);
  renderSection();
}
function updateNotifBadge(){
  const visible=notifState.items.filter(n=>!archivedNotifIds.includes(n.id));
  const newCount=visible.filter(n=>n.ts>notifState.lastSeen).length;
  const badge=document.getElementById('notif-badge-sb');
  if(badge)badge.textContent=newCount>0?`Notifications (${newCount})`:'Notifications';
}
