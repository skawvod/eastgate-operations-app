/* ── Toast ──────────────────────────────────────────────── */
function toast(msg){const el=document.getElementById('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),2500);}

/* ── Translations ───────────────────────────────────────── */
const HE={
  'Property Ops':'ניהול נכסים','Workspace':'סביבת עבודה',
  'Tasks':'משימות','Work Orders':'הזמנות עבודה','Cleaning':'ניקיון',
  'My Dashboard':'לוח שלי','Dashboard':'לוח שלי','My Jobs':'המשימות שלי',
  'Sign out':'יציאה','Sign in':'כניסה','Sign in to continue':'כניסה להמשך',
  'Username':'שם משתמש','PIN':'קוד PIN',
  'Please enter your username':'נא להזין שם משתמש',
  'Please enter your PIN':'נא להזין קוד PIN',
  'Username not found':'שם משתמש לא נמצא',
  'No PIN set for your account — ask an admin to add one in Notion':'לא הוגדר PIN — בקש מהמנהל להוסיף',
  '↻ Refresh':'↻ רענן','+ New':'+ חדש',
  '+ New Task':'+ משימה חדשה','+ New Work Order':'+ הזמנת עבודה',
  '+ New Cleaning Job':'+ עבודת ניקיון',
  'All statuses':'כל הסטטוסים','All priorities':'כל העדיפויות',
  'All properties':'כל הנכסים','All cleaners':'כל המנקים',
  'All payment status':'כל סטטוסי תשלום',
  'All':'הכל','✓ Paid':'✓ שולם','Unpaid':'לא שולם','Paid only':'שולם בלבד','Unpaid only':'לא שולם בלבד',
  'No tasks yet':'אין משימות עדיין','No work orders yet':'אין הזמנות עבודה',
  'No cleaning jobs yet':'אין עבודות ניקיון',
  'Open':'פתוח','In Progress':'בתהליך','Blocked':'חסום','Done':'הושלם',
  'Draft':'טיוטה','Active':'פעיל','Complete':'הושלם','Accepted':'התקבל',
  'On Hold':'בהמתנה','Cancelled':'בוטל','Scheduled':'מתוזמן',
  'High':'גבוה','Medium':'בינוני','Low':'נמוך',
  'Regular Turnover':'מחזור רגיל','Deep Clean':'ניקיון עמוק','Move-in / Move-out':'כניסה / יציאה','Other':'אחר',
  "Today's jobs":"משימות היום",'Next 7 days':'7 ימים הבאים',
  'All clear for today 🎉':'הכל נקי להיום 🎉',
  'Connecting to Guesty…':'מתחבר ל-Guesty…','Guesty unavailable':'Guesty לא זמין',
  'Board':'לוח','List':'רשימה',
  'Notifications':'התראות','All caught up!':'הכל עדכני!','Archive all':'ארכיון הכל',
  'Change PIN':'שנה קוד','Current PIN':'קוד נוכחי','New PIN':'קוד חדש',
  'Confirm new PIN':'אשר קוד חדש','Save PIN':'שמור קוד',
  'Assigned to me':'מוקצה לי','All Tasks':'כל המשימות',
  'Add a comment…':'הוסף תגובה…','Send':'שלח',
  'No comments yet':'אין תגובות עדיין','Comments unavailable':'תגובות לא זמינות',
  'Loading…':'טוען…','Loading notifications…':'טוען התראות…',
  'Open in Notion ↗':'פתח ב-Notion ↗',
  'Cleaning Jobs':'עבודות ניקיון','Payment Dashboard':'לוח תשלומים',
  'Submissions':'הגשות','Property Status':'סטטוס נכסים','Guesty Calendar':'לוח שנה Guesty',
  'Dirty':'מלוכלך','Unsure':'לא ברור','Needs Inspection':'דורש בדיקה','Clean':'נקי',
  'Details':'פרטים','Payments':'תשלומים','Cleaner':'מנקה','Property':'נכס',
  'Notes':'הערות','Status':'סטטוס','Comments':'תגובות',
  'Accept':'קבל','Mark done':'סמן כבוצע','Undo':'בטל',
  'My Earnings':'ההכנסות שלי',
  'Outstanding':'חוב','Total Earned':'סה"כ הרוויח',
  'Unpaid jobs':'עבודות שלא שולמו','Cleaners owed':'מנקים לתשלום','View':'הצג',
  'All cleaners paid up!':'כל המנקים שולמו!',
  'Upcoming Jobs':'עבודות קרובות','Upcoming':'קרוב',
  'Earned':'הרוויח','Paid':'שולם',
  'No date':'ללא תאריך','✓ Done':'✓ בוצע',
  'No cleaning jobs found.':'לא נמצאו עבודות ניקיון.',
  'Work Orders':'הזמנות עבודה',
  'New Cleaning Job':'עבודת ניקיון חדשה','Create Cleaning Job':'צור עבודת ניקיון',
  'Link to Guesty reservation':'קישור לחיוב Guesty',
  'optional — auto-fills property & deadline':'אופציונלי — ממלא נכס ותאריך אוטומטית',
  'Job name':'שם עבודה','Type of clean':'סוג ניקיון',
  'Agreed rate ($)':'תעריף מוסכם ($)','Deadline':'תאריך יעד',
  'select':'בחר','Add new cleaner…':'הוסף מנקה חדש…',
  'Access codes, special instructions…':'קודי גישה, הוראות מיוחדות…',
  'Add Payment':'הוסף תשלום','Save Payment':'שמור תשלום',
  'Payment name *':'שם תשלום *','Amount paid ($) *':'סכום ששולם ($) *',
  'Payment date':'תאריך תשלום','Receipt image URL':'קישור לקבלה',
  'Add New Cleaner':'הוסף מנקה חדש','Add Cleaner':'הוסף מנקה',
  'Name *':'שם *','Phone':'טלפון','Default rate ($/job)':'תעריף ברירת מחדל',
  'Email':'אימייל','Full name':'שם מלא',
  'Nothing assigned to you right now':'אין כלום מוקצה לך כרגע',
  'No open tasks or jobs':'אין משימות פתוחות',
  'No active work orders':'אין הזמנות עבודה פעילות',
  'Incorrect PIN — try again':'קוד PIN שגוי — נסה שוב',
  'Cancel':'ביטול','Back':'חזור','Next Section →':'קטע הבא →','Submit & Complete ✓':'שלח וסיים ✓',
  'Section':'קטע','of':'מתוך','items':'פריטים','item unanswered':'פריט ללא תשובה','items unanswered':'פריטים ללא תשובה',
  'View checklist answers':'הצג תשובות רשימת תיוג',
  'All issues':'כל הבעיות','All clear':'הכל תקין',
  'No checklist submissions yet.':'אין הגשות עדיין.',
  'Sign in':'כניסה',
  '🏠 Property Status':'🏠 סטטוס נכסים','📅 Guesty Calendar':'📅 לוח שנה Guesty',
  'Task assigned to you':'משימה הוקצתה לך',
  'Cleaning job accepted':'עבודת ניקיון התקבלה',
  'Cleaning job completed':'עבודת ניקיון הושלמה',
  'Checklist submitted':'רשימת תיוג הוגשה',
};
const PH={
  'Property Ops':'Property Ops','Workspace':'Workspace',
  'Tasks':'Mga Gawain','Work Orders':'Mga Work Order','Cleaning':'Paglilinis',
  'My Dashboard':'Aking Dashboard','Dashboard':'Dashboard','My Jobs':'Aking mga Trabaho',
  'Sign out':'Mag-sign out','Sign in':'Mag-sign in','Sign in to continue':'Mag-sign in para magpatuloy',
  'Username':'Username','PIN':'PIN',
  'Please enter your username':'Mangyaring ilagay ang iyong username',
  'Please enter your PIN':'Mangyaring ilagay ang iyong PIN',
  'Username not found':'Hindi nahanap ang username',
  'No PIN set for your account — ask an admin to add one in Notion':'Walang PIN — hilingin sa admin na magdagdag',
  '↻ Refresh':'↻ I-refresh','+ New':'+ Bago',
  '+ New Task':'+ Bagong Gawain','+ New Work Order':'+ Bagong Work Order',
  '+ New Cleaning Job':'+ Bagong Trabaho sa Paglilinis',
  'All statuses':'Lahat ng status','All priorities':'Lahat ng priyoridad',
  'All properties':'Lahat ng ari-arian','All cleaners':'Lahat ng tagalinis',
  'All payment status':'Lahat ng status ng bayad',
  'All':'Lahat','✓ Paid':'✓ Bayad na','Unpaid':'Hindi pa bayad','Paid only':'Bayad na lang','Unpaid only':'Hindi pa bayad lang',
  'No tasks yet':'Wala pang gawain','No work orders yet':'Wala pang work order',
  'No cleaning jobs yet':'Wala pang trabaho sa paglilinis',
  'Open':'Bukas','In Progress':'Isinasagawa','Blocked':'Naharang','Done':'Tapos na',
  'Draft':'Draft','Active':'Aktibo','Complete':'Kumpleto','Accepted':'Tinanggap',
  'On Hold':'Nakahold','Cancelled':'Kinansela','Scheduled':'Nakatakda',
  'High':'Mataas','Medium':'Katamtaman','Low':'Mababa',
  'Regular Turnover':'Regular na Turnover','Deep Clean':'Malalim na Paglilinis','Move-in / Move-out':'Paglipat','Other':'Iba pa',
  "Today's jobs":'Mga trabaho ngayon','Next 7 days':'Susunod na 7 araw',
  'All clear for today 🎉':'Lahat ay maayos ngayon 🎉',
  'Connecting to Guesty…':'Kumukonekta sa Guesty…','Guesty unavailable':'Hindi available ang Guesty',
  'Board':'Board','List':'Listahan',
  'Notifications':'Mga Abiso','All caught up!':'Naka-update na!','Archive all':'I-archive lahat',
  'Change PIN':'Palitan ang PIN','Current PIN':'Kasalukuyang PIN','New PIN':'Bagong PIN',
  'Confirm new PIN':'Kumpirmahin ang bagong PIN','Save PIN':'I-save ang PIN',
  'Assigned to me':'Itinalaga sa akin','All Tasks':'Lahat ng Gawain',
  'Add a comment…':'Magdagdag ng komento…','Send':'Ipadala',
  'No comments yet':'Wala pang komento','Comments unavailable':'Hindi available ang mga komento',
  'Loading…':'Naglo-load…','Loading notifications…':'Naglo-load ng mga abiso…',
  'Open in Notion ↗':'Buksan sa Notion ↗',
  'Cleaning Jobs':'Mga Trabaho sa Paglilinis','Payment Dashboard':'Dashboard ng Bayad',
  'Submissions':'Mga Isinumite','Property Status':'Katayuan ng Ari-arian','Guesty Calendar':'Kalendaryo ng Guesty',
  'Dirty':'Marumi','Unsure':'Hindi tiyak','Needs Inspection':'Kailangan ng Inspeksyon','Clean':'Malinis',
  'Details':'Mga Detalye','Payments':'Mga Bayad','Cleaner':'Tagalinis','Property':'Ari-arian',
  'Notes':'Mga Tala','Status':'Katayuan','Comments':'Mga Komento',
  'Accept':'Tanggapin','Mark done':'Markahan bilang tapos','Undo':'I-undo',
  'My Earnings':'Aking Kita',
  'Outstanding':'Hindi pa nabayaran','Total Earned':'Kabuuang Kinita',
  'Unpaid jobs':'Mga trabahong hindi pa bayad','Cleaners owed':'Mga tagalinis na may utang','View':'Tingnan',
  'All cleaners paid up!':'Lahat ng tagalinis ay nabayaran na!',
  'Upcoming Jobs':'Mga Paparating na Trabaho','Upcoming':'Paparating',
  'Earned':'Kinita','Paid':'Bayad na',
  'No date':'Walang petsa','✓ Done':'✓ Tapos na',
  'No cleaning jobs found.':'Walang nahanap na trabaho sa paglilinis.',
  'Work Orders':'Mga Work Order',
  'New Cleaning Job':'Bagong Trabaho sa Paglilinis','Create Cleaning Job':'Lumikha ng Trabaho sa Paglilinis',
  'Link to Guesty reservation':'I-link sa Guesty reservation',
  'optional — auto-fills property & deadline':'opsyonal — awtomatikong pinupuno ang ari-arian at deadline',
  'Job name':'Pangalan ng trabaho','Type of clean':'Uri ng paglilinis',
  'Agreed rate ($)':'Napagkasunduang rate ($)','Deadline':'Deadline',
  'select':'pumili','Add new cleaner…':'Magdagdag ng bagong tagalinis…',
  'Access codes, special instructions…':'Mga code ng access, espesyal na tagubilin…',
  'Add Payment':'Magdagdag ng Bayad','Save Payment':'I-save ang Bayad',
  'Payment name *':'Pangalan ng bayad *','Amount paid ($) *':'Halagang binayad ($) *',
  'Payment date':'Petsa ng bayad','Receipt image URL':'URL ng resibo',
  'Add New Cleaner':'Magdagdag ng Bagong Tagalinis','Add Cleaner':'Magdagdag ng Tagalinis',
  'Name *':'Pangalan *','Phone':'Telepono','Default rate ($/job)':'Default na rate',
  'Email':'Email','Full name':'Buong pangalan',
  'Nothing assigned to you right now':'Wala pang itinalaga sa iyo ngayon',
  'No open tasks or jobs':'Walang bukas na gawain o trabaho',
  'No active work orders':'Walang aktibong work order',
  'Incorrect PIN — try again':'Maling PIN — subukang muli',
  'Cancel':'Kanselahin','Back':'Bumalik','Next Section →':'Susunod na Seksyon →','Submit & Complete ✓':'Isumite at Tapusin ✓',
  'Section':'Seksyon','of':'ng','items':'mga aytem','item unanswered':'aytem walang sagot','items unanswered':'mga aytem walang sagot',
  'View checklist answers':'Tingnan ang mga sagot sa checklist',
  'All issues':'Lahat ng isyu','All clear':'Lahat ay maayos',
  'No checklist submissions yet.':'Wala pang mga isinumite.',
  '🏠 Property Status':'🏠 Katayuan ng Ari-arian','📅 Guesty Calendar':'📅 Kalendaryo ng Guesty',
  'Task assigned to you':'Gawain na itinalaga sa iyo',
  'Cleaning job accepted':'Trabahong paglilinis ay tinanggap',
  'Cleaning job completed':'Trabahong paglilinis ay natapos',
  'Checklist submitted':'Checklist ay naisumite',
};

function t(k){
  const lang=document.documentElement.lang;
  if(lang==='he')return HE[k]||k;
  if(lang==='fil')return PH[k]||k;
  return k;
}
function applyTranslations(){
  const lang=document.documentElement.lang;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.dataset.i18n;el.textContent=t(k);
  });
  // Update checkmarks in lang picker
  ['en','he','fil'].forEach(l=>{
    const el=document.getElementById('lc-'+l);
    if(el)el.textContent=lang===l?' ✓':'';
  });
  // Highlight active lang option
  document.querySelectorAll('.lang-opt').forEach(b=>{
    const onclick=b.getAttribute('onclick')||'';
    const match=onclick.match(/setLang\('(\w+)'\)/);
    if(match)b.classList.toggle('active-lang',match[1]===lang);
  });
  try{
    const titles={tasks:t('Tasks'),workorders:t('Work Orders'),cleaning:t('Cleaning'),mydash:t('My Dashboard'),notifications:t('Notifications')};
    const tb=document.getElementById('topbar-title');if(tb&&st.section)tb.textContent=titles[st.section]||st.section;
    const newLabel={tasks:t('+ New Task'),workorders:t('+ New Work Order'),cleaning:t('+ New Cleaning Job')}[st.section]||t('+ New');
    const nb=document.getElementById('new-btn');if(nb)nb.textContent=newLabel;
    const nbm=document.getElementById('new-btn-m');if(nbm)nbm.textContent=newLabel;
    const cp=document.getElementById('dp-comment-input');if(cp)cp.placeholder=t('Add a comment…');
  }catch{}
  try{renderSection();}catch(e){}
}
function openProfileMenu(btn){
  const popup=document.getElementById('profile-popup');
  if(!popup)return;
  if(popup.style.display==='block'){popup.style.display='none';return;}
  popup.style.display='block';
  const rect=btn.getBoundingClientRect();
  const ph=popup.offsetHeight||180;
  const top=rect.bottom+6;
  const left=Math.max(6,rect.right-220);
  popup.style.top=top+'px';popup.style.left=left+'px';
  setTimeout(()=>{
    function outside(e){if(!popup.contains(e.target)&&e.target!==btn){popup.style.display='none';document.removeEventListener('click',outside);}}
    document.addEventListener('click',outside);
  },10);
}
let _langPickerAnchor=null;
function openLangPicker(btn){
  const popup=document.getElementById('lang-picker-popup');
  if(!popup)return;
  if(popup.style.display==='block'){popup.style.display='none';_langPickerAnchor=null;return;}
  const rect=btn.getBoundingClientRect();
  popup.style.display='block';
  // Position: prefer above the button, align to right edge
  const ph=popup.offsetHeight||160;
  const top=rect.top-ph-6<0?rect.bottom+6:rect.top-ph-6;
  popup.style.top=top+'px';
  popup.style.left=Math.max(6,rect.right-180)+'px';
  _langPickerAnchor=btn;
  applyTranslations();
  // Close on outside click
  setTimeout(()=>{
    function outside(e){if(!popup.contains(e.target)&&e.target!==btn){popup.style.display='none';document.removeEventListener('click',outside);}}
    document.addEventListener('click',outside);
  },10);
}
function setLang(lang){
  const html=document.documentElement;
  const dir=lang==='he'?'rtl':'ltr';
  html.lang=lang;html.dir=dir;
  localStorage.setItem('ops_lang',lang);localStorage.setItem('ops_dir',dir);
  document.getElementById('lang-picker-popup').style.display='none';
  applyTranslations();
}
function initLang(){
  const savedLang=localStorage.getItem('ops_lang')||'en';
  const savedDir=localStorage.getItem('ops_dir')||'ltr';
  document.documentElement.lang=savedLang;
  document.documentElement.dir=savedDir;
  applyTranslations();
}

/* ── Mobile detection ───────────────────────────────────── */
function applyMobile(){
  const isMobile=/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)||window.innerWidth<=700;
  const html=document.documentElement;
  html.classList.toggle('mobile',isMobile);
  const sidebar=document.querySelector('.sidebar');
  const mobileNav=document.getElementById('mobile-nav');
  const body=document.body;
  if(isMobile){
    if(sidebar)sidebar.style.setProperty('display','none','important');
    if(mobileNav)mobileNav.style.setProperty('display','flex','important');
    body.style.overflow='auto';
  }else{
    if(sidebar)sidebar.style.removeProperty('display');
    if(mobileNav)mobileNav.style.setProperty('display','none','important');
    body.style.overflow='';
  }
}
window.addEventListener('resize',()=>{applyMobile();try{setSection(st.section);}catch(e){}});

/* ── Init ───────────────────────────────────────────────── */
applyMobile();
initLang();
loadSession();
if(currentSession){bootApp();}else{showLoginScreen();}
// Re-apply after app boots (DOM fully populated)
setTimeout(()=>{applyMobile();applyTranslations();},100);
