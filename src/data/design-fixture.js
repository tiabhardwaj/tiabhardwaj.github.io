// Synthetic design checks, never loaded into the published content collection.
// The /design routes return no paths in production builds.
export const designGraph = {
  pieces: [
    { id: "essay-a", title: "[Essay A]", sections: ["writing", "research"] },
    { id: "research-b", title: "[Research B]", sections: ["research"] },
    { id: "project-c", title: "[Project C]", sections: ["work", "research"] },
    { id: "essay-d", title: "[Essay D]", sections: ["writing"] },
    { id: "four-sections", title: "[Four-section piece]", sections: ["writing", "work", "research", "startup"] },
    { id: "third-degree", title: "[Third-degree piece]", sections: ["startup"] },
  ].map((piece) => ({ ...piece, description: "[Placeholder description for this design check.]", url: `/design/${piece.id}/` })),
  edges: [
    { source: "essay-a", target: "research-b" },
    { source: "essay-a", target: "project-c" },
    { source: "essay-d", target: "essay-a" },
    { source: "project-c", target: "four-sections" },
    { source: "four-sections", target: "third-degree" },
  ],
};
