/* ============================================================
   FLAPPY �?? edição Miami (canvas puro, sem libs)
   O jogo N�?O decide dinheiro: ele fala com o servidor pelas
   4 chamadas (start / ping / cashout / lose) e mostra o resultado.
   ============================================================ */
(() => {
'use strict';

const G   = window.GAME;
const CFG = G.cfg;
const RATE  = Number(CFG.earn_rate) || .4;   // ganho por cano = aposta �? RATE
const METAX = Number(CFG.meta_mult) || 7;    // meta = aposta �? METAX (libera o cashout)
const STEP  = Number(CFG.bet_step)  || 5;
const DEMO  = !!G.demo;                      // modo grátis: sem login, sem dinheiro, sem API
const START = Math.max(1, Number(CFG.earn_start) || 1);   // começa a pagar neste cano
const EASY  = Math.max(0, Number(CFG.easy_pipes) || 0);   // canos fáceis do começo

/* ---------------- helpers ---------------- */
const fmt   = v => 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
const perUnit  = () => bet * RATE;                                  // R$ ganhos por cano
const paidUnits = () => Math.max(0, units - (START - 1));           // canos que realmente pagam
const curValue = () => Math.min(paidUnits() * perUnit(), CFG.max_win);   // acumulado da rodada
const metaVal  = () => Math.min(bet * METAX, CFG.max_win);          // meta pro cashout
const metaHit  = () => curValue() + 1e-9 >= metaVal();

async function api(path, body, tries = 1) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(G.api + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) });
      if (r.status === 401) { location.href = '/?p=entrar'; throw new Error('auth'); }
      return await r.json();
    } catch (e) { if (i === tries - 1) throw e; await new Promise(r => setTimeout(r, 700)); }
  }
}

/* ---------------- som ----------------
   Cada efeito toca o arquivo enviado na Central de Controle (aba Sons).
   Slot vazio = som sintetizado interno, como sempre foi.            */
const FILES = CFG.sounds || {};
const CLIPS = {};                                    // key -> HTMLAudioElement modelo
['bg', 'flap', 'score', 'hit'].forEach(k => {
  const url = FILES[k];
  if (!url) return;
  try {
    const a = new Audio(url);
    a.preload = 'auto';
    /* música de fundo: volume BAIXO (é fundo, não pode competir com o jogo)
       e em loop de verdade �?? quando acaba, recomeça sozinha. */
    if (k === 'bg') { a.loop = true; a.volume = .12; a.load(); }
    CLIPS[k] = a;
  } catch (e) {}
});

const SND = {
  ctx: null,
  on: localStorage.getItem('snd') !== '0',
  init() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); window.__actx = this.ctx; } catch (e) {} }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tone(f, d, type = 'square', g = .1, slide = 0) {
    g = Math.min(.55, g * 2.4);                       // volume geral do jogo
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime, o = this.ctx.createOscillator(), v = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t + d);
    v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(v); v.connect(this.ctx.destination); o.start(t); o.stop(t + d + .02);
  },
  /* ---- ruído branco reaproveitado (base da asa e do estalo da gaveta) ---- */
  noiseBuf() {
    if (!this._nb && this.ctx) {
      const n = Math.floor(this.ctx.sampleRate * .4);
      const b = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
      const d = b.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      this._nb = b;
    }
    return this._nb;
  },
  /* sopro filtrado: a frequência varre de f0 até f1 (dá o "fffiu" da asa) */
  noise(dur, f0, f1, g = .3, q = .9) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime;
    const s  = this.ctx.createBufferSource(); s.buffer = this.noiseBuf();
    const bp = this.ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = q;
    bp.frequency.setValueAtTime(f0, t);
    bp.frequency.exponentialRampToValueAtTime(Math.max(60, f1), t + dur);
    const v = this.ctx.createGain();
    v.gain.setValueAtTime(.0001, t);
    v.gain.exponentialRampToValueAtTime(g, t + dur * .22);      // ataque macio, sem estalo
    v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    s.connect(bp); bp.connect(v); v.connect(this.ctx.destination);
    s.start(t); s.stop(t + dur + .02);
  },
  /* sino metálico curto �?? é o "tim" do dinheiro (parciais desafinados = metal) */
  bell(f, dur, g = .14, delay = 0) {
    if (!this.on || !this.ctx) return;
    const t = this.ctx.currentTime + delay, v = this.ctx.createGain();
    v.gain.setValueAtTime(g, t); v.gain.exponentialRampToValueAtTime(.0001, t + dur);
    v.connect(this.ctx.destination);
    [[1, 1], [2.76, .5], [5.4, .22]].forEach(m => {
      const o = this.ctx.createOscillator(), gg = this.ctx.createGain();
      o.type = 'sine'; o.frequency.value = f * m[0]; gg.gain.value = m[1];
      o.connect(gg); gg.connect(v); o.start(t); o.stop(t + dur + .02);
    });
  },
  /* toca o arquivo do slot (clonado, pra dois disparos não se atropelarem).
     Devolve false quando não há arquivo �?? aí o chamador usa o som interno. */
  clip(k, vol = 1) {
    if (!this.on || !CLIPS[k]) return false;
    try {
      const n = CLIPS[k].cloneNode();
      n.volume = vol;
      const p = n.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) { return false; }
    return true;
  },
  /* A música toca do começo ao fim da SESS�?O na tela do jogo: não para quando
     o jogador morre nem entre rodadas �?? só quando ele sai (ou desliga o som).
     Pausar sem zerar o tempo faz ela continuar de onde estava ao voltar. */
  music(play) {
    const a = CLIPS.bg;
    if (!a) return;
    if (play && this.on) { const p = a.play(); if (p && p.catch) p.catch(() => {}); }
    else { try { a.pause(); } catch (e) {} }
  },
  /* batida de asa: sopro curto e macio, sem bip eletrônico */
  flap()  { if (this.clip('flap', 1)) return; this.noise(.16, 1400, 300, .52, .7); },
  /* dinheiro: estalo da gaveta + dois sinos = "cha-ching" de caixa */
  score() {
    if (this.clip('score')) return;
    this.noise(.055, 5200, 2600, .34, 2.4);     // gaveta abrindo
    this.bell(1180, .30, .21);                  // cha...
    this.bell(1770, .42, .18, .075);            // ...ching
  },
  tier()  { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.tone(f, .11, 'triangle', .11), i * 75)); },
  cash()  { if (this.clip('score')) return; [784, 988, 1175, 1568, 1976].forEach((f, i) => setTimeout(() => this.tone(f, .13, 'triangle', .12), i * 85)); },
  hit()   { if (this.clip('hit')) return; this.tone(150, .3, 'sawtooth', .16, -110); setTimeout(() => this.tone(90, .35, 'sawtooth', .14, -50), 90); },
};

/* ---------------- canvas ---------------- */
const cv = document.getElementById('cv');
const ctx = cv.getContext('2d');
if (!CanvasRenderingContext2D.prototype.roundRect) {         // Android antigo
  CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
    this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
    this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath(); return this;
  };
}
// Desktop expands the visible world horizontally instead of stretching a portrait canvas.
const desktopInput = window.matchMedia('(hover: hover) and (pointer: fine)');
let W = 450, H = 800, SCALE = 1, groundY = 700, BIRD_X = 118;
let bgCanvas = null;
let desktopLayout = false;
let resizeFrame = 0;

function resize() {
  const r = cv.getBoundingClientRect();
  if (!r.width || !r.height) return;
  const previousX = BIRD_X, previousGround = groundY, wasDesktop = desktopLayout;
  desktopLayout = desktopInput.matches;
  // Limit backing-store work on large/Retina displays while retaining a uniform scale.
  const pixelBudget = desktopLayout ? Math.sqrt(6000000 / (r.width * r.height)) : 2;
  const dpr = Math.min(window.devicePixelRatio || 1, 2, pixelBudget);
  cv.width = Math.max(1, Math.round(r.width * dpr));
  cv.height = Math.max(1, Math.round(r.height * dpr));
  if (desktopLayout) {
    H = 800;
    SCALE = cv.height / H;
    W = cv.width / SCALE;
    BIRD_X = W * (118 / 450);
  } else {
    W = 450;
    SCALE = cv.width / W;
    H = cv.height / SCALE;
    BIRD_X = 118;
  }
  groundY = H - 92;
  // Keep the distance to each obstacle when resizing an ongoing round.
  if (bird) {
    const dx = BIRD_X - previousX;
    for (const p of pipes) p.x += dx;
    for (const p of feathers) p.x += dx;
    for (const p of floats) p.x += dx;
    worldX -= dx;
    // A device can change its primary pointer (e.g. tablet with a mouse).
    if ((desktopLayout || wasDesktop) && previousGround !== groundY) {
      const dy = (groundY - previousGround) * .42;
      const limitY = y => clamp(y + dy, BIRD_R + 14, groundY - BIRD_R - 14);
      bird.y = limitY(bird.y); readyY = limitY(readyY);
      if (rewind) { rewind.y0 = limitY(rewind.y0); rewind.y1 = limitY(rewind.y1); }
      for (const p of pipes) {
        p.gap = Math.min(p.gap, Math.max(110, groundY - 140));
        p.gapY = clamp(p.gapY + dy, p.gap / 2 + 48, groundY - p.gap / 2 - 48);
      }
      if (state === 'fly') {
        paused = true;
        showFlightPrompt('paused');
      }
    }
  }
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  prerenderBg();
  fitWin();
  if (msgTap.style.display === 'flex' && (state === 'ready' || paused)) {
    showFlightPrompt(paused ? 'paused' : flightPrompt);
  }
}
function queueResize() {
  cancelAnimationFrame(resizeFrame);
  resizeFrame = requestAnimationFrame(resize);
}
window.addEventListener('resize', queueResize);
desktopInput.addEventListener('change', queueResize);

/* ---------------- fundo Miami (pré-desenhado) ---------------- */
/* ==================== CENÁRIOS ====================
   Cada cenário sabe desenhar 4 coisas: o fundo parado (bg), o que tem
   parallax (props), os canos (pipe) e o chão (ground). Trocar de cenário
   N�?O mexe em nada da física �?? cano, pulo e queda seguem iguais.
   Cenário novo = só adicionar aqui embaixo que ele já aparece no seletor. */
let sceneKey = 'classico';
function SCENE() { return SCENES[sceneKey] || SCENES.classico; }

const SCENES = {

  /* ---------- CLÁSSICO (padrão) �?? a cara do flappy original ---------- */
  classico: {
    nome: 'Clássico',
    dica: 'Céu azul e canos verdes',
    preview: 'linear-gradient(180deg,#4ec0ca 0 56%,#7ed957 56% 68%,#ded895 68% 100%)',

    bg(b) {
      const grassY = groundY - 58;                       // faixa de mato acima do chão
      const sky = b.createLinearGradient(0, 0, 0, groundY);
      sky.addColorStop(0, '#4ec0ca'); sky.addColorStop(1, '#9ee0e6');
      b.fillStyle = sky; b.fillRect(0, 0, W, groundY);

      // prédios claros ao fundo
      const seed = [46, 78, 52, 90, 40, 68, 96, 50, 72, 60];
      let x = -12, si = 0;
      while (x < W + 20) {
        const bw = 40 + seed[si % seed.length] % 26;
        const bh = 54 + seed[(si + 4) % seed.length] * .55;
        b.fillStyle = si % 2 ? '#bfe9d6' : '#a9e0c8';
        b.fillRect(x, grassY - bh, bw, bh);
        b.fillStyle = 'rgba(255,255,255,.55)';            // janelinhas
        for (let wy = grassY - bh + 10; wy < grassY - 10; wy += 15)
          for (let wx = x + 7; wx < x + bw - 8; wx += 13) b.fillRect(wx, wy, 5, 7);
        x += bw + 8; si++;
      }

      // nuvens brancas encostadas no horizonte
      b.fillStyle = '#ffffff';
      for (let i = 0; i < 7; i++) {
        const cx = 30 + i * (W / 6.2), cy = grassY - 78 - (i % 3) * 16;
        b.beginPath();
        b.arc(cx, cy, 17, 0, Math.PI * 2); b.arc(cx + 20, cy - 9, 22, 0, Math.PI * 2);
        b.arc(cx + 46, cy, 16, 0, Math.PI * 2); b.fill();
        b.fillRect(cx - 16, cy, 64, 16);
      }

      // moitas verdes
      b.fillStyle = '#7ed957';
      b.fillRect(0, grassY, W, 58);
      b.beginPath();
      for (let bx = -20; bx < W + 40; bx += 34) b.arc(bx, grassY + 2, 19, Math.PI, 0);
      b.fill();
      b.fillStyle = '#5ec95a';
      b.beginPath();
      for (let bx = -6; bx < W + 40; bx += 46) b.arc(bx, grassY + 18, 15, Math.PI, 0);
      b.fill();
    },

    props() {
      // nuvens que passam devagar
      ctx.fillStyle = 'rgba(255,255,255,.92)';
      const cloudCount = desktopLayout ? Math.ceil(W / 200) + 1 : 3;
      for (let i = 0; i < cloudCount; i++) {
        const cx = ((i * 200 - (worldX * .10 + tGlobal * 5)) % (W + 200) + W + 200) % (W + 200) - 100;
        const cy = 82 + (i % 3) * 52;
        ctx.beginPath();
        ctx.arc(cx, cy, 15, 0, Math.PI * 2); ctx.arc(cx + 19, cy - 8, 19, 0, Math.PI * 2); ctx.arc(cx + 42, cy, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(cx - 14, cy, 58, 14);
      }
    },

    pipe(p) {
      const g = p.gap || GAP0;
      const topH = p.gapY - g / 2, botY = p.gapY + g / 2;
      const CAP = 26, OUT = '#2f5e16';
      const body = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      body.addColorStop(0, '#4d8f26'); body.addColorStop(.16, '#a7e05a');
      body.addColorStop(.52, '#74c034'); body.addColorStop(1, '#3d7a1c');

      ctx.lineJoin = 'miter';
      ctx.strokeStyle = OUT; ctx.lineWidth = 3; ctx.fillStyle = body;
      // cano de cima: corpo + bocal
      ctx.fillRect(p.x, -4, PIPE_W, topH - CAP + 4);
      ctx.strokeRect(p.x + 1.5, -6, PIPE_W - 3, topH - CAP + 6);
      ctx.fillRect(p.x - 8, topH - CAP, PIPE_W + 16, CAP);
      ctx.strokeRect(p.x - 6.5, topH - CAP + 1.5, PIPE_W + 13, CAP - 3);
      // cano de baixo
      ctx.fillRect(p.x, botY + CAP, PIPE_W, groundY - botY - CAP + 4);
      ctx.strokeRect(p.x + 1.5, botY + CAP + 1.5, PIPE_W - 3, groundY - botY - CAP);
      ctx.fillRect(p.x - 8, botY, PIPE_W + 16, CAP);
      ctx.strokeRect(p.x - 6.5, botY + 1.5, PIPE_W + 13, CAP - 3);
      // brilhinho do plástico
      ctx.fillStyle = 'rgba(255,255,255,.30)';
      ctx.fillRect(p.x + 12, 0, 7, topH - CAP);
      ctx.fillRect(p.x + 12, botY + CAP, 7, groundY - botY - CAP);
    },

    ground() {
      ctx.fillStyle = '#ded895';
      ctx.fillRect(0, groundY, W, H - groundY);
      ctx.fillStyle = '#5ec95a'; ctx.fillRect(0, groundY, W, 13);
      ctx.fillStyle = '#4aa93f'; ctx.fillRect(0, groundY + 13, W, 5);
      ctx.fillStyle = '#d3c97f';
      const off = worldX % 26;
      for (let x = -off; x < W + 26; x += 26) {
        ctx.beginPath();
        ctx.moveTo(x, groundY + 18); ctx.lineTo(x + 13, groundY + 18);
        ctx.lineTo(x + 3, H); ctx.lineTo(x - 10, H); ctx.closePath(); ctx.fill();
      }
    },
  },

  /* ---------- MIAMI (o synthwave que já existia) ---------- */
  miami: {
    nome: 'Miami',
    dica: 'Pôr do sol synthwave',
    preview: 'linear-gradient(180deg,#241056 0 30%,#c2447e 55%,#ff8a4c 68%,#eac57e 82% 100%)',

    bg(b) {
      const horizon = H * .58;

      const sky = b.createLinearGradient(0, 0, 0, horizon);
      sky.addColorStop(0, '#241056'); sky.addColorStop(.45, '#6d2a7f');
      sky.addColorStop(.75, '#c2447e'); sky.addColorStop(1, '#ff8a4c');
      b.fillStyle = sky; b.fillRect(0, 0, W, horizon);

      for (let i = 0; i < 40; i++) {                     // estrelas
        b.globalAlpha = .3 + Math.random() * .5;
        b.fillStyle = '#ffe9f7';
        b.fillRect(Math.random() * W, Math.random() * horizon * .45, 1.6, 1.6);
      }
      b.globalAlpha = 1;

      const sx = W * .62, sy = horizon - 8, sr = 92;     // sol listrado
      const sun = b.createLinearGradient(0, sy - sr, 0, sy + sr);
      sun.addColorStop(0, '#ffe259'); sun.addColorStop(1, '#ff5e8a');
      b.save();
      b.beginPath(); b.arc(sx, sy, sr, Math.PI, 0); b.closePath(); b.clip();
      b.fillStyle = sun; b.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      b.fillStyle = 'rgba(109,42,127,.9)';
      for (let i = 0; i < 5; i++) b.fillRect(sx - sr, sy - 6 - i * 16, sr * 2, 3.5 + i * 1.1);
      b.restore();

      b.font = '900 30px Montserrat, sans-serif';         // letreiro neon
      b.textAlign = 'center';
      b.shadowColor = '#ff5e8a'; b.shadowBlur = 18;
      b.strokeStyle = '#ffd1e8'; b.lineWidth = 1.6;
      b.strokeText(G.brand.toUpperCase(), W / 2, H * .17);
      b.shadowBlur = 0;

      b.fillStyle = '#1c0f3d';                            // skyline
      let x = -10;
      const seed = [42, 74, 55, 88, 38, 66, 95, 48, 70, 58];
      let si = 0;
      while (x < W + 20) {
        const bw = 34 + seed[si % seed.length] % 30;
        const bh = 40 + seed[(si + 3) % seed.length];
        b.fillRect(x, horizon - bh, bw, bh);
        b.fillStyle = '#2a1655';
        for (let wy = horizon - bh + 8; wy < horizon - 8; wy += 14)
          for (let wx = x + 5; wx < x + bw - 6; wx += 12)
            if ((wx + wy + si) % 3 === 0) { b.fillStyle = (wx + wy) % 2 ? '#ffd77e' : '#7de3ff'; b.fillRect(wx, wy, 3.5, 5); }
        b.fillStyle = '#1c0f3d';
        x += bw + 6; si++;
      }

      const sea = b.createLinearGradient(0, horizon, 0, groundY);
      sea.addColorStop(0, '#8a2f78'); sea.addColorStop(.5, '#5e2a86'); sea.addColorStop(1, '#341a5e');
      b.fillStyle = sea; b.fillRect(0, horizon, W, groundY - horizon);
      b.globalAlpha = .35;
      for (let i = 0; i < 26; i++) {
        b.fillStyle = i % 3 ? '#ff9ecf' : '#ffd77e';
        const ry = horizon + 6 + Math.random() * (groundY - horizon - 14);
        b.fillRect(Math.random() * W, ry, 18 + Math.random() * 46, 1.6);
      }
      b.globalAlpha = 1;
    },

    props() {
      ctx.fillStyle = 'rgba(255,182,220,.5)';             // nuvens rosadas
      const cloudCount = desktopLayout ? Math.ceil(W / 190) + 1 : 3;
      for (let i = 0; i < cloudCount; i++) {
        const cx = ((i * 190 - (worldX * .12 + tGlobal * 6)) % (W + 160) + W + 160) % (W + 160) - 80;
        const cy = 70 + (i % 3) * 46;
        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.arc(cx + 18, cy - 7, 13, 0, Math.PI * 2); ctx.arc(cx + 36, cy, 15, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = 0, count = desktopLayout ? Math.ceil(W / 170) + 1 : 4; i < count; i++) { // palmeiras
        const px = ((i * 170 - worldX * .38) % (W + 220) + W + 220) % (W + 220) - 110;
        drawPalm(px, groundY + 4, .9 + (i % 2) * .25, Math.sin(tGlobal * 1.4 + i) * 3);
      }
    },

    pipe(p) {
      const g = p.gap || GAP0;
      const topH = p.gapY - g / 2, botY = p.gapY + g / 2;
      const body = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0);
      body.addColorStop(0, '#0b5e6e'); body.addColorStop(.5, '#22d3ee'); body.addColorStop(1, '#0b5e6e');

      ctx.fillStyle = body;
      ctx.fillRect(p.x, 0, PIPE_W, topH - 16);
      ctx.fillRect(p.x, botY + 16, PIPE_W, groundY - botY - 16);

      ctx.save();
      ctx.shadowColor = 'rgba(34,211,238,.75)'; ctx.shadowBlur = 14;
      ctx.fillStyle = body;
      ctx.fillRect(p.x - 6, topH - 18, PIPE_W + 12, 20);
      ctx.fillRect(p.x - 6, botY - 2, PIPE_W + 12, 20);
      ctx.restore();

      ctx.fillStyle = 'rgba(255,255,255,.28)';
      ctx.fillRect(p.x + 10, 0, 5, topH - 18);
      ctx.fillRect(p.x + 10, botY + 18, 5, groundY - botY - 18);
    },

    ground() {
      ctx.fillStyle = '#eac57e';
      ctx.fillRect(0, groundY, W, H - groundY);
      ctx.fillStyle = '#d9a854';
      const off = worldX % 46;
      for (let x = -off; x < W; x += 46) ctx.fillRect(x, groundY, 23, H - groundY);
      ctx.save();
      ctx.shadowColor = 'rgba(34,211,238,.9)'; ctx.shadowBlur = 10;
      ctx.fillStyle = '#22d3ee';
      ctx.fillRect(0, groundY - 2.5, W, 3);
      ctx.restore();
    },
  },
};

function prerenderBg() {
  bgCanvas = document.createElement('canvas');
  bgCanvas.width = Math.round(W * SCALE); bgCanvas.height = Math.round(H * SCALE);
  const b = bgCanvas.getContext('2d');
  b.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  SCENE().bg(b);
}

/* palmeira (silhueta) �?? usada pelo cenário Miami */
function drawPalm(px, baseY, s, sway) {
  ctx.save();
  ctx.translate(px, baseY);
  ctx.scale(s, s);
  ctx.strokeStyle = '#160b33'; ctx.fillStyle = '#160b33';
  ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -46, 4 + sway, -86); ctx.stroke();
  const tx = 4 + sway, ty = -86;
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * .5 + sway * .012;
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(tx + Math.cos(a) * 30, ty + Math.sin(a) * 30 - 8, tx + Math.cos(a) * 52, ty + Math.sin(a) * 52 + 12);
    ctx.lineWidth = 5; ctx.stroke();
  }
  ctx.restore();
}

/* O cenário é escolhido no LOBBY (fica guardado no aparelho); aqui o jogo
   só lê a escolha. Ordem: escolha do jogador > padrão do admin > clássico. */
const SCENE_LS = 'cenario_' + (G.tenant || location.hostname);
(function loadScene() {
  if (CFG.scene && SCENES[CFG.scene]) sceneKey = CFG.scene;
  try { const s = localStorage.getItem(SCENE_LS); if (s && SCENES[s]) sceneKey = s; } catch (e) {}
})();

/* ---------------- estado do jogo ---------------- */
let state = 'bet';           // bet | ready | fly | dying | dead | won
let paused = false;
let balance = Number(G.balance);
let bet = Number(CFG.default_bet) || 5, roundId = null, units = 0;   // aposta padrão do admin
let bird, pipes, worldX, feathers, floats, shake, deadAt;
let readyY = 0, rewind = null;          // posição de espera e o retrocesso do teste grátis
let tLast = 0, tGlobal = 0;

/* Voo e obstáculos: tudo o que muda por preset vem da Central de Controle
   (os controles de 0�??100% já chegam aqui traduzidos em pixels/segundo). */
const PH       = CFG.phys || {};
const PIPE_W   = 68;
const SPACING  = Number(PH.spacing)  || 340;     // distância entre um cano e outro
const GAP0     = Number(PH.gap0)     || 232;     // abertura inicial da passagem
const GAP_MIN  = Math.min(GAP0, Number(PH.gapMin) || 185);   // menor abertura permitida
const TAPER    = Number(PH.taper)    || 0;       // quanto a passagem fecha por cano
const SPEED0   = Number(PH.speed0)   || 130;     // velocidade inicial
const SPEED_MAX= Math.max(SPEED0, Number(PH.speedMax) || 160);
const ACCEL    = Number(PH.accel)    || 0;       // ganho de velocidade por cano
const HVAR     = Number(PH.hvar)     || 150;     // variação da altura da passagem
/* Voo do pássaro (vale pro grátis e pro apostado):
   pulo mais curto = mais toques e controle mais fino. A gravidade e a
   queda máxima acompanham, senão o pulinho não sustenta a altura. */
const GRAV = 760, FLAP = -220, MAXFALL = 350;
const BIRD_R = 22;                 // pássaro maior
const HIT = BIRD_R - 5;                          // hitbox mais generosa que o desenho

let pipeIdx = 0;                                 // quantos canos já nasceram nesta rodada

function resetWorld() {
  bird = { y: H * .42, vy: 0, rot: 0, wing: 0 };
  readyY = H * .42;                      // onde o pássaro espera o toque
  pipes = []; worldX = 0; units = 0; pipeIdx = 0;
  feathers = []; floats = []; shake = 0;
}

function speedNow() { return Math.min(SPEED_MAX, SPEED0 + units * ACCEL); }

/* abertura do cano nº i: os "canos fáceis do começo" não afunilam.
   O último min() é a trava de tela baixa (celular deitado): sem ela a passagem
   fica maior que a área jogável e o cano de baixo cai fora do chão. */
function gapFor(i) {
  const g = clamp(GAP0 - TAPER * Math.max(0, i - EASY), GAP_MIN, GAP0);
  return Math.min(g, Math.max(110, groundY - 140));
}

function spawnPipes() {
  // Keep the first obstacle at the same distance as the mobile game.
  let lastX = pipes.length ? pipes[pipes.length - 1].x : BIRD_X + 197 - SPACING;
  while (lastX < W + SPACING) {
    const first = pipeIdx === 0;
    const gap   = gapFor(pipeIdx);
    const lo = gap / 2 + 48, hi = groundY - gap / 2 - 48;
    /* Degrau de altura de um cano pro outro.
       Teto: nunca mais do que o pássaro consegue subir/descer no tempo até
       chegar lá (senão vira queda brusca impossível quando acelera).
       Piso: SEMPRE muda de altura um mínimo �?? sem isso o jogo rápido virava
       um túnel reto e o jogador só segurava o dedo até a meta. */
    const tAtePipe = SPACING / Math.max(1, speedNow());       // segundos até o próximo cano
    const teto  = Math.min(pipeIdx < EASY ? HVAR * .2 : HVAR,
                           Math.max(70, 120 * tAtePipe));     // nunca abaixo de 70px de variação
    const piso  = Math.min(32, teto * .5);                    // degrau mínimo só pra não virar túnel
    const prevGap = first ? H * .46 : pipes[pipes.length - 1].gapY;
    let gapY;
    if (first) {
      gapY = clamp(H * .46, lo, hi);
    } else {
      const passo = piso + Math.random() * (teto - piso);
      const dir   = Math.random() < .5 ? -1 : 1;
      gapY = prevGap + passo * dir;
      if (gapY < lo || gapY > hi) gapY = prevGap - passo * dir;   // bateu no limite: vai pro outro lado
      gapY = clamp(gapY, lo, hi);
    }
    pipes.push({ x: lastX + SPACING, gapY, gap, scored: false });
    lastX += SPACING;
    pipeIdx++;
  }
}

/* ---------------- HUD / telas ---------------- */
const $ = id => document.getElementById(id);
const hudBet = $('hud-bet'), hudSaldo = $('hud-saldo'), hudWin = $('hud-win'), hudBar = $('hud-bar'), hudMeta = $('hud-meta');
const btnCash = $('btn-cash'), cashVal = $('cash-val'), btnSair = $('btn-sair'), btnSound = $('btn-sound');
const ovBet = $('ov-bet'), ovWin = $('ov-win'), ovDead = $('ov-dead'), msgTap = $('msg-tap');

/* o acumulado encolhe a fonte até caber no espaço entre os dois cards do topo �??
   sem isso, valor de 4 dígitos passa por cima da Aposta e da Meta. */
function fitWin() {
  const WIN_FS = desktopLayout && window.innerWidth >= 900 ? 44 : 34;
  hudWin.style.fontSize = WIN_FS + 'px';
  const espaco = hudWin.parentElement.clientWidth - 12;
  for (let fs = WIN_FS; fs > 14 && hudWin.offsetWidth > espaco; fs -= 1) hudWin.style.fontSize = fs + 'px';
}

function hud() {
  const val = curValue(), meta = metaVal();
  hudBet.textContent = fmt(bet);
  hudSaldo.textContent = DEMO ? 'JOGO GRÁTIS' : 'Saldo ' + fmt(balance);
  hudWin.textContent = fmt(val);
  hudMeta.textContent = metaHit() ? 'LIBERADO �??' : fmt(meta);
  hudMeta.classList.toggle('ok', metaHit());
  fitWin();
  document.getElementById('stage').classList.toggle('can-cashout', (state === 'fly' || state === 'ready') && metaHit());
  hudBar.style.width = Math.min(100, Math.round(val / meta * 100)) + '%';
  /* o botão só nasce quando a meta bate �?? antes disso nada na tela atrapalhando.
     Vale voando E na espera do toque: quem já bateu a meta resgata quando quiser. */
  if ((state === 'fly' || state === 'ready') && metaHit()) {
    btnCash.style.display = 'flex';
    btnCash.classList.remove('locked');
    btnCash.firstElementChild.textContent = 'RESGATAR';
    cashVal.textContent = fmt(val);
  } else btnCash.style.display = 'none';
}

let flightPrompt = 'start';
function showFlightPrompt(kind = 'start') {
  flightPrompt = kind;
  msgTap.style.display = 'flex';
  const desktop = desktopInput.matches;
  msgTap.querySelector('.t1').textContent = kind === 'paused' ? 'Pausado' : kind === 'retry' ? 'Quase!' : desktop ? 'Pronto para voar?' : 'Toque para voar';
  msgTap.querySelector('.t2').textContent = desktop
    ? (kind === 'paused' ? 'Clique no cenário ou use Espaço / �?? para continuar.' : 'Clique no cenário ou use Espaço / �?? para bater as asas.')
    : (kind === 'paused' ? 'Toque para continuar' : kind === 'retry' ? 'Toque para voltar a voar' : 'Toque na tela para bater as asas');
}

/* tela de aposta (stepper �?? valor �?, atalhos, meta) */
const chipsBox = $('chips'), betErr = $('bet-err'), btnPlay = $('btn-play'), betSaldo = $('bet-saldo');
const betVal = $('bet-val'), betShow = $('bet-show'), metaShow = $('meta-show'), betLimits = $('bet-limits');
const PRESETS = [5, 20, 100, 500].filter(v => v >= CFG.min_bet && v <= CFG.max_bet);

function setBet(v) {
  bet = clamp(Math.round(v / STEP) * STEP, CFG.min_bet, CFG.max_bet);
  renderBet();
}
function renderBet() {
  betVal.textContent = Number(bet).toFixed(2).replace('.', ',');
  betShow.textContent = fmt(bet);
  metaShow.textContent = fmt(metaVal());
  betSaldo.textContent = 'Saldo: ' + fmt(balance);
  betLimits.textContent = 'Min: ' + fmt(CFG.min_bet) + '  |  Max: ' + fmt(CFG.max_bet) + '  |  Passo: ' + fmt(STEP);
  chipsBox.querySelectorAll('.chip').forEach(c => c.classList.toggle('sel', Number(c.dataset.v) === bet));
  validateBet();
}
function validateBet() {
  const err = (!DEMO && bet > balance) ? 'Saldo insuficiente.' : '';
  betErr.textContent = err;
  btnPlay.disabled = !!err;
  return !err;
}
chipsBox.innerHTML = '';
PRESETS.forEach(v => {
  const c = document.createElement('button');
  c.className = 'chip'; c.dataset.v = v; c.textContent = v >= 100 ? String(v) : 'R$' + v;
  c.onclick = () => setBet(v);
  chipsBox.appendChild(c);
});
$('bet-minus').onclick = () => setBet(bet - STEP);
$('bet-plus').onclick = () => setBet(bet + STEP);

/* rodada grátis: nada de escolher valor �?? entra direto no "toque para voar" */
function startDemoRound() {
  roundId = 'demo';
  resgateEmCurso = false;
  setBet(bet);
  resetWorld(); spawnPipes(); state = 'ready';
  ovBet.classList.add('hidden'); ovWin.classList.add('hidden'); ovDead.classList.add('hidden');
  showFlightPrompt();
  cv.focus({preventScroll:true});
  hud();
}

function showBetScreen() {
  if (DEMO) { startDemoRound(); return; }   // no teste grátis não existe tela de aposta
  state = 'bet'; resetWorld();
  ovWin.classList.add('hidden'); ovDead.classList.add('hidden');
  ovBet.classList.remove('hidden');
  setBet(bet); hud();
}

/* ---------------- fluxo da rodada ---------------- */
btnPlay.onclick = async () => {
  if (!validateBet()) return;
  SND.init();
  if (DEMO) { startDemoRound(); return; }           // rodada de mentirinha, tudo local
  btnPlay.disabled = true; btnPlay.textContent = 'PREPARANDO...';
  try {
    const d = await api('start', { bet_amount: bet });
    if (d.error) {
      betErr.textContent = d.error === 'saldo_insuficiente' ? 'Saldo insuficiente.'
                        : d.error === 'aposta_invalida' ? ('Aposta entre ' + fmt(d.min) + ' e ' + fmt(d.max))
                        : 'Erro ao iniciar. Tenta de novo.';
    } else {
      roundId = d.round_id; balance = Number(d.balance);
      resetWorld(); spawnPipes(); state = 'ready';   // cano já aparece na tela de "toque para voar"
      ovBet.classList.add('hidden');
      showFlightPrompt();
      cv.focus({preventScroll:true});
    }
  } catch (e) { betErr.textContent = 'Sem conexão. Tenta de novo.'; }
  btnPlay.disabled = false; btnPlay.textContent = 'Confirmar';
  hud();
};

function flap() {
  if (paused) { paused = false; msgTap.style.display = 'none'; }
  if (state === 'ready') {
    state = 'fly'; msgTap.style.display = 'none'; spawnPipes(); hud();
    SND.music(true);                       // música de fundo começa no 1º toque
  }
  if (state !== 'fly') return;
  bird.vy = FLAP; bird.wing = 1;
  SND.init(); SND.flap();
  for (let i = 0; i < 4; i++)
    feathers.push({ x: BIRD_X - 10, y: bird.y + 8, vx: -40 - Math.random() * 60, vy: 20 + Math.random() * 40, r: 2 + Math.random() * 2.5, a: .8, c: i % 2 ? '#ffe9a8' : '#ffd1e8' });
}

/* fim de demo: mostra "você poderia ter ganho" e chama pro cadastro */
function demoEnd() {
  state = 'won'; btnCash.style.display = 'none';
  $('win-title').textContent = 'Você poderia ter ganho:';
  $('win-mult').style.display = 'none';
  $('win-val').textContent = '+' + fmt(curValue());
  $('win-sub').style.display = 'none';
  $('win-home').style.display = 'none';
  $('btn-again-w').textContent = 'JOGAR PRA VALER!';
  ovWin.classList.remove('hidden');
}

async function doCashout() {
  if ((state !== 'fly' && state !== 'ready') || !metaHit()) return;
  if (DEMO) { demoEnd(); return; }
  state = 'won'; btnCash.style.display = 'none';
  let d = null;
  try { d = await api('cashout', { round_id: roundId, units }, 3); } catch (e) {}
  if (d && d.error === 'meta_nao_batida') {   // servidor recusou (rodada segue viva)
    state = 'fly'; hud(); return;
  }
  if (!d || d.error) {
    // rede falhou no momento do dinheiro: volta pro lobby, o servidor fecha a rodada
    alert('Não consegui confirmar o cashout. Confere em "Minhas apostas".');
    location.href = G.home; return;
  }
  balance = Number(d.balance);
  SND.cash();
  $('win-mult').textContent = 'x' + Number(d.multiplier);
  $('win-val').textContent = '+' + fmt(d.payout);
  $('win-sub').textContent = d.units + ' ' + CFG.unit_label + ' · saldo ' + fmt(balance);
  ovWin.classList.remove('hidden');
  hud();
}

function finishLoss() {
  if (DEMO) return;                             // no teste grátis quem encerra é o resgate
  if (state === 'dead') return;                 // não repete se o loop chamar de novo
  state = 'dead';
  const linha = () => 'Aposta -' + fmt(bet) + ' · saldo ' + fmt(balance);
  /* mostra a mensagem NA HORA �?? o saldo já está descontado desde o início da
     rodada, então não precisa esperar a resposta do servidor pra avisar. */
  $('dead-sub').textContent = 'Você passou ' + units + ' ' + CFG.unit_label + '. Ajuste o ritmo e tente outra rodada.';
  $('dead-val').textContent = linha();
  ovDead.classList.remove('hidden');
  hud();
  /* fecha a rodada no servidor em segundo plano e corrige o saldo se mudar */
  api('lose', { round_id: roundId, units }, 2)
    .then(d => { if (d && !d.error) { balance = Number(d.balance); $('dead-val').textContent = linha(); hud(); } })
    .catch(() => {});
}

/* ---- segunda chance do teste grátis ----
   No jogo grátis, bater antes da meta não encerra: o mundo volta ~1 segundo,
   o pássaro reaparece na altura do buraco do próximo cano e o jogo espera o
   toque de novo. O dinheiro acumulado N�?O volta (os canos já passados seguem
   marcados), então ninguém pontua duas vezes. */
/* No teste grátis a rodada N�?O acaba batendo: o mundo retrocede e o jogo
   continua, quantas vezes for. A única forma de encerrar é o jogador clicar
   em resgatar (aí entra a tela de "você poderia ter ganho"). */
let resgateEmCurso = false;

/* começa o retrocesso: o mundo volta ~1 segundo NA TELA, sem reiniciar nada.
   Canos já passados continuam passados; o dinheiro acumulado não muda. */
function rewindDemo() {
  const dist = speedNow() * 1.0;                       // 1 segundo de mundo

  // altura segura: a do buraco do cano que vier pela frente depois do retrocesso
  let alvo = null;
  for (const p of pipes) {
    const xFinal = p.x + dist;
    if (xFinal + PIPE_W > BIRD_X && (!alvo || xFinal < alvo.x + dist)) alvo = p;
  }
  const destino = alvo ? clamp(alvo.gapY, BIRD_R + 14, groundY - BIRD_R - 14) : bird.y;

  feathers = []; shake = 0; deadAt = 0;
  bird.vy = 0;
  rewind = { p: 0, dur: .6, dist, y0: bird.y, y1: destino };
  state  = 'rewind';
  msgTap.style.display = 'flex';
  msgTap.querySelector('.t1').textContent = '⏪ Voltando...';
  msgTap.querySelector('.t2').textContent = 'segura essa, o teste continua';
  hud();
}

function die() {
  if (state !== 'fly') return;
  state = 'dying'; deadAt = 0; shake = 1;
  btnCash.style.display = 'none';
  SND.hit();
  for (let i = 0; i < 14; i++)
    feathers.push({ x: BIRD_X, y: bird.y, vx: -80 + Math.random() * 200, vy: -140 + Math.random() * 160, r: 2 + Math.random() * 3, a: 1, c: i % 2 ? '#ffd93d' : '#ffe9a8' });

  // teste grátis: antes da meta o jogo não acaba, só retrocede
  if (DEMO) {
    resgateEmCurso = true;
    setTimeout(rewindDemo, 420);                       // deixa ver a batida antes de voltar
  }
}

btnCash.onclick = e => { e.stopPropagation(); doCashout(); };
btnSair.onclick = async e => {
  e.stopPropagation();
  SND.music(false);                  // só para de tocar ao SAIR da tela
  if (!DEMO && (state === 'fly' || state === 'ready')) {
    if (!confirm('Sair agora encerra a rodada.')) return;
    try {
      if (metaHit()) await api('cashout', { round_id: roundId, units }, 2);
      else await api('lose', { round_id: roundId, units });
    } catch (err) {}
  }
  location.href = G.home;
};
/* ícone do som em SVG branco (o emoji vinha colorido e destoava do HUD) */
const ICO_SND_ON  = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
const ICO_SND_OFF = '<svg viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
const pintaSom = () => { btnSound.innerHTML = SND.on ? ICO_SND_ON : ICO_SND_OFF; };
btnSound.onclick = e => {
  e.stopPropagation();
  SND.on = !SND.on; localStorage.setItem('snd', SND.on ? '1' : '0');
  SND.music(SND.on);
  pintaSom();
};
pintaSom();
$('btn-again-w').onclick = () => { if (DEMO) location.href = '/?p=entrar&tab=cadastro'; else showBetScreen(); };
$('btn-again-d').onclick = showBetScreen;

/* Each primary click/key press produces one impulse; controls keep their own keys. */
cv.addEventListener('pointerdown', event => {
  if (event.button !== 0 || !event.isPrimary) return;
  event.preventDefault();
  cv.focus({preventScroll:true});
  flap();
});
document.addEventListener('keydown', e => {
  if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
  if (e.target.closest?.('button,a,input,select,textarea,[contenteditable="true"],[role="button"]')) return;
  if (e.ctrlKey || e.altKey || e.metaKey || e.repeat || e.isComposing) return;
  if (state !== 'ready' && state !== 'fly') return;
  e.preventDefault(); flap();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    SND.music(false);                  // aba escondida: silencia
    if (state === 'fly') {
      paused = true;
      showFlightPrompt('paused');
    }
  } else {
    SND.music(true);                   // voltou pra aba: música volta de onde parou
  }
});

/* ---------------- update ---------------- */
function update(dt) {
  tGlobal += dt;
  // esperando o toque: pássaro PARADO (sem sobe-e-desce, sem bater asa)
  if (state === 'ready') { bird.y = readyY; bird.wing = 0; return; }
  if (state === 'rewind') {
    const r = rewind, passo = Math.min(1, r.p + dt / r.dur), d = (passo - r.p) * r.dist;
    r.p = passo;
    for (const p of pipes) p.x += d;                   // mundo andando pra trás
    worldX -= d;
    const k = 1 - Math.pow(1 - passo, 2);              // desacelera no fim
    bird.y   = r.y0 + (r.y1 - r.y0) * k;
    bird.rot = -.22;                                   // de ré
    bird.wing = Math.max(0, Math.sin(tGlobal * 10));
    updateFx(dt);
    if (passo >= 1) {
      readyY = r.y1; bird.y = r.y1; bird.rot = 0; rewind = null;
      state = 'ready'; resgateEmCurso = false;
      showFlightPrompt('retry');
      hud();                                           // devolve o botão de resgatar na hora
    }
    return;
  }
  if (state !== 'fly' && state !== 'dying') return;
  if (paused) return;

  // física do pássaro (ao morrer ele despenca mais rápido, pra não ter espera)
  const grav = state === 'dying' ? GRAV * 2.2 : GRAV;
  const maxq = state === 'dying' ? MAXFALL * 2.4 : MAXFALL;
  bird.vy = clamp(bird.vy + grav * dt, FLAP, maxq);
  bird.y += bird.vy * dt;
  bird.rot = clamp(bird.vy / 520, -.32, 1.1);
  bird.wing = Math.max(0, bird.wing - dt * 5);
  if (bird.y < BIRD_R) { bird.y = BIRD_R; bird.vy = 0; }

  if (state === 'dying') {
    if (bird.y + BIRD_R >= groundY) { bird.y = groundY - BIRD_R; deadAt += dt; if (deadAt > .12 && !resgateEmCurso) finishLoss(); }
    shake = Math.max(0, shake - dt * 2.2);
    updateFx(dt);
    return;
  }

  // mundo anda
  const sp = speedNow();
  worldX += sp * dt;
  for (const p of pipes) p.x -= sp * dt;
  if (pipes[0] && pipes[0].x < -PIPE_W - 10) pipes.shift();
  spawnPipes();

  // pontuação: cada cano soma R$ no acumulado
  for (const p of pipes) {
    if (!p.scored && p.x + PIPE_W < BIRD_X - BIRD_R) {
      p.scored = true; units++;
      const paying = units >= START;                       // antes disso o cano é de aquecimento
      const hitNow = metaHit() && Math.max(0, units - 1 - (START - 1)) * perUnit() < metaVal() - 1e-9;
      floats.push(paying
        ? { x: BIRD_X + 46, y: bird.y - 24, t: '+' + fmt(perUnit()), a: 1, big: false, c: '#4ade80' }
        : { x: BIRD_X + 46, y: bird.y - 24, t: (START - units) + ' p/ começar', a: 1, big: false, c: '#a3b8c8' });
      if (hitNow) {
        SND.cash();
        floats.push({ x: W / 2, y: H * .32, t: 'META BATIDA! �??�', a: 1.5, big: true, c: '#f7c948' });
      } else SND.score();
      if (!DEMO && units % 3 === 0) api('ping', { round_id: roundId, units }).catch(() => {});
      hud();
    }
  }

  // colisão (hitbox um pouco menor que o desenho = mais justo com o jogador)
  if (bird.y + BIRD_R >= groundY) { bird.y = groundY - BIRD_R; die(); }
  for (const p of pipes) {
    if (BIRD_X + HIT > p.x && BIRD_X - HIT < p.x + PIPE_W) {
      const g = p.gap || GAP0;
      if (bird.y - HIT < p.gapY - g / 2 || bird.y + HIT > p.gapY + g / 2) { die(); break; }
    }
  }

  updateFx(dt);
}

function updateFx(dt) {
  for (const f of feathers) { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 500 * dt; f.a -= dt * 1.6; }
  feathers = feathers.filter(f => f.a > 0);
  for (const t of floats) { t.y -= 34 * dt; t.a -= dt * .9; }
  floats = floats.filter(t => t.a > 0);
}

/* ---------------- render ---------------- */
function drawPipe(p) { SCENE().pipe(p); }

/* Mascote enviado no admin (aba Mascote). O desenho interno só entra quando N�?O
   existe mascote configurado, ou quando a imagem falha de verdade. Enquanto ela
   está baixando não desenhamos nada: antes piscava o passarinho antigo por um
   instante no primeiro acesso (ctrl+shift+R), e a troca na cara do jogador
   parecia bug. */
let MASCOT_ERRO = false;
const MASCOT = (function () {
  const url = CFG.mascot;
  if (!url) return null;
  const img = new Image();
  img.decoding = 'async';
  img.onerror = () => { MASCOT_ERRO = true; };
  img.src = url;
  return img;
})();
const mascotePronto = () => !!(MASCOT && MASCOT.complete && MASCOT.naturalWidth);

function drawBirdImg() {
  const w = MASCOT.naturalWidth, h = MASCOT.naturalHeight;
  // o desenho interno ocupa 3,15 x BIRD_R de largura por 2,48 de altura (bico a
  // rabo, coroa ao pé). A imagem entra nessa mesma moldura, sem deformar.
  const esc = Math.min((BIRD_R * 3.15) / w, (BIRD_R * 2.48) / h);
  ctx.save();
  ctx.translate(BIRD_X, bird.y);
  ctx.rotate(bird.rot);
  const p = 1 + bird.wing * .06;                    // respirada ao bater asa
  ctx.scale(esc * p, esc * p);
  ctx.drawImage(MASCOT, -w / 2, -h / 2, w, h);
  ctx.restore();
}

/* mascote oficial �?? MESMA arte do SVG do site, desenhada via Path2D */
const ART = {
  tail:   new Path2D('M30 62 C 18 53 7 55 6 63 C 12 69 21 70 30 71 Z'),
  wing:   new Path2D('M50 64 C 39 64 30 57 30 46 C 43 50 50 57 52 62 Z'),
  crown:  new Path2D('M46 36 L 42 23 L 52 30 L 56 18 L 62 29 L 70 23 L 65 36 Z'),
  beak:   new Path2D('M82 50 L 110 57 L 89 63 L 103 71 L 84 77 Z'),
  beakLo: new Path2D('M84 66 L 103 71 L 84 77 Z'),
  mouth:  new Path2D('M89 62 L 101 66 L 88 70 Z'),
};

function drawBirdReal() {
  ctx.save();
  ctx.translate(BIRD_X, bird.y);
  ctx.rotate(bird.rot);
  ctx.scale(BIRD_R / 33, BIRD_R / 33);   // o corpo do SVG tem raio 33
  ctx.translate(-58, -66);               // centro do corpo vira o (0,0)
  ctx.lineJoin = 'round';
  const OUT = '#38260a';

  // rabinho
  ctx.fillStyle = '#f0b12c'; ctx.strokeStyle = OUT; ctx.lineWidth = 4;
  ctx.fill(ART.tail); ctx.stroke(ART.tail);

  // corpo
  ctx.fillStyle = '#ffd23f';
  ctx.beginPath(); ctx.ellipse(58, 66, 33, 34, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // sombra + barriga (recortadas pelo corpo)
  ctx.save();
  ctx.clip();
  ctx.globalAlpha = .55; ctx.fillStyle = '#f5a623';
  ctx.beginPath(); ctx.ellipse(58, 88, 34, 20, 0, 0, Math.PI * 2); ctx.fill();
  ctx.globalAlpha = 1; ctx.fillStyle = '#ffedb0';
  ctx.beginPath(); ctx.ellipse(66, 90, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();

  // coroa
  ctx.fillStyle = '#ffd94a'; ctx.lineWidth = 4;
  ctx.fill(ART.crown); ctx.stroke(ART.crown);

  // asa (bate: gira no ombro)
  ctx.save();
  ctx.translate(52, 62); ctx.rotate(-.6 * bird.wing); ctx.translate(-52, -62);
  ctx.fillStyle = '#eda619'; ctx.lineWidth = 4;
  ctx.fill(ART.wing); ctx.stroke(ART.wing);
  ctx.restore();

  // olhao
  ctx.fillStyle = '#fff'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.ellipse(72, 47, 15, 17, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#1b130a';
  ctx.beginPath(); ctx.ellipse(77, 49, 7, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(74, 44, 2.8, 0, Math.PI * 2); ctx.fill();

  // bico aberto
  ctx.fillStyle = '#ff9738'; ctx.lineWidth = 3;
  ctx.fill(ART.beak); ctx.stroke(ART.beak);
  ctx.fillStyle = '#e2701f'; ctx.fill(ART.beakLo);
  ctx.fillStyle = '#4a1f08'; ctx.fill(ART.mouth);

  // cordao de ouro
  ctx.fillStyle = '#ffd94a'; ctx.strokeStyle = '#8a5b00'; ctx.lineWidth = 1.6;
  [[48, 92, 3.4], [57, 95, 3.4], [66, 95, 3.6], [75, 92, 3.4]].forEach(([x, y, r]) => {
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });

  ctx.restore();
}

function render() {
  // fundo estático
  if (bgCanvas) ctx.drawImage(bgCanvas, 0, 0, W, H);

  let sx = 0, sy = 0;
  if (shake > 0) { sx = (Math.random() - .5) * 10 * shake; sy = (Math.random() - .5) * 10 * shake; }
  ctx.save();
  ctx.translate(sx, sy);

  SCENE().props();

  // canos
  for (const p of pipes) drawPipe(p);

  SCENE().ground();

  // penas / partículas
  for (const f of feathers) {
    ctx.globalAlpha = Math.max(0, f.a);
    ctx.fillStyle = f.c;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  /* Desfoque do fundo enquanto a mensagem de toque está na tela.
     Feito AQUI (e não com backdrop-filter no CSS) porque o pássaro é desenhado
     depois: assim o cenário sai borrado e o mascote continua nítido.
     Um único drawImage do próprio canvas por cima = barato. Navegador antigo
     sem ctx.filter só ignora o borrão �?? nada quebra. */
  if (msgTap.style.display === 'flex') {
    ctx.save();
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    ctx.filter = 'blur(3px)';
    ctx.drawImage(cv, -8, -8, W + 16, H + 16);   // esticado: não fica borda clara nos cantos
    ctx.filter = 'none';
    ctx.fillStyle = 'rgba(4,14,9,.14)';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // pássaro (nada é desenhado durante o carregamento do mascote �?? ver MASCOT)
  if (state !== 'bet') {
    if (mascotePronto())            drawBirdImg();
    else if (!MASCOT || MASCOT_ERRO) drawBirdReal();
  }

  // textos flutuantes (+R$2,00 / META BATIDA!)
  for (const t of floats) {
    ctx.globalAlpha = clamp(t.a, 0, 1);
    ctx.font = '900 ' + (t.big ? 28 : 17) + 'px Montserrat, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = t.c || '#f7c948';
    ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 4;
    ctx.strokeText(t.t, t.x, t.y); ctx.fillText(t.t, t.x, t.y);
  }
  ctx.globalAlpha = 1;

  ctx.restore();
}

/* ---------------- loop ---------------- */
function loop(ts) {
  const dt = Math.min((ts - tLast) / 1000 || 0, .032);
  tLast = ts;
  if (state !== 'dying') shake = Math.max(0, shake - dt * 3.5);   // some mesmo com a rodada encerrada
  update(dt);
  render();
  requestAnimationFrame(loop);
}

/* ---------------- go ---------------- */
resize();
resetWorld();
showBetScreen();
requestAnimationFrame(loop);
})();

