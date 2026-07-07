# mp23-digital-plan-testing
Repo to build out code to test web-first production of MP datasets - set up to use MP23 data housed in the MPD.

## Preparing videos for scroll-scrubbing (`VideoStory`)

`VideoStory` scrubs a `<video>` by setting `currentTime` from scroll position.
Seeking is only smooth when the target frame is a keyframe, so source videos
should be re-encoded so that **every frame is a keyframe** (all-intra). This
trades a larger file for jank-free seeking to any scroll position.

```bash
ffmpeg -i input.mp4 -an \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -x264-params keyint=1:min-keyint=1:scenecut=0 \
  -crf 20 -preset slow \
  -movflags +faststart \
  input-allkeyframes.mp4
```

- `keyint=1:min-keyint=1:scenecut=0` — force every frame to an I-frame (the
  setting that makes seeking cheap).
- `-movflags +faststart` — put the moov atom at the front so the browser can
  seek before the whole file has downloaded.
- `-an` — drop audio (the video is played muted).
- Keep H.264 / `yuv420p`; it has the broadest hardware-accelerated seek support
  in browsers. Avoid H.265/HEVC and 10-bit.
- All-intra files are larger. Keep size down by encoding at the on-screen
  display resolution and raising `-crf` (higher = smaller).

By convention the re-encoded file is named with an `-allkeyframes` suffix (e.g.
`…-1-1ratio-allkeyframes.mp4`).
