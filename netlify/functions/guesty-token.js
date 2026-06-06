// Guesty OAuth proxy — dual-layer caching to beat the 5-requests/24h rate limit.
// Layer 1 (this file): module-level cache survives across warm Lambda re-invocations.
// Layer 2: client-side localStorage cache in the browser.
const https = require('https');
const querystring = require('querystring');

// Module-level — lives as long as the Lambda container stays warm (hours to days).
let _cachedToken = null;
let _cacheExpiry = 0; // epoch ms

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
};

function fetchFreshToken(postData) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'open-api.guesty.com',
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'Accept': 'application/json',
      },
    };
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 400) {
            const errMsg = json.error_description
              || (typeof json.error === 'string' ? json.error : JSON.stringify(json.error))
              || (json.message ? `${json.message} [${json.code || res.statusCode}]` : `HTTP ${res.statusCode}`);
            reject(new Error(errMsg));
          } else {
            resolve(json);
          }
        } catch (e) {
          reject(new Error(`Parse error (${res.statusCode}): ${body.substring(0, 200)}`));
        }
      });
    });
    req.on('error', e => reject(new Error(`Network error: ${e.message}`)));
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('Guesty auth timed out')); });
    req.write(postData);
    req.end();
  });
}

exports.handler = async () => {
  // Serve from server-side module cache if still valid
  if (_cachedToken && Date.now() < _cacheExpiry) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        access_token: _cachedToken,
        expires_in: Math.floor((_cacheExpiry - Date.now()) / 1000),
        cached: 'server',
      }),
    };
  }

  const postData = querystring.stringify({
    grant_type: 'client_credentials',
    scope: 'open-api',
    client_id: process.env.GUESTY_CLIENT_ID,
    client_secret: process.env.GUESTY_CLIENT_SECRET,
  });

  try {
    const data = await fetchFreshToken(postData);
    _cachedToken = data.access_token;
    // Cache for full lifetime minus 5-minute buffer
    _cacheExpiry = Date.now() + ((data.expires_in || 86400) - 300) * 1000;
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify(data) };
  } catch (e) {
    // Rate-limited but have a stale cached token? Return it — Guesty tokens stay valid
    // for their full 24h even if our tracking timer lapsed.
    if (_cachedToken && e.message.includes('TOO_MANY_REQUESTS')) {
      _cacheExpiry = Date.now() + 4 * 3600 * 1000; // extend by 4h optimistically
      return {
        statusCode: 200,
        headers: corsHeaders,
        body: JSON.stringify({ access_token: _cachedToken, expires_in: 14400, cached: 'stale' }),
      };
    }
    return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: e.message }) };
  }
};
