import { test } from "node:test";
import assert from "node:assert/strict";
import { sectionRim } from "../src/lib/sections.js";
import { graphDistances, matchesSections, graphPositions } from "../src/lib/graph.js";
import { contentGraph } from "../src/lib/content-graph.js";

test("all section combinations have equal slices, independent of order and duplicates", () => {
  const all = ["writing", "work", "research", "startup"];
  for (let mask = 1; mask < 16; mask++) {
    const sections = all.filter((_, i) => mask & (1 << i));
    const rim = sectionRim(sections);
    assert.equal(rim, sectionRim([...sections].reverse().concat(sections)));
    const ranges = [...rim.matchAll(/ ([\d.]+)deg ([\d.]+)deg/g)];
    assert.equal(ranges.length, sections.length);
    ranges.forEach(([, start, end]) => assert.equal(Number(end) - Number(start), 360 / sections.length));
    assert.equal(Number(ranges.at(-1)[2]), 360);
  }
  assert.throws(() => sectionRim([]));
});

test("multi-section filtering uses union and does not mutate section membership", () => {
  const piece = { sections: ["writing", "research"] };
  assert.equal(matchesSections(piece, ["work", "research"]), true);
  assert.equal(matchesSections(piece, ["startup"]), false);
  assert.equal(matchesSections(piece, []), true);
  assert.deepEqual(piece.sections, ["writing", "research"]);
});

test("graph depth follows shortest paths in either direction, including cycles", () => {
  const edges = [{source:"a",target:"b"}, {source:"c",target:"b"}, {source:"c",target:"d"}, {source:"d",target:"b"}];
  assert.deepEqual([...graphDistances("a", edges)], [["a",0],["b",1],["c",2],["d",2]]);
  const pieces = ["a","b","c","d"].map((id) => ({id}));
  assert.deepEqual(graphPositions(pieces, "a"), graphPositions([...pieces].reverse(), "a"));
});

test("only authored Markdown links create directed deduplicated edges", () => {
  const data = { title:"Title", description:"Description", sections:["writing"] };
  const graph = contentGraph([
    { id:"a", data, body: 'Mention b. `[code](/pieces/c/)`\n\n[first](/pieces/b/) and [again](/pieces/b/#heading)\n\n[reference][ref]\n\n[ref]: /pieces/c/\n\n```md\n[code](/pieces/d/)\n```\n\n[external](https://example.com/pieces/d/)\n\n![image](/pieces/d/)\n\n[self](/pieces/a/)' },
    ...["b","c","d"].map((id) => ({id,data,body:""})),
  ]);
  assert.deepEqual(graph.edges, [{source:"a",target:"b"},{source:"a",target:"c"}]);
});
