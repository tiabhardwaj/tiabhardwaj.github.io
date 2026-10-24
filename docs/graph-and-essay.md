# The essay and graph design

## Start here

1. On the essay, the dark outer ring always identifies the current page.
2. Select another node: its dashed halo and preview appear; the current ring stays put.
3. Close the preview or press Escape; the article and graph remain.
4. Choose 2 degrees to reveal the four-section example. Its rim has four equal quarters.
5. Open that piece to move the current marker to its actual page URL.
6. Scroll the essay at desktop width: the graph stays beside it. The graph panel can scroll internally on short displays so its controls remain reachable.
7. Below 900px, the graph follows the article. There is no floating overlay on the writing.

## Section membership is data

Every published Markdown file in `src/content/pieces/` has frontmatter such as:

```yaml
---
title: "The actual title"
description: "The actual introduction"
sections: [writing, work, research, startup]
---
```

Only put material to make publish in this folder. The sample above describes the format.

`sections` is an array: the brackets hold my choices. Edit that list and save; Astro rebuilds the page data and both maps receive the updated memberships. There is no CMS checkbox editor yet. The visitor's section buttons filter pieces; they do not edit the classifications or recolour their rims.

`src/lib/sections.js` keeps the colour definitions together. `sectionRim()` calculates `360 / numberOfSections`. One section fills the circle, two get 180 degrees each, three get 120 degrees, four get 90 degrees. A CSS `conic-gradient` draws those hard-edged slices around an ivory centre. Duplicate selections are ignored and the colour order stays stable.

## Follow the files

- `src/layouts/PieceLayout.astro`: the shared HTML shell for every real article. `<slot />` is where its Markdown body appears. An `aside` holds the graph.
- `src/styles/piece.css`: the reading column and responsive layout. `position: sticky` with `top: 20px` keeps the desktop graph visible while the article scrolls.
- `src/components/ContentGraph.astro`: renders graph data, controls, legend, and the accessible link list. The preview starts with the HTML `hidden` attribute.
- `src/scripts/content-graph.js`: creates node buttons, draws directed edges, handles previews and 1/2/3-degree controls. `currentId` never changes when previewing; `selectedId` does.
- `src/scripts/brain-illustration.js`: the original seeded branching artwork extracted into a reusable function. Decorative branches are not content links.
- `src/lib/graph.js`: shortest-path traversal, stable positions, and section filtering shared across views.
- `src/lib/content-graph.js`: reads authored Markdown links to canonical piece URLs. Code examples, images, ordinary mentions, and external links do not produce connections. Repeated links produce one directed edge.
- `src/pages/pieces/[...id].astro`: builds one canonical page per collection entry; changing sections never duplicates a page.
- `src/data/design-fixture.js` and `src/pages/design/[id].astro`: synthetic development checks, separate from published content.

## Connecting real pieces

For this increment, ordinary Markdown links work:

```md
This idea connects to [a research note](/pieces/research-note/).
```

The target file would be `src/content/pieces/research-note.md`. Keep filenames stable as they currently supply the content ID and URL. Incoming links can be explored in the graph as well as outgoing ones, but arrows keep the authored direction.

Wikilinks, aliases, a permanent ID independent of filenames, backlink excerpts, search, analytics, and newsletter integration are still later increments. They have not been silently substituted or enabled here.

## The commit
The development samples are source fixtures, not private data: they will be visible in the public repository, but never become published sample articles. 
