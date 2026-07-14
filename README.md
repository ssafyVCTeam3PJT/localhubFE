<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b71b04d3-1e09-4a86-b256-2625cec15e28

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Add your map/weather keys in [.env.local](.env.local) if you want the home map and weather widgets enabled
   - `VITE_NAVER_MAP_CLIENT_ID`: recommended for the main interactive map
   - `VITE_NAVER_STATIC_MAP_CLIENT_ID`: optional for static-map previews later
   - `VITE_OPENWEATHER_API_KEY`: weather widget
4. Run the app:
   `npm run dev`
