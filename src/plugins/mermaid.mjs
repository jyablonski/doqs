import { visit } from 'unist-util-visit'

// this code is imported in `astro.config.mjs` and
// enables the use of mermaid diagrams
export function remarkDiagram() {
  return function (tree, { data }) {
    if (!data.astro.frontmatter['extra']) {
      data.astro.frontmatter.extra = []
    }
    visit(tree, 'code', (node) => {
      if (node.lang === 'markmap' || node.lang === 'mermaid') {
        node.type = 'html'
        node.value = '<div class ="' + node.lang + '">' + node.value + '</div>'
        if (!data.astro.frontmatter.extra.includes(node.lang)) {
          data.astro.frontmatter.extra.push(node.lang)
        }
      }
    })
  }
}