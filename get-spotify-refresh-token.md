# Get Spotify Refresh Token

## Step 1: Authorize (Open this URL in browser)
```
https://accounts.spotify.com/authorize?client_id=0016976ea47a42d798965856e5549be1&response_type=code&redirect_uri=https://adversity-final.vercel.app/api/spotify-callback&scope=user-read-currently-playing
```

## Step 2: After authorizing, you'll be redirected to:
```
https://adversity-final.vercel.app/api/spotify-callback?code=AQ...
```

Copy the `code` value from the URL.

## Step 3: Get refresh token (run in terminal):
```bash
curl -X POST "https://accounts.spotify.com/api/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_CODE_FROM_STEP2" \
  -d "redirect_uri=https://adversity-final.vercel.app/api/spotify-callback" \
  -d "client_id=0016976ea47a42d798965856e5549be1" \
  -d "client_secret=0ef487e5cbdc457c93adae6e5db83771"
```

## Step 4: Copy the `refresh_token` from the response

## Step 5: Add to Vercel:
```bash
echo "YOUR_REFRESH_TOKEN" | vercel env add SPOTIFY_REFRESH_TOKEN production --yes
```

## Step 6: Deploy
```bash
vercel --prod --yes
```
