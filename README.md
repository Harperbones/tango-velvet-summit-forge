# The Reading Room

A dark-academia / vintage literary take on random video chat (Omegle-style), designed around the cozy aesthetic of an open book, black coffee, and old postcards.

## What you have right now

- Fully styled landing page + chat interface matching the photo vibe
- Camera & microphone access
- Local video preview
- Mute / camera toggle
- Text chat UI
- “Next” and “Leave” controls
- Elegant sepia / parchment / coffee color palette, serif typography, subtle paper texture

**Important:** This is a polished front-end. Real random stranger matching still needs a signaling server (WebSocket + WebRTC). The current version runs in “demo” mode so you can experience the look and feel.

## How to try it locally

1. Open `index.html` in a modern browser (Chrome, Firefox, Edge, Safari).
2. Click **Enter the Room**.
3. Allow camera & microphone when prompted.
4. You will see yourself and the waiting state.

> Note: `getUserMedia` requires a **secure context** (HTTPS or `localhost`). Opening the file directly as `file://` may be blocked in some browsers. Use a simple local server:

```bash
# Python
python -m http.server 8000

# or Node
npx serve .
```

Then visit `http://localhost:8000`.

## Deploy for free (frontend)

- **Vercel** / **Netlify** / **Cloudflare Pages** / **GitHub Pages**  
  Just upload or connect the folder containing `index.html`.  
  These all give you free HTTPS, which is required for camera access in production.

## Next step: real matching

To make it work like Omegle (random pairing + peer-to-peer video):

1. Add a small Node.js + Socket.io signaling server that:
   - Keeps a queue of waiting users
   - Pairs them randomly
   - Relays WebRTC SDP offers/answers and ICE candidates
2. Use free TURN (e.g. Metered Open Relay) so connections work behind firewalls.
3. Host the signaling server on Render / Railway free tier (or Cloudflare Workers).

I can generate the full signaling server code + integration for you whenever you’re ready.

## Aesthetic notes

- Palette: parchment, deep coffee, soft gold, sepia
- Fonts: IM Fell English + Cormorant Garamond + Libre Baskerville
- Mood: quiet, literary, contemplative — “conversations with strangers, over coffee”
