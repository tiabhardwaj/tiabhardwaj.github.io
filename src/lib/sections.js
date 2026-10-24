// One palette for the homepage, article badges, and graph nodes.
export const SECTIONS = [
  { id: "writing", label: "Writing", colour: "#f12498" },
  { id: "work", label: "Work", colour: "#009fbd" },
  { id: "research", label: "Research", colour: "#7653ed" },
  { id: "startup", label: "Startup", colour: "#ec6900" },
];

export function selectedSections(ids) {
  return SECTIONS.filter((section) => ids.includes(section.id));
}

export function sectionRim(ids) {
  const sections = selectedSections(ids);
  if (!sections.length) throw new Error("A piece needs at least one valid section.");
  // Hard stops make equal slices: 360 / 4 = 90 degrees each.
  const slice = 360 / sections.length;
  return `conic-gradient(${sections.map((section, i) =>
    `${section.colour} ${i * slice}deg ${(i + 1) * slice}deg`
  ).join(", ")})`;
}
