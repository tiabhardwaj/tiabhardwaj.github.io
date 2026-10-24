import { SECTIONS } from "../lib/sections.js";

const root = document.getElementById("neural-homepage-study");
const graph = root.querySelector("[data-content-graph]");
const buttons = root.querySelectorAll("[data-section]");
const validIds = SECTIONS.map((section) => section.id);
const selected = new Set(new URLSearchParams(location.search).getAll("section").filter((id) => validIds.includes(id)));

function updateSelection() {
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(selected.has(button.dataset.section))));
  const names = SECTIONS.filter((section) => selected.has(section.id)).map((section) => section.label);
  root.querySelector(".nh-detail h2").textContent = names.length ? names.join(" + ") : "[Overview heading]";
  root.querySelector(".nh-detail-copy").textContent = names.length ? "[Section description]" : "[Overview description]";
  graph.dispatchEvent(new CustomEvent("section-filter", { detail: [...selected] }));
}

buttons.forEach((button) => button.addEventListener("click", () => {
  const id = button.dataset.section;
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  const url = new URL(location.href);
  url.searchParams.delete("section");
  selected.forEach((section) => url.searchParams.append("section", section));
  history.replaceState(null, "", url);
  updateSelection();
}));
updateSelection();
