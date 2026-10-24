import { drawBrain } from "./brain-illustration.js";
import { sectionRim, selectedSections } from "../lib/sections.js";
import { graphDistances, graphPositions, matchesSections } from "../lib/graph.js";

document.querySelectorAll("[data-content-graph]").forEach((root, graphIndex) => {
  const graph = JSON.parse(root.querySelector("[data-graph-data]").textContent);
  const currentId = root.dataset.current || null;
  const home = root.dataset.mode === "home";
  const decoration = root.querySelector(".graph-decoration");
  const layers = drawBrain(decoration);
  const canvas = root.querySelector(".graph-canvas");
  const edgesSvg = root.querySelector(".graph-edges");
  const nodeBox = root.querySelector(".graph-nodes");
  const preview = root.querySelector(".graph-preview");
  const status = root.querySelector(".graph-status");
  const distances = graphDistances(currentId, graph.edges);
  const positions = graphPositions(graph.pieces, currentId);
  const buttons = new Map();
  let depth = 1;
  let selectedId = null;
  let filters = home ? new URLSearchParams(location.search).getAll("section") : [];
  let viewBox = [130, 30, 640, 510];
  const ns = "http://www.w3.org/2000/svg";

  function make(tag, attrs, parent = edgesSvg) {
    const element = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, String(value)));
    parent.append(element);
    return element;
  }

  function closePreview(returnFocus = false) {
    const previous = selectedId;
    selectedId = null;
    updatePreview();
    if (returnFocus) buttons.get(previous)?.focus();
    drawEdges();
  }

  function updatePreview() {
    const selected = graph.pieces.find((piece) => piece.id === selectedId);
    preview.hidden = !selected;
    buttons.forEach((button, id) => button.setAttribute("aria-pressed", String(id === selectedId)));
    if (!selected) {
      const count = graph.pieces.filter(visible).length;
      status.textContent = home ? count ? `${count} pieces. Select one to explore.` : "[No published pieces in this selection yet.]" : count > 1 ? "Select a connected piece to explore." : "No linked pieces yet.";
      return;
    }
    preview.querySelector("h3").textContent = selected.title;
    preview.querySelector(".graph-preview-copy").textContent = selected.description;
    preview.querySelector(".graph-preview-sections").textContent = selectedSections(selected.sections).map((section) => section.label).join(" · ");
    preview.querySelector(".graph-open").href = selected.url;
    status.textContent = `Previewing ${selected.title}. ${currentId ? "The current page is unchanged." : "Open the piece to read it."}`;
  }

  graph.pieces.forEach((piece) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "graph-node";
    button.dataset.pieceId = piece.id;
    button.classList.toggle("is-current", piece.id === currentId);
    if (piece.id === currentId) button.setAttribute("aria-current", "page");
    const membership = selectedSections(piece.sections).map((section) => section.label).join(" and ");
    button.setAttribute("aria-label", `${piece.title}, ${membership}${piece.id === currentId ? ", current page" : ", preview piece"}`);
    button.setAttribute("aria-pressed", "false");
    const rim = document.createElement("span");
    rim.className = "section-rim";
    rim.style.setProperty("--rim", sectionRim(piece.sections));
    rim.setAttribute("aria-hidden", "true");
    const label = document.createElement("span");
    label.className = "graph-node-label";
    label.textContent = `${piece.id === currentId ? "You are here · " : ""}${piece.title}`;
    button.append(rim, label);
    button.addEventListener("click", () => {
      selectedId = piece.id === currentId || piece.id === selectedId ? null : piece.id;
      // On the homepage there is no current-page marker: any piece can be previewed.
      updatePreview();
      drawEdges();
    });
    nodeBox.append(button);
    buttons.set(piece.id, button);
  });

  const visible = (piece) => home ? matchesSections(piece, filters) : distances.get(piece.id) <= depth;

  function drawEdges() {
    edgesSvg.replaceChildren();
    const defs = make("defs", {});
    const markerId = `graph-arrow-${graphIndex}`;
    const marker = make("marker", { id: markerId, viewBox: "0 0 10 10", refX: 9, refY: 5, markerWidth: 5, markerHeight: 5, orient: "auto" }, defs);
    make("path", { d: "M0 0 L10 5 L0 10 Z", fill: "#59415e" }, marker);
    const visibleIds = new Set(graph.pieces.filter(visible).map((piece) => piece.id));
    const bounds = edgesSvg.getBoundingClientRect();
    const scale = Math.min(bounds.width / viewBox[2], bounds.height / viewBox[3]);
    const clearance = scale ? 20 / scale : 22;
    for (const { source, target } of graph.edges) {
      if (!visibleIds.has(source) || !visibleIds.has(target)) continue;
      // The homepage reveals authored links around a selected piece, not every edge at once.
      if (home && (!selectedId || (source !== selectedId && target !== selectedId))) continue;
      const [x, y] = positions.get(source);
      const [tx, ty] = positions.get(target);
      const length = Math.hypot(tx - x, ty - y);
      const unitX = (tx - x) / length, unitY = (ty - y) / length;
      const distance = home ? 1 : Math.max(distances.get(source), distances.get(target));
      make("path", {
        d: `M${x + unitX * clearance},${y + unitY * clearance} Q${(x + tx) / 2 - unitY * 28},${(y + ty) / 2 + unitX * 28} ${tx - unitX * clearance},${ty - unitY * clearance}`,
        fill: "none", stroke: "#59415e", "stroke-width": distance === 1 ? 2.5 : 1.6,
        opacity: [1, 1, 0.5, 0.26][distance], "marker-end": `url(#${markerId})`,
      });
    }
  }

  function draw() {
    const shown = graph.pieces.filter(visible);
    if (selectedId && !shown.some((piece) => piece.id === selectedId)) closePreview();
    const [left, top, width, height] = viewBox;
    const bounds = decoration.getBoundingClientRect();
    const scale = Math.min(bounds.width / width, bounds.height / height);
    const offsetX = (bounds.width - width * scale) / 2;
    const offsetY = (bounds.height - height * scale) / 2;
    for (const piece of graph.pieces) {
      const button = buttons.get(piece.id);
      button.hidden = !visible(piece);
      const [x, y] = positions.get(piece.id);
      button.style.left = `${offsetX + (x - left) * scale}px`;
      button.style.top = `${offsetY + (y - top) * scale}px`;
      button.style.setProperty("--node-opacity", home ? 1 : [1, 1, 0.55, 0.3][distances.get(piece.id)] ?? 1);
      root.querySelector(`[data-list-id="${CSS.escape(piece.id)}"]`).hidden = !visible(piece);
    }
    layers.forEach(({ layer, group }) => {
      layer.style.opacity = graph.pieces.length ? "0.17" : !filters.length || filters.includes(group) ? "1" : "0.11";
    });
    root.querySelectorAll("[data-depth]").forEach((button) => button.setAttribute("aria-pressed", String(Number(button.dataset.depth) === depth)));
    status.textContent = home ? shown.length ? `${shown.length} pieces. Select one to explore.` : "[No published pieces in this selection yet.]" : shown.length > 1 ? "Select a connected piece to explore." : "No linked pieces yet.";
    updatePreview();
    drawEdges();
  }

  root.querySelectorAll("[data-depth]").forEach((button) => button.addEventListener("click", () => {
    depth = Number(button.dataset.depth);
    draw();
  }));
  root.addEventListener("section-filter", (event) => { filters = event.detail; draw(); });
  root.querySelector(".graph-close").addEventListener("click", () => closePreview(true));
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && selectedId) { event.preventDefault(); closePreview(true); }
  });
  new ResizeObserver(() => {
    viewBox = home && window.innerWidth > 650 ? [0, 0, 900, 575] : [130, 30, 640, 510];
    decoration.setAttribute("viewBox", viewBox.join(" "));
    edgesSvg.setAttribute("viewBox", viewBox.join(" "));
    draw();
  }).observe(canvas);
  draw();
});
