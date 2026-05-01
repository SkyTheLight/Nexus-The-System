const https = require('https');
const { URLSearchParams } = require('url');

const CLIENT_ID = '0016976ea47a42d798965856e5549be1';
const CLIENT_SECRET = '0ef487e5cbdc457c93adae6e5db83771';
const REDIRECT_URI = 'https://adversity-final.vercel.app/api/spotify-callback';

const code = process.argv[2];

if (!code) {
  console.log('ERROR: No code provided');
  console.log('');
  console.log('Step 1: Open this URL in your browser:');
  console.log(`https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user-read-currently-playing`);
  console.log('');
  console.log('Step 2: After authorizing, copy the "code" from the redirect URL');
  console.log('Step 3: Run: node spotify-token.js "YOUR_CODE"');
  process.exit(1);
}

const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

const postData = new URLSearchParams({
  grant_type: 'authorization_code',
  code: code,
  redirect_uri: REDIRECT_URI
}).toString();

const options = {
  hostname: 'accounts.spotify.com',
  path: '/api/token',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${auth}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const result = JSON.parse(data);
    console.log(JSON.stringify(result, null, 2));
    if (result.refresh_token) {
      console.log('');
      console.log('=== COPY THIS REFRESH TOKEN ===');
      console.log(result.refresh_token);
      console.log('');
      console.log('Then run:');
      console.log(`echo "${result.refresh_token}" | vercel env add SPOTIFY_REFRESH_TOKEN production --yes`);
    }
  });
});

req.on('error', (e) => { console.error(`Error: ${e.message}`); });
req.write(postData);
req.end();
