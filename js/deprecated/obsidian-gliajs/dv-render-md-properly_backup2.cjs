// useful for de-indenting multiline template strings
const noIndent = (s) => s.replace(/^[^\S\r\n]+/gm, '')
// throws error with de-indented multiline template strings
const throwError = (errStr) => {
  throw new Error(noIndent(errStr))
}
// run once
const once = (f) => {
  let done = false
  return (...args) => {
    if (done) return
    done = true
    f(...args)
  }
}

/**
 * Moves all child nodes of a parent to a grandparent node and removes the parent node.
 * @param parent - The parent node of the children to be moved.
 * @param grandpa - The grandparent node who steals the children and cuts off the parent.
 */
const grandpaKidnaps = (parent, grandpa) => {
  while (parent.firstChild) {
    grandpa.insertBefore(parent.firstChild, parent)
  }
  grandpa.removeChild(parent)
}

/**
 * Elevates all child nodes of a parent to the same level as the parent. By default, adds
 * starting and ending shallow clones of the parent element as markers. Highly recommend adding
 * starting and ending classes to the markers.
 * @param parent - The parent element whose children should be elevated.
 * @param [startClass=null] - The CSS class to be added to starting surrounding parent clone.
 * @param [endClass=null] - The CSS class to be added to ending surrounding parent clone.
 * @param [parentPosition='both'] - 'both' will add start and end parent clones surrounding (but
 * not parenting/including) the child nodes. 'front' will add a start parent clone before the
 * child nodes. 'back' will add an end parent clone after the child nodes
 */
const childrenToSiblings = (
  parent,
  startClass = null,
  endClass = null,
  parentPosition = 'both',
) => {
  // make sure parentPosition is correctly set
  const posErrStr = `parentPosition parameter must be 'front', 'back', or 'both'!
    It is currently ${parentPosition}`

  if (!['both', 'front', 'back'].includes(parentPosition)) throwError(posErrStr)

  // Insert parent clones
  const insertFront = () => {
    const startClone = parent.cloneNode(false)
    if (startClass) startClone.classList.add(startClass)
    parent.insertBefore(startClone, parent.firstChild)
  }
  const insertBack = () => {
    const endClone = parent.cloneNode(false)
    if (endClass) endClone.classList.add(endClass)
    parent.appendChild(endClone)
  }
  const placeParent = {
    front: insertFront,
    back: insertBack,
    both: () => {
      insertFront()
      insertBack()
    },
  }
  placeParent[parentPosition]()

  parent?.parentNode
    ? grandpaKidnaps(parent, parent.parentNode)
    : throwError('Parent node must itself also have a parent node!')
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
  newTemplate = newTemplate.join('\n')

  // Render the template as a section.
  const extraClassName = 'dv-rerendered-md'
  const section = dv.el('section', newTemplate, { cls: extraClassName })

  // Organize the DOM.
  const childSpan = section.querySelector('span.node-insert-event')
  grandpaKidnaps(childSpan, section)

  // Remove extra lines from the section in reading view.
  const readSection = document.querySelector(`.markdown-reading-view section.${extraClassName}`)
  if (readSection) readSection.querySelectorAll('div.cm-line').forEach((line) => line.remove())

  // Reorganize DOM
  childrenToSiblings(section, `${extraClassName}-start`, `${extraClassName}-end`)
}

module.exports = { renderMdProperly }
