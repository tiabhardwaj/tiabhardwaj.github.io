export function pieceUrl(id) {
  return `/pieces/${id.split("/").map(encodeURIComponent).join("/")}/`;
}

export function uniqueEdges(edges) {
  const seen = new Set();
  return edges.filter(({ source, target }) => {
    const key = JSON.stringify([source, target]);
    if (source === target || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// Explore both outgoing links and backlinks, preserving arrows' authored direction.
export function graphDistances(currentId, edges) {
  const distances = new Map([[currentId, 0]]);
  const queue = [currentId];
  for (const id of queue) {
    for (const { source, target } of edges) {
      const next = source === id ? target : target === id ? source : null;
      if (next !== null && !distances.has(next)) {
        distances.set(next, distances.get(id) + 1);
        queue.push(next);
      }
    }
  }
  return distances;
}

export function matchesSections(piece, filters) {
  return !filters.length || piece.sections.some((id) => filters.includes(id));
}

// Fixed, stable positions: changing depth or preview never moves the current node.
export function graphPositions(pieces, currentId) {
  const positions = new Map();
  const others = pieces.filter((piece) => piece.id !== currentId)
    .sort((a, b) => a.id.localeCompare(b.id));
  const anchors = [[575, 150], [600, 355], [310, 390], [290, 170], [365, 260], [535, 465], [355, 470], [585, 260]];
  if (currentId) positions.set(currentId, [390, 290]);
  others.forEach((piece, i) => {
    if (i < anchors.length) positions.set(piece.id, anchors[i]);
    else {
      const angle = i * 2.399963;
      const radius = 35 + (i % 7) * 14;
      const centre = i % 2 ? 345 : 555;
      positions.set(piece.id, [centre + Math.cos(angle) * radius, 285 + Math.sin(angle) * radius * 1.5]);
    }
  });
  return positions;
}
