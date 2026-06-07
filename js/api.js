/* ── Notion API client ──────────────────────────────────── */
async function notion(params) {
  const res = await fetch('/.netlify/functions/notion', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data;
}
async function queryDB(dbId) {
  const res = await notion({action:'queryDB', dbId});
  return res.results || [];
}
async function createPage(dbId, properties) {
  return notion({action:'createPage', dbId, properties});
}
async function updatePage(id, properties) {
  return notion({action:'updatePage', id, properties});
}
async function getComments(pageId) {
  return notion({action:'getComments', pageId});
}
async function addComment(pageId, text) {
  return notion({action:'createComment', pageId, text});
}

/* ── Notion property helpers ────────────────────────────── */
function rp(props, name) {
  const p = props?.[name]; if (!p) return null;
  switch(p.type) {
    case 'title':        return p.title?.map(t=>t.plain_text).join('') || '';
    case 'rich_text':    return p.rich_text?.map(t=>t.plain_text).join('') || '';
    case 'select':       return p.select?.name || '';
    case 'multi_select': return p.multi_select?.map(s=>s.name).join(', ') || '';
    case 'number':       return p.number;
    case 'date':         return p.date?.start || '';
    case 'checkbox':     return p.checkbox;
    case 'email':        return p.email || '';
    case 'phone_number': return p.phone_number || '';
    case 'url':          return p.url || '';
    default:             return null;
  }
}
function wp(type, value) {
  if (value === null || value === undefined || value === '') return null;
  switch(type) {
    case 'title':    return {title:[{text:{content:String(value)}}]};
    case 'text':     return {rich_text:[{text:{content:String(value)}}]};
    case 'select':   return {select:{name:String(value)}};
    case 'number':   return {number:typeof value==='number'?value:parseFloat(value)||null};
    case 'date':     return {date:{start:String(value)}};
    case 'checkbox': return {checkbox:Boolean(value)};
    default:         return {rich_text:[{text:{content:String(value)}}]};
  }
}
function safeJSON(v){try{return v&&v!=='null'?JSON.parse(v):null;}catch{return null;}}
const h=v=>String(v||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const aa=v=>String(v||'').replace(/\\/g,'\\\\').replace(/"/g,'&quot;').replace(/'/g,"\\'");
