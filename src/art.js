'use strict';

// Pure SVG generators for the Artify artwork. No VS Code API in here, so it can be tested in Node.
// Every function returns a string of SVG markup.


// ---------------------------------------------------------------------------
// Broken vase (Explorer) and poured paint (Palette panel), one set per theme kind
// ---------------------------------------------------------------------------

const VASE = {
  dark: {
    crown: '#FFF0B8',
    crack: '#10232B',
    shards: ['#62C3E3', '#F79BB0', '#E9A93B', '#FFF0B8', '#E5534B', '#62C3E3', '#FFF0B8', '#3F8793', '#FFF0B8'],
    dots: ['#E9A93B', '#F79BB0', '#FFF0B8', '#9BDB8A'],
    pieces: ['#E9A93B', '#FFF0B8', '#3F8793', '#E5534B', '#8E2A33', '#FFF0B8', '#E9A93B', '#E5534B', '#62C3E3', '#E9A93B', '#8E2A33', '#FFF0B8']
  },
  light: {
    crown: '#FFFFFF',
    crack: '#CFEAF4',
    shards: ['#D83A2E', '#F28FA6', '#F5C518', '#1E7B8F', '#12202A', '#D83A2E', '#F5C518', '#1E7B8F', '#FFFFFF'],
    dots: ['#D83A2E', '#F28FA6', '#12202A', '#F5C518'],
    pieces: ['#F5C518', '#FFFFFF', '#1E7B8F', '#D83A2E', '#12202A', '#FFFBF0', '#F5C518', '#D83A2E', '#1E7B8F', '#F5C518', '#12202A', '#FFFBF0']
  }
};

function vaseSvg(kind) {
  const v = VASE[kind] || VASE.dark;
  const s = v.shards;
  const d = v.dots;
  const p = v.pieces;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 380" role="img" aria-label="A vase breaking into flat geometric shards">
<polygon points="84,46 66,14 92,32 98,4 112,34 130,2 136,34 160,14 146,48" fill="${v.crown}"/>
<polygon points="196,62 216,46 208,80" fill="${s[0]}"/>
<polygon points="22,104 46,92 36,124" fill="${s[1]}"/>
<polygon points="206,124 228,132 210,148" fill="${s[2]}"/>
<polygon points="8,196 28,184 26,216" fill="${s[3]}"/>
<polygon points="212,252 230,240 224,272" fill="${s[4]}"/>
<polygon points="28,296 52,302 34,320" fill="${s[5]}"/>
<polygon points="166,22 182,6 178,34" fill="${s[6]}"/>
<polygon points="160,362 182,352 176,374" fill="${s[7]}"/>
<polygon points="24,346 46,340 38,362" fill="${s[8]}"/>
<circle cx="12" cy="150" r="4" fill="${d[0]}"/>
<circle cx="226" cy="196" r="5" fill="${d[1]}"/>
<circle cx="46" cy="60" r="3" fill="${d[2]}"/>
<circle cx="190" cy="300" r="3" fill="${d[3]}"/>
<polygon points="94,46 116,46 112,112 98,112" fill="${p[0]}"/>
<polygon points="120,40 142,48 130,110 116,112" fill="${p[1]}" transform="rotate(7 130 76)"/>
<polygon points="98,118 112,118 100,162 56,162" fill="${p[2]}"/>
<polygon points="118,118 134,116 178,162 108,166" fill="${p[3]}"/>
<polygon points="54,168 98,168 86,216 36,216" fill="${p[4]}"/>
<polygon points="104,170 172,168 150,220 92,224" fill="${p[5]}"/>
<polygon points="178,168 198,198 192,218 160,224" fill="${p[6]}" transform="rotate(5 185 195)"/>
<polygon points="40,222 90,228 100,264 64,272" fill="${p[7]}"/>
<polygon points="100,228 152,226 164,272 112,278" fill="${p[8]}"/>
<polygon points="70,280 122,284 118,308 78,306" fill="${p[9]}"/>
<polygon points="62,318 150,316 156,352 56,354" fill="${p[10]}"/>
<polygon points="62,318 150,316 148,326 64,328" fill="${p[11]}"/>
<path d="M98 118 L84 140 L98 162 M130 170 L118 196 L128 222 M62 222 L80 246" fill="none" stroke="${v.crack}" stroke-width="1.5"/>
</svg>`;
}

const PAINT = {
  dark: {
    puddle: '#62C3E3', pour: '#E5534B', pour2: '#E9A93B', streak: '#FFF0B8',
    drips: ['#F79BB0', '#E9A93B', '#3F8793', '#62C3E3', '#F79BB0'],
    dots: ['#F79BB0', '#E9A93B', '#62C3E3', '#E5534B', '#FFF0B8', '#FFF0B8', '#FFF0B8']
  },
  light: {
    puddle: '#1E7B8F', pour: '#D83A2E', pour2: '#F5C518', streak: '#FFFBF0',
    drips: ['#F28FA6', '#F5C518', '#1E7B8F', '#62C3E3', '#12202A'],
    dots: ['#F28FA6', '#D83A2E', '#62C3E3', '#F5C518', '#12202A', '#FFFBF0', '#FFFBF0']
  }
};

function paintSvg(kind) {
  const c = PAINT[kind] || PAINT.dark;
  const dr = c.drips;
  const dt = c.dots;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 186" preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
<path d="M200 186 C212 160 252 150 292 158 C342 148 392 156 424 168 C452 160 480 168 500 164 V186Z" fill="${c.puddle}"/>
<path d="M300 0 H372 C376 30 360 52 372 78 C384 104 430 100 452 124 C470 142 500 138 500 186 H250 C282 160 292 140 286 112 C280 84 296 40 300 0Z" fill="${c.pour}"/>
<path d="M392 0 H438 C440 30 430 46 434 66 C438 90 470 92 500 100 V150 C470 140 440 130 420 120 C396 104 388 80 390 60 C392 40 390 20 392 0Z" fill="${c.pour2}"/>
<path d="M322 0 C324 30 314 52 320 78" fill="none" stroke="${c.streak}" stroke-width="4" stroke-linecap="round" opacity=".75"/>
<path d="M420 0 C422 18 414 30 418 46" fill="none" stroke="${c.streak}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
<path d="M130 0 v46 a7 7 0 0 0 14 0 v-46z" fill="${dr[0]}"/>
<path d="M176 0 v28 a6 6 0 0 0 12 0 v-28z" fill="${dr[1]}"/>
<path d="M226 0 v62 a8 8 0 0 0 16 0 v-62z" fill="${dr[2]}"/>
<path d="M474 0 v40 a6 6 0 0 0 12 0 v-40z" fill="${dr[3]}"/>
<path d="M488 0 v22 a5 5 0 0 0 10 0 v-22z" fill="${dr[4]}"/>
<circle cx="250" cy="70" r="6" fill="${dt[0]}"/>
<circle cx="236" cy="100" r="3.5" fill="${dt[1]}"/>
<circle cx="170" cy="120" r="4" fill="${dt[2]}"/>
<circle cx="214" cy="140" r="6" fill="${dt[3]}"/>
<circle cx="120" cy="158" r="3" fill="${dt[4]}"/>
<circle cx="468" cy="84" r="4" fill="${dt[5]}"/>
<circle cx="340" cy="140" r="5" fill="${dt[6]}" opacity=".8"/>
</svg>`;
}

const SWATCHES = {
  dark: [['Brick', '#E5534B'], ['Ochre', '#E9A93B'], ['Teal', '#3F8793'], ['Cream', '#FFF0B8'], ['Sky', '#62C3E3']],
  light: [['Red', '#D83A2E'], ['Sky', '#62C3E3'], ['Yellow', '#F5C518'], ['Teal', '#1E7B8F'], ['Navy', '#12202A']]
};

// ---------------------------------------------------------------------------
// Gallery movements (720 x 680 stage)
// ---------------------------------------------------------------------------

function rng(seed) {
  const r = (n) => {
    const x = Math.sin(seed * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  const j = (n, amt) => Math.round((r(n) - 0.5) * amt);
  return { r, j };
}

const rect = (x, y, w, h, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;
const circle = (cx, cy, rad, fill, extra = '') => `<circle cx="${cx}" cy="${cy}" r="${rad}" fill="${fill}" ${extra}/>`;
const blob = (cx, cy, rx, ry, rot, fill, extra = '') =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" transform="rotate(${rot} ${cx} ${cy})" ${extra}/>`;

// Paint blobs, splatter and a brush stroke shared by the solid movements.
function splatter(seed, chips, { soft = false, multiply = false } = {}) {
  const { r, j } = rng(seed);
  const out = [];
  const blend = multiply ? 'style="mix-blend-mode:multiply"' : '';
  for (let n = 0; n < 3; n++) {
    const cx = 100 + Math.round(r(20 + n) * 520);
    const cy = 100 + Math.round(r(30 + n) * 440);
    const rx = 75 + Math.round(r(40 + n) * 55);
    const ry = 60 + Math.round(r(50 + n) * 45);
    out.push(blob(cx, cy, rx, ry, Math.round(r(60 + n) * 80 - 40), chips[n % 3], `opacity="${soft ? 0.25 : 0.55}" ${blend}`));
  }
  for (let n = 0; n < 9; n++) {
    const sz = 3 + Math.round(r(70 + n) * 13);
    out.push(circle(20 + Math.round(r(80 + n) * 660), 20 + Math.round(r(90 + n) * 620), sz, chips[n % 3], `opacity="${soft ? 0.5 : 0.9}"`));
  }
  const x = 60 + Math.round(r(99) * 200);
  out.push(`<rect x="${x}" y="590" width="360" height="24" rx="12" fill="${chips[1]}" opacity=".7" transform="rotate(${-6 + j(98, 8)} ${x + 180} 602)"/>`);
  return out.join('\n');
}

function tileNight(seed) {
  const { j } = rng(seed);
  const tx = 420 + j(5, 50);
  const ty = 340 + j(6, 50);
  const chips = ['#E5534B', '#E9A93B', '#3F8793'];
  return [
    circle(490 + j(1, 60), 270 + j(2, 60), 150, '#E5534B'),
    circle(300 + j(3, 60), 390 + j(4, 60), 127, 'none', 'stroke="#62C3E3" stroke-width="6"'),
    `<polygon points="${tx + 110},${ty} ${tx + 220},${ty + 200} ${tx},${ty + 200}" fill="#E9A93B" transform="rotate(${14 + j(7, 30)} ${tx + 110} ${ty + 100})"/>`,
    rect(60, 520 + j(8, 40), 600, 4, '#FFF0B8', `transform="rotate(${-12 + j(9, 10)} 360 522)"`),
    rect(90 + j(10, 40), 90 + j(11, 40), 180, 46, '#9BDB8A'),
    circle(613, 103 + j(12, 60), 13, '#F79BB0'),
    rect(120, 380 + j(13, 40), 70, 70, 'none', 'stroke="#F79BB0" stroke-width="3" transform="rotate(30 155 415)"'),
    circle(550, 110, 70, 'none', 'stroke="#FFF0B8" stroke-width="2"'),
    splatter(seed, chips)
  ].join('\n');
}

function bauhausDay(seed) {
  const { j } = rng(seed);
  const vx = 300 + j(1, 120);
  const hy = 280 + j(2, 100);
  const hy2 = 150 + j(3, 40);
  const by = 500 + j(4, 40);
  const chips = ['#D83A2E', '#F5C518', '#1E7B8F'];
  return [
    rect(0, 0, vx, hy, '#D83A2E'),
    rect(vx, hy2, 720 - vx, hy - hy2, '#F5C518'),
    rect(0, by, 330, 680 - by, '#1E7B8F'),
    rect(vx - 5, 0, 10, 680, '#12202A'),
    rect(0, hy - 5, 720, 10, '#12202A'),
    rect(vx, hy2 - 5, 720 - vx, 10, '#12202A'),
    rect(0, by - 5, 520, 10, '#12202A'),
    rect(515, by - 5, 10, 685 - by, '#12202A'),
    splatter(seed, chips, { multiply: true })
  ].join('\n');
}

function rothkoDusk(seed) {
  const { j } = rng(seed);
  const top = 60 + j(1, 30);
  const topH = 310 + j(2, 30);
  const mid = 410 + j(3, 20);
  return `<defs><filter id="rothko-blur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter></defs>
<g filter="url(#rothko-blur)">
${rect(70, top, 580, topH, '#D4502F')}
${rect(70, mid, 580, 220, '#7A1F2B')}
${rect(70, 378, 580, 24, '#E8B26B', 'opacity=".55"')}
</g>
${splatter(seed, ['#D4502F', '#7A1F2B', '#E8B26B'], { soft: true })}`;
}

function malevichFrost(seed) {
  const { j } = rng(seed);
  const chips = ['#111111', '#D83A2E', '#F5C518'];
  return [
    rect(240, 180, 230, 230, '#111111', `transform="rotate(${20 + j(1, 30)} 355 295)"`),
    rect(110, 450, 310, 60, '#D83A2E', `transform="rotate(${-8 + j(2, 12)} 265 480)"`),
    rect(70, 140, 440, 3, '#111111', `transform="rotate(${35 + j(3, 20)} 70 141)"`),
    rect(470, 90 + j(4, 40), 130, 40, '#F5C518', 'transform="rotate(12 535 110)"'),
    rect(520, 440, 90, 90, 'none', 'stroke="#1E7B8F" stroke-width="4" transform="rotate(-20 565 485)"'),
    circle(609, 289, 9, '#111111'),
    splatter(seed, chips, { multiply: true })
  ].join('\n');
}

const CHEEKS = ['#D45A38', '#E0AB54', '#2495AE', '#93AB5F'];

function aspectsDusk(seed) {
  const { j } = rng(seed);
  const cheek = CHEEKS[Math.abs(Math.round((seed - 1913) / 7)) % 4];
  const cx = 970 + j(3, 90);
  const cy = 915 + j(4, 60);
  const px = j(5, 50);
  return `${circle(62, 116, 46, '#E0AB54')}
<path d="M0 680 V540 A140 140 0 0 1 140 680 Z" fill="#2495AE"/>
${rect(0, 300, 26, 150, '#D45A38')}
${circle(652, 112, 38, 'none', 'stroke="#E3DAC0" stroke-width="6"')}
${circle(668, 560, 34, '#D45A38')}
<path d="M720 330 V470 H640 A70 70 0 0 1 720 330 Z" fill="#66A7B5"/>
<g transform="translate(75 -57) scale(0.398)">
<path d="M143 205 C330 205 470 270 530 362 H212 V1668 H143 Z" fill="#1F2A3B"/>
<rect x="212" y="362" width="115" height="1306" fill="#58426A"/>
<rect x="327" y="1130" width="388" height="345" fill="#D45A38"/>
<rect x="327" y="1475" width="388" height="193" fill="#C9504E"/>
<path d="M212 362 H535 C650 440 715 560 715 650 V1415 C400 1415 220 1000 212 362 Z" fill="#E3DAC0"/>
<path d="M327 650 H715 V1415 C500 1420 400 1300 327 1130 Z" fill="#E0AB54"/>
<rect x="382" y="690" width="333" height="440" fill="#F2CD6F"/>
<path d="M327 652 H605 C540 690 440 722 382 690 Z" fill="#E0AB54"/>
<path d="M327 652 L410 605 C430 620 450 635 470 635 C490 635 505 620 518 603 L605 652 Z" fill="#5C3A78"/>
<rect x="550" y="1130" width="165" height="46" fill="#E08E38"/>
<path d="M715 690 L590 1028 H715 Z" fill="#58426A"/>
<rect x="143" y="1668" width="657" height="182" fill="#DF9138"/>
<rect x="715" y="1318" width="85" height="432" fill="#DF9138"/>
<rect x="715" y="260" width="355" height="102" fill="#E0AB54"/>
<rect x="715" y="362" width="355" height="290" fill="#66A7B5"/>
<path d="M1068 260 C1190 280 1210 480 1190 600 C1175 700 1150 770 1135 815 L1040 750 V362 H1068 Z" fill="#2495AE"/>
<rect x="728" y="538" width="277" height="62" fill="#E3DAC0"/>
<path d="M728 540 C790 490 940 480 1005 540 C940 590 800 600 728 540 Z" fill="#5C3A78"/>
<path transform="translate(${px} 0)" d="M795 503 C805 535 835 560 868 560 C905 560 935 535 942 503 C905 488 835 488 795 503 Z" fill="#1F2A3B"/>
<path d="M715 650 C870 650 985 700 1042 750 C1010 900 975 1170 890 1262 V1590 H800 V1316 C770 1316 735 1322 715 1330 Z" fill="#E3DAC0"/>
<rect x="668" y="1030" width="47" height="42" fill="#E3DAC0"/>
<path d="M1042 750 L1138 815 C1110 900 1150 980 1200 1060 C1260 1150 1290 1250 1262 1350 C1240 1450 1160 1505 1060 1505 C990 1505 940 1495 890 1485 V1262 C960 1170 1010 900 1042 750 Z" fill="#93AB5F"/>
<circle cx="${cx}" cy="${cy}" r="137" fill="${cheek}"/>
<rect x="715" y="1130" width="80" height="70" fill="#D45A38"/>
<path d="M800 1850 V1590 H1222 C1160 1740 1000 1830 800 1850 Z" fill="#A8454A"/>
<path d="M1222 1590 H1285 V1850 H800 C1000 1830 1160 1740 1222 1590 Z" fill="#58426A"/>
</g>`;
}

// `theme` is the contributed color theme a movement can apply, or null when it is artwork only.
const MOVEMENTS = [
  {
    id: 'aspects', name: 'Aspects Dusk', sub: 'Cubist faces in aubergine and ochre', mode: 'dark',
    caption: 'inspired by geometric cubist portraits', bg: null,
    chips: ['#E0AB54', '#2495AE', '#D45A38'], btn: '#E0AB54', btnFg: '#1B1016', theme: null, render: aspectsDusk,
    label: 'Cubist portrait made of flat aubergine, ochre, teal and vermilion shapes'
  },
  {
    id: 'tile', name: 'Tile Night', sub: 'Quarter circles, teal, brick and ochre', mode: 'dark',
    caption: 'inspired by retro geometric tile posters', bg: '#1B1016',
    chips: ['#E5534B', '#E9A93B', '#3F8793'], btn: '#E9A93B', btnFg: '#1B1016', theme: 'Artify Tile Night', render: tileNight,
    label: 'Circles, a triangle and floating lines in brick, ochre and teal with paint splatter'
  },
  {
    id: 'bauhaus', name: 'Bauhaus Day', sub: 'Sky blue, red and yellow blocks', mode: 'light',
    caption: 'inspired by Bauhaus museum posters', bg: '#FFFBF0',
    chips: ['#D83A2E', '#F5C518', '#1E7B8F'], btn: '#F5C518', btnFg: '#12202A', theme: 'Artify Bauhaus Day', render: bauhausDay,
    label: 'A grid of red, yellow and teal blocks with black lines and paint splatter'
  },
  {
    id: 'rothko', name: 'Rothko Dusk', sub: 'Soft fields of warm color', mode: 'dark',
    caption: 'inspired by color-field painting', bg: '#2A0F14',
    chips: ['#D4502F', '#7A1F2B', '#E8B26B'], btn: '#FF8A5C', btnFg: '#12111A', theme: null, render: rothkoDusk,
    label: 'Two soft glowing fields of orange and crimson'
  },
  {
    id: 'malevich', name: 'Malevich Frost', sub: 'One black square, cold white', mode: 'light',
    caption: 'inspired by Suprematist compositions', bg: '#ECEEF2',
    chips: ['#111111', '#D83A2E', '#F5C518'], btn: '#FFFFFF', btnFg: '#111111', theme: null, render: malevichFrost,
    label: 'A tilted black square with red and yellow bars on cold white'
  }
];

module.exports = { vaseSvg, paintSvg, SWATCHES, MOVEMENTS };
