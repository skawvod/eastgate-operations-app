/* ── Auth ───────────────────────────────────────────────── */
function loadSession(){try{const r=localStorage.getItem(SESSION_KEY);if(r)currentSession=JSON.parse(r);}catch(e){}}
function saveSession(u){currentSession=u;localStorage.setItem(SESSION_KEY,JSON.stringify(u));}
function logout(){
  currentSession=null;localStorage.removeItem(SESSION_KEY);
  document.getElementById('main-app').style.display='none';
  document.getElementById('cleaner-view').style.display='none';
  _cleanerJobs=[];checklistJobId=null;
  showLoginScreen();
}

async function loadLoginUsers(){
  try{
    const [userPages,cleanerPages]=await Promise.all([queryDB(DBID_USERS),queryDB(DBID_CLEANERS)]);
    const adminUsers=userPages.map(p=>{
      const pr=p.properties;
      return{id:p.id,name:rp(pr,'Name')||'',role:rp(pr,'Role')||'Admin',pin:String(rp(pr,'PIN')||'').trim(),color:rp(pr,'Color')||'purple',initials:rp(pr,'Initials')||''};
    }).filter(u=>u.name);
    const cleanerUsers=cleanerPages.map(p=>{
      const pr=p.properties;
      const name=rp(pr,'Name')||'';
      const initials=name.split(' ').map(w=>w[0]||'').join('').toUpperCase().slice(0,2);
      return{id:p.id,name,role:'Cleaner',pin:String(rp(pr,'PIN')||'').trim(),color:'green',initials};
    }).filter(u=>u.name&&u.pin);
    const adminNames=new Set(adminUsers.map(u=>u.name.toLowerCase()));
    const merged=[...adminUsers,...cleanerUsers.filter(u=>!adminNames.has(u.name.toLowerCase()))];
    if(merged.length)loginUsers=merged;
  }catch(e){
    if(!loginUsers.length)loginUsers=[
      {id:'dovi',  name:'Dovi',   role:'Admin', pin:'1234', color:'purple',initials:'DW'},
      {id:'hindy', name:'Hindy',  role:'Admin', pin:'2345', color:'blue',  initials:'HI'},
      {id:'yechiel',name:'Yechiel',role:'Supervisor',pin:'3456',color:'green',initials:'YE'},
    ];
  }
}

async function showLoginScreen(){
  document.getElementById('login-screen').style.display='flex';
  const uEl=document.getElementById('ls-username');if(uEl)uEl.value='';
  const pEl=document.getElementById('ls-pin-input');if(pEl)pEl.value='';
  const eEl=document.getElementById('ls-pin-error');if(eEl)eEl.textContent='';
  await loadLoginUsers();
  setTimeout(()=>document.getElementById('ls-username')?.focus(),80);
}

function doLogin(){
  const usernameRaw=(document.getElementById('ls-username')?.value||'').trim();
  const pin=(document.getElementById('ls-pin-input')?.value||'').trim();
  const errEl=document.getElementById('ls-pin-error');
  errEl.textContent='';
  if(!usernameRaw){errEl.textContent=t('Please enter your username');return;}
  if(!pin){errEl.textContent=t('Please enter your PIN');return;}
  const lower=usernameRaw.toLowerCase();
  const user=loginUsers.find(u=>u.name.toLowerCase()===lower)||loginUsers.find(u=>u.name.toLowerCase().startsWith(lower));
  if(!user){errEl.textContent=t('Username not found');return;}
  if(!user.pin){errEl.textContent=t('No PIN set for your account — ask an admin to add one in Notion');return;}
  if(pin!==user.pin){errEl.textContent=t('Incorrect PIN — try again');document.getElementById('ls-pin-input').value='';document.getElementById('ls-pin-input').focus();return;}
  document.getElementById('login-screen').style.display='none';
  saveSession(user);
  bootApp();
}

function bootApp(){if(!currentSession){showLoginScreen();return;}window.scrollTo(0,0);const role=currentSession.role||'';if(role==='Cleaner'){launchCleanerView();}else{launchMainApp();}}

function launchMainApp(){
  document.getElementById('main-app').style.display='flex';
  applyMobile();
  const avEl=document.getElementById('sb-av');avEl.className='avatar av-a';avEl.textContent=currentSession.initials;
  document.getElementById('sb-name').textContent=currentSession.name;
  document.getElementById('sb-role').textContent=currentSession.role;
  const tbAv=document.getElementById('topbar-av');
  if(tbAv){tbAv.className=`topbar-av-btn ${COLOR_CLS[currentSession.color]||'lav-purple'}`;tbAv.textContent=currentSession.initials;}
  const ppName=document.getElementById('pp-name');if(ppName)ppName.textContent=currentSession.name;
  const ppRole=document.getElementById('pp-role');if(ppRole)ppRole.textContent=currentSession.role;
  setView(st.view);setSection(st.section);
  if(!loginUsers.length)loadLoginUsers();
  loadAll();
}

/* ── Change PIN ─────────────────────────────────────────── */
function openChangePIN(){
  document.getElementById('modal-overlay').style.display='flex';
  document.getElementById('modal-box').innerHTML=`
    <div class="modal-title">🔑 Change PIN</div>
    <div style="font-size:13px;color:#666;margin-bottom:14px;">Changing PIN for <strong>${h(currentSession?.name||'')}</strong></div>
    <div class="frow"><label class="flabel">Current PIN</label><input class="finput" type="password" inputmode="numeric" id="f-old-pin" maxlength="8" placeholder="Current PIN"></div>
    <div class="frow"><label class="flabel">New PIN</label><input class="finput" type="password" inputmode="numeric" id="f-new-pin" maxlength="8" placeholder="New PIN (4–8 digits)"></div>
    <div class="frow"><label class="flabel">Confirm new PIN</label><input class="finput" type="password" inputmode="numeric" id="f-new-pin2" maxlength="8" placeholder="Repeat new PIN"></div>
    <div id="f-pin-err" style="color:#dc2626;font-size:12px;min-height:16px;margin-bottom:6px;"></div>
    <div class="mactions"><button class="btn" onclick="closeModal()">Cancel</button><button class="btn btn-primary" id="submit-btn" onclick="submitChangePIN()">Save PIN</button></div>`;
}
async function submitChangePIN(){
  const oldPin=document.getElementById('f-old-pin')?.value;
  const newPin=document.getElementById('f-new-pin')?.value;
  const newPin2=document.getElementById('f-new-pin2')?.value;
  const errEl=document.getElementById('f-pin-err');
  if(oldPin!==currentSession?.pin){errEl.textContent='Current PIN is incorrect';return;}
  if(!newPin||newPin.length<4){errEl.textContent='New PIN must be at least 4 digits';return;}
  if(newPin!==newPin2){errEl.textContent='PINs do not match';return;}
  const btn=document.getElementById('submit-btn');btn.textContent='Saving…';btn.disabled=true;
  try{
    await updatePage(currentSession.id,{PIN:wp('text',newPin)});
    currentSession.pin=newPin;
    saveSession(currentSession);
    const lu=loginUsers.find(u=>u.id===currentSession.id);
    if(lu)lu.pin=newPin;
    closeModal();toast('PIN changed ✓');
  }catch(e){errEl.textContent='Error: '+(e.message||e);btn.textContent='Save PIN';btn.disabled=false;}
}
