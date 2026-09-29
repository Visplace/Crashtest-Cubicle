# crashtest cubicle

Teaser site. Plain HTML/CSS/JS — no build step. Open `index.html` or host the folder anywhere (GitHub Pages, Netlify, etc).

## Adding music

1. Put audio files in `assets/audio/` (mp3 is safest).
2. Open `content.js` and add a line per track:

   ```js
   { title: "fluorescent", file: "assets/audio/fluorescent.mp3", note: "demo. recorded after 5pm." },
   ```

The desk phone switches from "(0) new messages" to a playable voicemail list, and the computer screen updates itself.

## Adding links

Same file, `LINKS` list — `{ label: "instagram", url: "https://..." }`. The section stays hidden until there's at least one.
