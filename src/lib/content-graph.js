import { unified } from "unified";
import remarkParse from "remark-parse";
import { pieceUrl, uniqueEdges } from "./graph.js";

const parser = unified().use(remarkParse);
function walk(node, visit) {
  visit(node);
  node.children?.forEach((child) => walk(child, visit));
}

// Only real Markdown links count; text mentions and code examples do not.
export function contentGraph(entries) {
  const pieces = entries.map((entry) => ({
    id: entry.id, title: entry.data.title, description: entry.data.description,
    sections: entry.data.sections, url: pieceUrl(entry.id),
  }));
  const byPath = new Map(pieces.map((piece) => [piece.url, piece.id]));
  const mentions = [];
  for (const entry of entries) {
    const tree = parser.parse(entry.body ?? "");
    const definitions = new Map();
    walk(tree, (node) => {
      if (node.type === "definition") definitions.set(node.identifier, node.url);
    });
    walk(tree, (node) => {
      const href = node.type === "link" ? node.url :
        node.type === "linkReference" ? definitions.get(node.identifier) : null;
      if (!href) return;
      const url = new URL(href, `https://tiabhardwaj.github.io${pieceUrl(entry.id)}`);
      if (url.origin !== "https://tiabhardwaj.github.io") return;
      const target = byPath.get(`${url.pathname.replace(/\/$/, "")}/`);
      if (target && target !== entry.id) mentions.push({ source: entry.id, target });
    });
  }
  return { pieces, edges: uniqueEdges(mentions) };
}
