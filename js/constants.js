/* ── DB IDs ─────────────────────────────────────────────── */
const DBID_USERS      ='9c2b12a9-dd63-4d67-85b8-ba7d56ef8b2a';
const DBID_PROP       ='a117b086-b284-4de9-92c0-65ab14899c97';
const DBID_TASKS      ='a36736fe-17fc-45b7-9ee8-fd9cb56d2b66';
const DBID_WO         ='7c2d48cb-989c-4812-b154-da8a086c77e6';
const DBID_CLEANING   ='5607a7f0-ba64-4bc5-afaf-2bf1efda8949';
const DBID_PAYMENTS   ='d1fffe59-dccf-4a64-a6fd-2fc977b01f51';
const DBID_CLEANERS   ='2410b06c-0c14-463b-864f-4dc145d00526';
const DBID_CONTRS     ='e11b4371-88b6-4bc6-a241-d073c96e5108';

const SESSION_KEY='ops_session';
const COLOR_CLS={purple:'lav-purple',blue:'lav-blue',green:'lav-green',orange:'lav-orange',pink:'lav-pink'};
const TEAM=[
  {id:'22e6d2c2-5b81-452a-8b9e-91386e2284df',name:'Dovi',   initials:'DW',avCls:'av-a'},
  {id:'1f8d872b-594c-8131-969e-0002091e249f',name:'Hindy',  initials:'HI',avCls:'av-b'},
  {id:'32fd872b-594c-810e-8a81-00027e65666e',name:'Yechiel',initials:'YE',avCls:'av-c'},
];

/* ── App state ──────────────────────────────────────────── */
let currentSession=null, loginUsers=[], loginSelectedUser=null, cleanerNoteOpen={};
let cleanerViewTab=localStorage.getItem('cv_tab')||'dash';
let propBoardTab=localStorage.getItem('pb_tab')||'status';
let checklistJobId=null, checklistSection=0, checklistAnswers={};
let expandedCalDays={};
let cachedGuestyData=null;
let notifTimestamps=JSON.parse(localStorage.getItem('notif_ts')||'{}');
let st={
  section:localStorage.getItem('ops_section')||'mydash',
  view:localStorage.getItem('ops_view')||'board',
  cleaningTab:localStorage.getItem('cl_tab')||'jobs',
  myDashTab:localStorage.getItem('md_tab')||'assigned',
  myDashProp:'all',
  tasks:[],workOrders:[],cleaningJobs:[],payments:[],cleaners:[],contractors:[],properties:[],
  loading:true,
  detailType:null,detailId:null,
  modalType:null,modalPrefill:{},
  tf:{status:'all',priority:'all',prop:'all'},
  wf:{status:'all',prop:'all'},
  cf:{status:'all',prop:'all',cleaner:'all',paid:'all'},
};
