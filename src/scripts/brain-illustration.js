// Shared decorative illustration. These branches are not content relationships.
export function drawBrain(svg) {
const ns = "http://www.w3.org/2000/svg";

// The original outline of one hemisphere.
const shape = `
  M447 85
  C414 45 375 42 346 64
  C313 41 274 67 260 98
  C218 93 194 120 200 153
  C165 166 165 201 180 224
  C151 251 159 283 177 303
  C151 334 174 367 197 380
  C192 414 216 445 248 450
  C253 481 291 500 320 494
  C350 525 392 529 417 509
  C451 489 430 452 442 419
  C433 380 449 341 440 305
  C451 272 438 239 445 201
  C433 164 454 125 447 85
  Z
`;

const path = new Path2D(shape);
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");

// Mirror the boundary check across the centre of the brain.
function inside(x, y) {
  return ctx.isPointInPath(path, x < 450 ? x : 900 - x, y);
}

// A repeatable sequence: the same seed gives the same arrangement.
let seed = 12395;

function rand() {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

const names = ["writing", "work", "research", "startup"];
const palette = ["#f12498", "#00abc5", "#7950ee", "#ff7200", "#90c900"];
const points = [];

for (let attempt = 0; attempt < 12000 && points.length < 520; attempt++) {
  const x = 150 + rand() * 600;
  const y = 40 + rand() * 490;

  const spacedApart = points.every(
    (p) => (x - p.x) ** 2 + (y - p.y) ** 2 > 80
  );

  if (inside(x, y) && spacedApart) {
    points.push({
      x,
      y,
      group: names[points.length % 4],
      colour: palette[points.length % 5],
    });
  }
}

// Create an SVG element, set its attributes, and attach it.
function make(tag, attributes, parent = svg) {
  const element = document.createElementNS(ns, tag);

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, String(value));
  });

  parent.append(element);
  return element;
}

// Keep references so we can highlight these groups later.
const layers = [];

points.forEach((p, i) => {
  const layer = make("g", {
    class: "nh-neuron",
    "data-family": p.group,
    opacity: 1,
  });

  layers.push({ layer, group: p.group });

  // Each neuron has four, five, or six main branches.
const arms = 4 + Math.floor(rand() * 3);
let d = "";

for (let a = 0; a < arms; a++) {
    const angle = (a / arms) * Math.PI * 2 + rand() * 0.7;
    const length = 10 + rand() * 17;

    const mx = p.x + Math.cos(angle) * length * 0.6;
    const my = p.y + Math.sin(angle) * length * 0.6;

    const ex = p.x + Math.cos(angle + 0.2) * length;
    const ey = p.y + Math.sin(angle + 0.2) * length;

    if (!inside(ex, ey)) continue;

    d += `M${p.x.toFixed(1)},${p.y.toFixed(1)}
          Q${mx.toFixed(1)},${my.toFixed(1)}
          ${ex.toFixed(1)},${ey.toFixed(1)} `;

    // Add two smaller branches.
    for (const turn of [-0.65, 0.65]) {
      const fx = ex + Math.cos(angle + turn) * length * 0.44;
      const fy = ey + Math.sin(angle + turn) * length * 0.44;

      if (inside(fx, fy)) {
        d += `M${mx.toFixed(1)},${my.toFixed(1)}
              Q${ex.toFixed(1)},${ey.toFixed(1)}
              ${fx.toFixed(1)},${fy.toFixed(1)} `;
      }
    }
  }

make("path", {
    d,
    fill: "none",
    stroke: p.colour,
    "stroke-width": i % 8 === 0 ? 1.6 : 1.05,
    "stroke-linecap": "round",
}, layer);

// Draw the coloured centre and its small pale highlight.
const radius = 1.2 + rand() * 1.8;

make("circle", {
    cx: p.x,
    cy: p.y,
    r: radius,
    fill: p.colour,
}, layer);

make("circle", {
    cx: p.x,
    cy: p.y,
    r: radius * 0.35,
    fill: "#fff9f1",
}, layer);

  // Find the nearest earlier neuron in the same decorative group.
const near = points
    .filter((q, j) =>
        j < i &&
        q.group === p.group &&
        Math.hypot(q.x - p.x, q.y - p.y) < 58
    )
    .sort((a, b) =>
      Math.hypot(a.x - p.x, a.y - p.y) -
      Math.hypot(b.x - p.x, b.y - p.y)
    )[0];

if (near) {
    make("path", {
    d: `M${p.x},${p.y}
        Q${(p.x + near.x) / 2 + 6},${(p.y + near.y) / 2 - 6}
        ${near.x},${near.y}`,
    fill: "none",
    stroke: p.colour,
     "stroke-width": 0.65,
    opacity: 0.5,
    }, layer);
}
});


return layers;
}

