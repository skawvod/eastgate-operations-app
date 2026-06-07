/* ── Guesty ─────────────────────────────────────────────── */
let gToken=null,gTokenExp=0;
const G_API='https://open-api.guesty.com/v1';
function _loadCachedGToken(){
  try{const tok=localStorage.getItem('g_tok'),e=parseInt(localStorage.getItem('g_tok_exp')||'0');if(tok&&Date.now()<e){gToken=tok;gTokenExp=e;}}catch(e){}
}
async function guestyToken(){
  if(!gToken)_loadCachedGToken();
  if(gToken&&Date.now()<gTokenExp)return gToken;
  const res=await fetch('/.netlify/functions/guesty-token');
  const d=await res.json();if(d.error)throw new Error(d.error);
  gToken=d.access_token;gTokenExp=Date.now()+(d.expires_in-60)*1000;
  try{localStorage.setItem('g_tok',gToken);localStorage.setItem('g_tok_exp',gTokenExp.toString());}catch(e){}
  return gToken;
}
async function gGet(path){const tok=await guestyToken();const r=await fetch(G_API+path,{headers:{Authorization:`Bearer ${tok}`}});if(!r.ok)throw new Error(`${path} → ${r.status}`);return r.json();}
const isoD=d=>d.toISOString().split('T')[0];
const addDays=(d,n)=>{const r=new Date(d);r.setDate(r.getDate()+n);return r;};

function guestyAddress(r){
  const addr=r.listing?.address||r.listing?.complexAddress||{};
  const city=addr.city||addr.neighborhood||'';
  const street=addr.street||'';
  const numMatch=street.match(/\d+/);const streetNum=numMatch?numMatch[0]:'';
  const apt=addr.apt||addr.unit||addr.unitNumber||'';
  if(city&&streetNum)return apt?`${city} ${streetNum}/${apt}`:`${city} ${streetNum}`;
  if(city&&street)return apt?`${city}, ${street}/${apt}`:`${city}, ${street}`;
  return r.listing?.nickname||r.listing?.title||'Property';
}

/* ── Property Status Board ──────────────────────────────── */
function setGuestyPanelTab(tab){
  propBoardTab=tab;localStorage.setItem('pb_tab',tab);
  document.getElementById('gpt-status')?.classList.toggle('active',tab==='status');
  document.getElementById('gpt-calendar')?.classList.toggle('active',tab==='calendar');
  if(tab==='status')renderPropStatusBoard();
  else loadGuestyCalendar();
}
function renderPropStatusBoard(){
  const el=document.getElementById('guesty-panel-content');if(!el)return;
  const COLS=[
    {key:'Dirty',color:'#ef4444',emoji:'🔴'},
    {key:'Unsure',color:'#eab308',emoji:'🟡'},
    {key:'Needs Inspection',color:'#f97316',emoji:'🟠'},
    {key:'Clean',color:'#22c55e',emoji:'🟢'},
  ];
  if(!st.properties.length){el.innerHTML='<div style="color:#aaa;font-size:12px;padding:8px 0;">No properties loaded yet.</div>';return;}
  el.innerHTML=`<div class="prop-board">${COLS.map(col=>{
    const props=st.properties.filter(p=>(p.propStatus||'Dirty')===col.key);
    return`<div class="prop-col"><div class="prop-col-head" style="border-top-color:${col.color};background:${col.color}10;">
      <span class="prop-col-title">${col.emoji} ${t(col.key)}</span><span class="kcnt">${props.length}</span></div>
      ${props.map(p=>`<div class="prop-item" onclick="openPropStatusModal('${aa(p.id)}','${aa(p.name)}','${aa(p.propStatus||'Dirty')}')"><div class="prop-item-name">${h(p.name)}</div></div>`).join('')||`<div style="font-size:11px;color:#ccc;text-align:center;padding:8px;">—</div>`}
    </div>`;
  }).join('')}</div>`;
}
function openPropStatusModal(id,name,cur){
  document.getElementById('modal-overlay').style.display='flex';
  const box=document.getElementById('modal-box');
  const STATUSES=['Dirty','Unsure','Needs Inspection','Clean'];
  const COLORS={Dirty:'#ef4444',Unsure:'#eab308','Needs Inspection':'#f97316',Clean:'#22c55e'};
  box.innerHTML=`<div class="modal-title">🏠 ${h(name)}</div>
    <div style="font-size:13px;color:#888;margin-bottom:14px;">Tap a status to update:</div>
    <div style="display:flex;flex-direction:column;gap:8px;">
      ${STATUSES.map(s=>`<button onclick="updatePropStatus('${aa(id)}','${aa(s)}')" style="padding:13px 16px;border:2px solid ${s===cur?COLORS[s]:'#e5e4e0'};border-radius:10px;background:${s===cur?COLORS[s]+'18':'#fff'};text-align:left;cursor:pointer;font-size:14px;font-family:inherit;display:flex;align-items:center;gap:10px;font-weight:${s===cur?'600':'400'};">
        <span style="width:10px;height:10px;border-radius:50%;background:${COLORS[s]};display:inline-block;flex-shrink:0;"></span>${t(s)}${s===cur?' <span style="font-size:10px;color:#aaa;margin-left:auto;">current</span>':''}
      </button>`).join('')}
    </div>
    <div class="mactions" style="margin-top:12px;"><button class="btn" onclick="closeModal()">Cancel</button></div>`;
}
async function updatePropStatus(id,newStatus){
  try{
    await updatePage(id,{'Property Status':wp('select',newStatus)});
    const prop=st.properties.find(p=>p.id===id);if(prop)prop.propStatus=newStatus;
    closeModal();toast('Property status updated ✓');renderPropStatusBoard();
  }catch(e){toast('Error: '+(e.message||e));}
}

/* ── Guesty Calendar ────────────────────────────────────── */
async function loadGuestyCalendar(){
  const el=document.getElementById('guesty-panel-content');if(!el)return;
  el.innerHTML=`<div class="guesty-panel-stats"><div class="guesty-dot loading" id="guesty-dot"></div><span id="guesty-status-text">Connecting to Guesty…</span></div><div id="guesty-cal"></div>`;
  const dot=document.getElementById('guesty-dot'),stxt=document.getElementById('guesty-status-text'),gcal=document.getElementById('guesty-cal');
  try{
    const today=new Date();today.setHours(0,0,0,0);
    const todayStr=isoD(today),endStr=isoD(addDays(today,14));
    const [ciR,coR]=await Promise.all([
      gGet(`/reservations?checkInDateFrom=${todayStr}&checkInDateTo=${endStr}&status=confirmed&limit=200`),
      gGet(`/reservations?checkOutDateFrom=${todayStr}&checkOutDateTo=${endStr}&status=confirmed&limit=200`)
    ]);
    cachedGuestyData={ci:ciR.results||ciR.data||[],co:coR.results||coR.data||[],todayStr,today};
    dot.className='guesty-dot';stxt.textContent=`Guesty — live · ${cachedGuestyData.ci.length+cachedGuestyData.co.length} movements next 14 days`;
    renderGuestyCalendar(gcal);
  }catch(e){if(dot)dot.className='guesty-dot error';if(stxt)stxt.textContent='Guesty unavailable';if(gcal)gcal.innerHTML=`<div class="guesty-error" style="color:#999;font-size:11px;padding:4px 0;">${h(e.message)}</div>`;}
}
function renderGuestyCalendar(gcal){
  if(!gcal||!cachedGuestyData)return;
  const {ci,co,todayStr,today}=cachedGuestyData;
  const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const days=[];for(let i=0;i<14;i++)days.push(addDays(today,i));
  gcal.innerHTML='<div class="cal-strip" style="padding:6px 0 10px;">'+days.map(day=>{
    const ds=isoD(day),isToday=ds===todayStr,isExp=!!expandedCalDays[ds];
    const ins=ci.filter(r=>(r.checkIn||'').startsWith(ds));
    const outs=co.filter(r=>(r.checkOut||'').startsWith(ds));
    const total=ins.length+outs.length;
    const evHtml=[
      ...ins.map(r=>`<div class="cal-ev ev-in" style="white-space:normal;">↓ ${h(guestyAddress(r))}</div>`),
      ...outs.map(r=>`<div class="cal-ev ev-out" style="white-space:normal;">↑ ${h(guestyAddress(r))}</div>`)
    ];
    const preview=evHtml.slice(0,isExp?999:2).join('');
    const moreBtn=total>2&&!isExp?`<div onclick="expandCalDay('${ds}')" style="font-size:9px;color:#7F77DD;cursor:pointer;margin-top:2px;">+${total-2} more…</div>`:
      total>2&&isExp?`<div onclick="expandCalDay('${ds}')" style="font-size:9px;color:#aaa;cursor:pointer;margin-top:2px;">Show less</div>`:'';
    return`<div class="cal-day${isToday?' today':''}" style="min-width:90px;cursor:default;">
      <div class="cal-dn">${dayNames[day.getDay()]}</div>
      <div class="cal-dd">${day.getDate()}</div>
      ${preview||'<div style="font-size:9px;color:#ddd;padding-top:2px;">—</div>'}
      ${moreBtn}
    </div>`;
  }).join('')+'</div>';
}
function expandCalDay(ds){
  expandedCalDays[ds]=!expandedCalDays[ds];
  renderGuestyCalendar(document.getElementById('guesty-cal'));
}
async function loadGuesty(){if(propBoardTab==='calendar')await loadGuestyCalendar();else renderPropStatusBoard();}

/* ── Reservation picker ─────────────────────────────────── */
let cachedResvs=[];
async function loadResvDropdown(){
  const sel=document.getElementById('f-resv');if(!sel)return;
  try{
    const today=new Date();today.setHours(0,0,0,0);
    const res=await gGet(`/reservations?checkOutDateFrom=${isoD(today)}&checkOutDateTo=${isoD(addDays(today,60))}&status=confirmed&limit=100`);
    cachedResvs=(res.results||res.data||[]).sort((a,b)=>(a.checkOut||'').localeCompare(b.checkOut||''));
    if(!sel)return;
    if(!cachedResvs.length){sel.innerHTML='<option value="">No upcoming checkouts</option>';return;}
    sel.innerHTML='<option value="">— skip / no reservation —</option>'+cachedResvs.map((r,i)=>{
      const addr=guestyAddress(r);
      const guest=(r.guest||r.guestInfo||{});const gName=`${guest.firstName||''} ${guest.lastName||''}`.trim()||'Guest';
      const co=(r.checkOut||'').split('T')[0];const coFmt=co?new Date(co+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'';
      return`<option value="${i}">↑ ${coFmt} · ${h(addr)} · ${h(gName)}</option>`;
    }).join('');
  }catch(e){if(sel)sel.innerHTML='<option value="">Guesty unavailable — fill manually</option>';}
}
function onReservationSelect(sel){
  const idx=parseInt(sel.value);const detail=document.getElementById('f-resv-detail');
  if(isNaN(idx)||!cachedResvs[idx]){if(detail)detail.textContent='';return;}
  const r=cachedResvs[idx];
  const addr=guestyAddress(r);
  const guest=(r.guest||r.guestInfo||{});const gName=`${guest.firstName||''} ${guest.lastName||''}`.trim()||'Guest';
  const co=(r.checkOut||'').split('T')[0];const ci=(r.checkIn||'').split('T')[0];
  const listingName=r.listing?.nickname||r.listing?.title||'';
  const fName=document.getElementById('f-name');const fProp=document.getElementById('f-prop');
  const fDeadline=document.getElementById('f-deadline');const fType=document.getElementById('f-type');
  if(fName&&!fName.value)fName.value=`Turnover – ${addr}`;
  if(fDeadline)fDeadline.value=co;if(fType)fType.value='Regular Turnover';
  if(fProp&&st.properties.length){
    const addrLower=addr.toLowerCase();const nameLower=listingName.toLowerCase();
    const city=(r.listing?.address?.city||'').toLowerCase();
    let match=st.properties.find(p=>{
      const pn=p.name.toLowerCase();
      return pn===nameLower||pn.includes(nameLower.split(' ')[0])||
        (city&&pn.includes(city))||addrLower.includes(pn.split(' ')[0]);
    });
    if(match)fProp.value=match.name;
  }
  if(detail)detail.innerHTML=`<span style="color:#7F77DD;font-weight:500;">${h(addr)}</span> · ${h(gName)} · ${ci?new Date(ci+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):''} → ${co?new Date(co+'T00:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):''} <span style="color:#aaa;font-size:10px;">ID: ${h(r.id)}</span>`;
  sel.dataset.resvJson=JSON.stringify({id:r.id,listingName:addr,guestName:gName,checkIn:ci,checkOut:co});
}
