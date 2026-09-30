// build-root.mjs: generates the root composition (index.html) and one dev host per builder from a single
// template, so every builder works on top of the REAL root: background worlds, root camera, kinetic captions
// and the soundtrack. Everything brand- or film-specific lives in CONFIG; the code below it is brand-neutral.
// Usage: node tools/build-root.mjs   -> index.html + dev/<agent>/index.html + missing composition skeletons
import fs from "node:fs";
import path from "node:path";

// =============================== CONFIG (fill per film from BRAND.md + the bible) ===============================
const C = {
  title: "Brand · Film title",
  w: 1920, h: 1080,                                   // 1080 x 1920 for vertical formats
  dur: 60,                                            // film length in seconds
  slots: { "a-hook": [0, 12.4, 5], "b-pain": [12, 14.5, 6], "c-product": [26.2, 26, 7], "d-close": [51.8, 8.2, 8] }, // id: [start, dur, z]
  agents: { "agent-a": ["a-hook"], "agent-b": ["b-pain"], "agent-c": ["c-product"], "agent-d": ["d-close"] },
  font: { family: "Inter", files: [["assets/fonts/inter-var.woff2", "100 1000"]] }, // brand font files in assets/fonts
  color: { bg: "#F3F5F8", ink: "#0E1A2B", pain: "#C23B3B", brand: "#2563EB", brandOnDark: "#93C5FD", heroInk: "#F4F7FB" },
  captions: {
    pill: "top: 30px",                                // caption band position (vertical video: e.g. "top: 62%")
    hero: [0, 0],                                     // [t0, t1): lines starting here render as big stacked hero text
    endCard: 1e9,                                     // no captions for lines starting at/after this time
    split: {},                                        // { "Exact line text.": wordsInFirstChunk } keeps punchlines whole
    emphasis: {},                                     // { lowercaseword: "pain" | "brand" }
  },
  // Background worlds (root-owned, screen space): CSS + opacity keys [[t, opacity], ...] (smoothstep between keys).
  // Optional iris: a soft circular hole opens in this layer from t0 to t1 (a "light iris" reveal instead of a flat fade).
  worlds: [
    { id: "w-base", css: "background: radial-gradient(1400px 900px at 30% 20%, #F7F9FC 0%, #E6ECF3 55%, #D5DEE8 100%);", keys: [[0, 1]] },
    { id: "w-dark", css: "background: radial-gradient(1300px 900px at 50% 45%, #152035 0%, #0B111D 55%, #05080E 100%);", keys: [[0, 0]], iris: null },
  ],
  // Root camera over ALL builder layers: [t, x, y, scale, ease] = frame-centre point of the stage and zoom;
  // ease of the segment ending here: "io" (power2.inOut) or "lin" (drifts). Identity by default.
  // Speed rule: anything carrying text moves >= 30 px/s on screen, or holds (references/motion-language.md).
  cam: [[0, 960, 540, 1]],
  grain: 0.022,                                       // film grain opacity if assets/fx/grain.png exists (0 = off)
  kit: "KIT",                                         // global helper namespace of assets/kit/kit.js, if the project has one
};
// ===================================================================================================================

const ROOT = path.resolve(import.meta.dirname, "..");
const has = (p) => fs.existsSync(path.join(ROOT, p));
const AUDIO = has("assets/audio/soundtrack.wav") ? "assets/audio/soundtrack.wav" : "assets/audio/vo.wav";
const PLUGINS = ["CustomEase", "DrawSVGPlugin", "MorphSVGPlugin", "MotionPathPlugin", "SplitText"].filter((p) => has(`assets/vendor/${p}.min.js`));

// ---- captions: chunk the voice-over into 2-4 word groups (break at commas), times from the master clock ----
const words = JSON.parse(fs.readFileSync(path.join(ROOT, "vo/final/words.json"), "utf8"));
const lines = []; let cur = [];
for (const w of words) { cur.push(w); if (/[.?!]$/.test(w.w)) { lines.push(cur); cur = []; } }
if (cur.length) lines.push(cur);
const chunks = [];
for (const ln of lines) {
  if (ln[0].s >= C.captions.endCard) continue;
  if (ln[0].s >= C.captions.hero[0] && ln[0].s < C.captions.hero[1]) { chunks.push({ hero: true, words: ln }); continue; }
  const cut = C.captions.split[ln.map((w) => w.w).join(" ")];
  if (cut) { chunks.push({ hero: false, words: ln.slice(0, cut) }, { hero: false, words: ln.slice(cut) }); continue; }
  let group = [];
  const flush = () => { if (group.length) chunks.push({ hero: false, words: group }); group = []; };
  ln.forEach((w, i) => {
    group.push(w);
    const remaining = ln.length - i - 1;
    if (/,$/.test(w.w) || (group.length >= 4 && remaining !== 1) || (group.length >= 3 && remaining === 0)) flush();
  });
  flush();
}
chunks.forEach((c, i) => {
  const first = c.words[0], last = c.words.at(-1), next = chunks[i + 1];
  c.s = +(first.s - 0.06).toFixed(3);
  const hold = c.hero ? 0.9 : 0.45;
  c.e = +Math.min(last.e + hold, next ? next.words[0].s - 0.08 : last.e + hold).toFixed(3);
  if (c.hero && next && next.hero) c.e = +(chunks.filter((q) => q.hero).at(-1).words.at(-1).e + 0.35).toFixed(3); // hero lines stack
});
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const capHtml = chunks.map((c, i) => {
  const inner = c.words.map((w, j) => {
    const em = C.captions.emphasis[w.w.toLowerCase().replace(/[^a-z0-9]/g, "")];
    return `<span class="cap-w${em ? " cap-" + em : ""}" id="cw-${i}-${j}">${esc(w.w)}</span>`;
  }).join(" ");
  return `      <div class="cap ${c.hero ? "cap-hero" : "cap-pill"}" id="cap-${i}">${inner}</div>`;
}).join("\n");
const capData = JSON.stringify(chunks.map((c) => ({ s: c.s, e: c.e, h: c.hero ? 1 : 0, w: c.words.map((w) => +w.s.toFixed(3)) })));
const fontFace = C.font.files.map(([f, wt]) => `@font-face { font-family: "${C.font.family}"; src: url("${f}") format("woff2"); font-weight: ${wt}; font-style: normal; }`).join("\n    ");

function page(title, slotIds) {
  const slotHtml = slotIds.map((id) => {
    const [s, d, z] = C.slots[id];
    return `      <div id="${id}" class="clip" style="z-index:${z}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="${s}" data-duration="${d}" data-track-index="${z}" data-width="${C.w}" data-height="${C.h}"></div>`;
  }).join("\n");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=${C.w}, height=${C.h}" />
  <title>${esc(title)}</title>
${has("assets/kit/kit.css") ? `  <link rel="stylesheet" href="assets/kit/kit.css" />\n` : ""}  <script src="assets/vendor/gsap.min.js"></script>
${PLUGINS.map((p) => `  <script src="assets/vendor/${p}.min.js"></script>`).join("\n")}
${PLUGINS.length ? `  <script>gsap.registerPlugin(${PLUGINS.join(", ")});</script>\n` : ""}${has("assets/kit/kit.js") ? `  <script src="assets/kit/kit.js"></script>\n` : ""}  <style>
    ${fontFace}
    html, body { margin: 0; background: ${C.color.bg}; }
    #stage { position: relative; width: 100%; height: 100%; overflow: hidden; background: ${C.color.bg}; font-family: "${C.font.family}", sans-serif; }
    .world { position: absolute; inset: 0; opacity: 0; }
    #camera { position: absolute; inset: 0; transform-origin: 0 0; }
    .clip { position: absolute; inset: 0; }
    #caps { position: absolute; inset: 0; z-index: 30; pointer-events: none; }
    .cap { position: absolute; opacity: 0; white-space: nowrap; }
    .cap-pill { left: 50%; ${C.captions.pill}; transform: translateX(-50%); padding: 11px 24px 13px; border-radius: 16px;
      background: rgba(255,255,255,.92); box-shadow: 0 0 0 1px rgba(14,26,43,.06), 0 8px 28px rgba(14,26,43,.14);
      font: 600 38px/1.15 "${C.font.family}", sans-serif; letter-spacing: -0.015em; color: ${C.color.ink}; }
    .cap-hero { left: 0; right: 0; text-align: center; font: 600 78px/1.1 "${C.font.family}", sans-serif; letter-spacing: -0.03em; color: ${C.color.heroInk}; }
    .cap-w { display: inline-block; opacity: 0; }
    .cap-pain { color: ${C.color.pain}; }
    .cap-brand { color: ${C.color.brand}; }
    .cap-hero .cap-brand { color: ${C.color.brandOnDark}; }
    #grain { position: absolute; left: -512px; top: -512px; width: ${C.w + 1024}px; height: ${C.h + 1024}px; z-index: 60; pointer-events: none;
      background-image: url("assets/fx/grain.png"); background-size: 512px 512px; opacity: ${C.grain}; mix-blend-mode: multiply; }
${C.worlds.map((w) => `    #${w.id} { ${w.css} }`).join("\n")}
  </style>
</head>
<body>
  <div id="stage" data-composition-id="main" data-start="0" data-width="${C.w}" data-height="${C.h}" data-duration="${C.dur}">
${C.worlds.map((w) => `    <div id="${w.id}" class="world" data-layout-allow-overflow></div>`).join("\n")}
    <div id="camera" data-layout-allow-overflow>
${slotHtml}
    </div>
    <div id="caps">
${capHtml}
    </div>
${has("assets/fx/grain.png") && C.grain > 0 ? `    <div id="grain"></div>\n` : ""}    <audio id="soundtrack" src="${AUDIO}" data-start="0" data-duration="${C.dur}" data-track-index="20" data-volume="1"></audio>
  </div>
  <script>
    // Root renderer: worlds, camera and captions as ONE pure function of time (seek-safe; no state between frames).
    const CAPS = ${capData}, WORLDS = ${JSON.stringify(C.worlds.map(({ id, keys, iris }) => ({ id, keys, iris: iris || null })))}, CAM = ${JSON.stringify(C.cam)};
    const W = ${C.w}, H = ${C.h};
    const $ = (id) => document.getElementById(id);
    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
    const sm = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };
    const out3 = (k) => 1 - Math.pow(1 - clamp(k, 0, 1), 3);
    const EASE = { io: (u) => (u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2), lin: (u) => u };
    const keyed = (keys, t) => { // smoothstep between [t, value] keys, held at the ends
      if (t <= keys[0][0]) return keys[0][1];
      for (let i = 1; i < keys.length; i++) if (t < keys[i][0]) return keys[i - 1][1] + (keys[i][1] - keys[i - 1][1]) * sm((t - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]));
      return keys.at(-1)[1];
    };
    function camAt(t) {
      const i = CAM.findIndex((k) => k[0] > t);
      if (i <= 0) return (i < 0 ? CAM.at(-1) : CAM[0]).slice(1, 4);
      const a = CAM[i - 1], b = CAM[i], u = EASE[b[4] || "io"]((t - a[0]) / (b[0] - a[0]));
      return [1, 2, 3].map((j) => a[j] + (b[j] - a[j]) * u);
    }
    function hash(n) { let a = n * 9301 + 49297; a = Math.imul(a ^ a >>> 15, 1 | a); a = a + Math.imul(a ^ a >>> 7, 61 | a) ^ a; return ((a ^ a >>> 14) >>> 0) / 4294967296; }
    const worlds = WORLDS.map((w) => ({ ...w, node: $(w.id) }));
    const cam = $("camera"), grain = $("grain");
    const caps = CAPS.map((c, i) => ({ ...c, node: $("cap-" + i), ws: c.w.map((_, j) => $("cw-" + i + "-" + j)) }));
    caps.filter((c) => c.h).forEach((c, k) => { c.node.style.top = Math.round(H * 0.41 + k * 120) + "px"; }); // hero lines stack

    function render(t) {
      for (const w of worlds) {
        w.node.style.opacity = keyed(w.keys, t).toFixed(3);
        const ir = w.iris; // { t0, t1, at: "50% 48%", max: 1500, feather: 460 }: a soft hole opens in this layer
        if (ir && t > ir.t0 && t < ir.t1) {
          const r = Math.pow(sm((t - ir.t0) / (ir.t1 - ir.t0)), 1.15) * ir.max;
          const m = "radial-gradient(circle at " + ir.at + ", rgba(0,0,0,0) " + r.toFixed(1) + "px, rgba(0,0,0,1) " + (r + ir.feather).toFixed(1) + "px)";
          w.node.style.webkitMaskImage = m; w.node.style.maskImage = m;
        } else if (ir) { const done = t >= ir.t1; w.node.style.webkitMaskImage = "none"; w.node.style.maskImage = "none"; if (done) w.node.style.opacity = "0"; }
      }
      const [cx, cy, s] = camAt(t);
      cam.style.transform = "translate(" + (W / 2 - cx * s).toFixed(2) + "px," + (H / 2 - cy * s).toFixed(2) + "px) scale(" + s.toFixed(4) + ")";
      for (const c of caps) {
        if (!(t >= c.s && t < c.e)) { c.node.style.opacity = "0"; continue; }
        const fadeIn = sm((t - c.s) / 0.12), fadeOut = 1 - sm((t - (c.e - 0.16)) / 0.16);
        let dim = 1;
        if (c.h) { const later = caps.find((q) => q.h && q.s > c.s); if (later && t >= later.s) dim = 1 - 0.45 * sm((t - later.s) / 0.3); }
        c.node.style.opacity = (Math.min(fadeIn, fadeOut) * dim).toFixed(3);
        const lift = c.h ? 18 : 12;
        c.ws.forEach((w, j) => {
          const k = out3((t - (c.w[j] - 0.04)) / (c.h ? 0.42 : 0.26));
          w.style.opacity = k.toFixed(3);
          w.style.transform = "translateY(" + ((1 - k) * lift).toFixed(2) + "px)";
          w.style.filter = k < 0.999 ? "blur(" + ((1 - k) * 4).toFixed(2) + "px)" : "none";
        });
      }
      if (grain) { const step = Math.floor(t * 24); grain.style.transform = "translate3d(" + Math.floor(hash(step) * 512) + "px," + Math.floor(hash(step + 7777) * 512) + "px,0)"; }
      // Film-specific persistent elements (a taskbar, a progress tracker, a clock...) are rendered here too.
    }
    const clock = { t: 0 };
    const tl = gsap.timeline({ paused: true });
    tl.to(clock, { t: ${C.dur}, duration: ${C.dur}, ease: "none", onUpdate: () => render(clock.t) }, 0);
    render(0);
    window.__timelines["main"] = tl;
  </script>
</body>
</html>
`;
}

function skeleton(id) {
  const [s, d] = C.slots[id];
  return `<!doctype html>
<html><head><meta charset="UTF-8" /><title>${id}</title></head>
<body>
<template>
  <style>
    ${fontFace}
    #root { position: absolute; inset: 0; font-family: "${C.font.family}", sans-serif; color: ${C.color.ink}; }
  </style>
  <div id="root" data-composition-id="${id}" data-width="${C.w}" data-height="${C.h}">
  </div>
  <script>
    (() => {
      const G0 = ${s};                  // this slot starts at global ${s} s (duration ${d} s)
      const g = (t) => t - G0;          // author in GLOBAL seconds: tl.to(el, {...}, g(9.375))
      const tl = gsap.timeline({ paused: true });

      window.__timelines["${id}"] = tl;
    })();
  </script>
</template>
</body></html>
`;
}

fs.writeFileSync(path.join(ROOT, "index.html"), page(C.title, Object.keys(C.slots)));
fs.mkdirSync(path.join(ROOT, "compositions"), { recursive: true });
for (const id of Object.keys(C.slots)) { const f = path.join(ROOT, "compositions", id + ".html"); if (!fs.existsSync(f)) fs.writeFileSync(f, skeleton(id)); }
for (const [agent, ids] of Object.entries(C.agents)) {
  const dir = path.join(ROOT, "dev", agent);
  fs.mkdirSync(path.join(dir, "compositions"), { recursive: true });
  fs.cpSync(path.join(ROOT, "assets"), path.join(dir, "assets"), { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), page("dev " + agent, ids));
  for (const id of ids) { const f = path.join(dir, "compositions", id + ".html"); if (!fs.existsSync(f)) fs.writeFileSync(f, skeleton(id)); }
}
console.log(`root + ${Object.keys(C.agents).length} dev hosts written · ${chunks.length} caption chunks (${chunks.filter((c) => c.hero).length} hero) · audio: ${AUDIO}`);
