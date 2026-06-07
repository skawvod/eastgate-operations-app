/* ── Data Loading ───────────────────────────────────────── */
async function loadAll(){
  st.loading=true;renderSection();
  try{
    const [tP,wP,cP,payP,clnrP,ctrP,prP]=await Promise.all([
      queryDB(DBID_TASKS),queryDB(DBID_WO),queryDB(DBID_CLEANING),
      queryDB(DBID_PAYMENTS),queryDB(DBID_CLEANERS),queryDB(DBID_CONTRS),queryDB(DBID_PROP)
    ]);
    st.tasks=tP.map(parseTask);
    st.workOrders=wP.map(parseWO);
    st.cleaningJobs=cP.map(parseCleaning);
    st.payments=payP.map(parsePayment);
    st.cleaners=clnrP.map(parsePerson);
    st.contractors=ctrP.map(parsePerson);
    st.properties=prP.map(p=>({id:p.id,url:p.url,name:rp(p.properties,'Property Name')||'Property',propStatus:rp(p.properties,'Property Status')||'Dirty'}));
  }catch(e){console.error('loadAll',e);}
  st.loading=false;renderSection();
  if(st.section==='cleaning')loadGuesty();
}

function parseTask(p){const pr=p.properties;return{id:p.id,url:p.url,name:rp(pr,'Task Name')||'Untitled',status:rp(pr,'Status')||'Open',priority:rp(pr,'Priority')||'',property:rp(pr,'Property')||'',assignee:rp(pr,'Assignee')||'',createdBy:rp(pr,'Created By')||'',deadline:rp(pr,'Deadline')||'',description:rp(pr,'Description')||'',linkedWOs:safeJSON(rp(pr,'Linked Work Orders'))};}
function parseWO(p){const pr=p.properties;return{id:p.id,url:p.url,name:rp(pr,'Work Order Name')||'Untitled',status:rp(pr,'Status')||'Draft',property:rp(pr,'Property')||'',contractor:rp(pr,'Contractor')||'',supervisor:rp(pr,'Supervisor')||'',description:rp(pr,'Description')||'',linkedTask:safeJSON(rp(pr,'Linked Task')),estCompletion:rp(pr,'Est. Completion')||'',estCost:rp(pr,'Est. Cost'),payments:safeJSON(rp(pr,'Payments'))};}
function parseCleaning(p){const pr=p.properties;return{id:p.id,url:p.url,name:rp(pr,'Job Name')||'Untitled',status:rp(pr,'Status')||'Scheduled',property:rp(pr,'Property')||'',cleaner:rp(pr,'Cleaner')||'',type:rp(pr,'Type of Clean')||'',rate:rp(pr,'Agreed Rate'),deadline:rp(pr,'Deadline')||'',notes:rp(pr,'Notes')||'',paid:rp(pr,'Paid?')===true,gResv:safeJSON(rp(pr,'Guesty Reservation')),submittedAt:rp(pr,'Submitted At')||'',responses:rp(pr,'Responses')||''};}
function parsePayment(p){const pr=p.properties;return{id:p.id,url:p.url,name:rp(pr,'Payment Name')||'Payment',workOrder:safeJSON(rp(pr,'Work Order')),amount:rp(pr,'Amount Paid'),date:rp(pr,'Payment Date')||'',notes:rp(pr,'Notes')||'',receipt:rp(pr,'Receipt Image URL')||''};}
function parsePerson(p){const pr=p.properties;return{id:p.id,url:p.url,name:rp(pr,'Name')||'',phone:rp(pr,'Phone')||'',email:rp(pr,'Email')||'',rate:rp(pr,'Default Rate'),specialty:rp(pr,'Specialty')||'',active:rp(pr,'Active')!==false};}
