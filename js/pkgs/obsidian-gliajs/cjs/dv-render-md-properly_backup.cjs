/**
 * Moves all child nodes of a parent to a grandparent node and removes the parent node.
 * @param parent - The parent node of the children to be moved.
 * @param grandpa - The grandparent node who steals the childrens and cuts off the parent.
 */
const grandpaKidnaps = (parent, grandpa) => {
  while (parent.firstChild) {
    grandpa.insertBefore(parent.firstChild, parent)
  }
  grandpa.removeChild(parent)
}

/**
 * Moves all the child nodes of a given parent node to its great-grandparent node and removes
 * the grandparent node.
 * @param parent - The parent node of the children to be moved.
 * @param grandpa - The grandparent node of the parent.
 * @param greatGrandpa - The great-grandparent node who steals the children and cuts off the
 * family from grandpa down.
 */
const greatGrandpaKidnaps = (parent, grandpa, greatGrandpa) => {
  while (parent.firstChild) {
    greatGrandpa.insertBefore(parent.firstChild, grandpa)
  }
  greatGrandpa.removeChild(grandpa)
}

/**
 * Fixes Obsidian Dataview's markdown rendering discrepencies. Adds wrapped line breaks before
 * empty lines for Live Preview and removes them for Reading mode. Allows for dynamically
 * rendered templates in both Live Preview and Reading mode, unlike Templater.
 * @param template - Multiline string containing the markdown to be rendered.
 * @param dv - The dataview object.
 */
async function renderMdProperly(template, dv) {
  // Remake the template so that it can be rendered properly.
  const lineTemplate = '<div class="cm-line"><br></div>\n'
  let newTemplate = []
  for (const line of template.split(/\r\n|\r|\n/)) {
    if (line.match(/^\s*$/gm) == null) {
      newTemplate.push(line)
    } else {
      newTemplate.push(lineTemplate)
    }
  }
  newTemplate = newTemplate.join("\n")

  // Render the template as a section.
  const extraClassName = "dv-rerendered-md"
  const section = dv.el("section", newTemplate, { cls: extraClassName })

  // Organize the Reading View DOM.
  const childSpan = section.querySelector("span.node-insert-event")
  grandpaKidnaps(childSpan, section)

  // Remove extra lines from the section in reading view.
  // const readSection = document.querySelector(
  //   `div.markdown-reading-view section.${extraClassName}`,
  // )
  const readSection = document.querySelector(`.markdown-reading-view section.${extraClassName}`)
  console.log("found: ", readSection)
  if (readSection) {
    // let extraLine = readSection.querySelector("div.cm-line")
    // while (extraLine) {
    //   console.log("removing ", extraLine)
    //   extraLine.remove()
    //   console.log("removed")
    //   extraLine = readSection.querySelector("div.cm-line")
    // }
    const extraLines = readSection.querySelectorAll("div.cm-line")
    extraLines.forEach((line) => line.remove())

    // Organize the Reading View DOM.
    // const readParent = readSection.parentElement
    // readParent.classList.add(extraClassName)
    // grandpaKidnaps(readSection, readParent)
  }
}

module.exports = { renderMdProperly }
