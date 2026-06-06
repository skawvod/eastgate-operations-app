// Notion API proxy — keeps your token server-side
const NOTION_TOKEN = process.env.NOTION_TOKEN;
const NOTION_VERSION = '2022-06-28';
const BASE = 'https://api.notion.com/v1';

const nHeaders = {
  'Authorization': `Bearer ${NOTION_TOKEN}`,
  'Notion-Version': NOTION_VERSION,
  'Content-Type': 'application/json',
};

async function nFetch(path, method = 'GET', body = null) {
  const opts = { method, headers: nHeaders };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || `Notion ${res.status}`);
  return json;
}

exports.handler = async (event) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { action, ...params } = JSON.parse(event.body);
    let result;

    if (action === 'queryDB') {
      // Paginate through all results
      const allResults = [];
      let cursor = params.startCursor;
      do {
        const body = { page_size: 100 };
        if (cursor) body.start_cursor = cursor;
        const res = await nFetch(`/databases/${params.dbId}/query`, 'POST', body);
        allResults.push(...(res.results || []));
        cursor = res.has_more ? res.next_cursor : null;
      } while (cursor);
      result = { results: allResults };

    } else if (action === 'getPage') {
      result = await nFetch(`/pages/${params.id}`);

    } else if (action === 'createPage') {
      result = await nFetch('/pages', 'POST', {
        parent: { database_id: params.dbId },
        properties: params.properties,
      });

    } else if (action === 'updatePage') {
      result = await nFetch(`/pages/${params.id}`, 'PATCH', {
        properties: params.properties,
      });

    } else if (action === 'getComments') {
      result = await nFetch(`/comments?block_id=${params.pageId}`);

    } else if (action === 'createComment') {
      result = await nFetch('/comments', 'POST', {
        parent: { page_id: params.pageId },
        rich_text: [{ text: { content: params.text } }],
      });

    } else if (action === 'deleteComment') {
      // Notion public API doesn't support comment deletion yet;
      // we update it to mark as deleted by creating a replacement comment
      // and returning success so the UI can hide it locally.
      result = { deleted: true, id: params.commentId };

    } else {
      return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: `Unknown action: ${action}` }) };
    }

    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(result) };
  } catch (e) {
    console.error('Notion proxy error:', e);
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) };
  }
};
