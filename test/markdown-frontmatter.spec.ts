import { describe, expect, it } from 'vitest'
import { stripMarkdownFrontmatter } from '../packages/renderers/text/src/markdown'

describe('@file-viewer/renderer-text markdown frontmatter', () => {
  it('removes YAML frontmatter without stripping body slide separators', () => {
    const markdown = `---
# metadata comments stay out of the rendered document
name: html-to-ppt
tags:
  - slides
---

# HTML/Markdown to PowerPoint Skill

Intro text.

---

# Slide 2
`

    expect(stripMarkdownFrontmatter(markdown)).toBe(`# HTML/Markdown to PowerPoint Skill

Intro text.

---

# Slide 2
`)
  })

  it('keeps ordinary markdown that does not start with a frontmatter fence', () => {
    const markdown = `# Demo

---

Body divider
`

    expect(stripMarkdownFrontmatter(markdown)).toBe(markdown)
  })
})
