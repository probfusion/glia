const { throwError } = require('./utils.cjs')

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

const addLineEls = (rawMd, extraClass = 'glia-rendered') => {
  // Add line divs to the markdown so that it can be rendered properly in live preview.
  const lineTemplate = `<div class="cm-line ${extraClass}"><br></div>\n`
  const mdWithDivs = []
  let nLinesAdded = 0
  for (const line of rawMd.split(/\r\n|\r|\n/)) {
    if (line.match(/^\s*$/gm) == null) {
      mdWithDivs.push(line)
    } else {
      mdWithDivs.push(lineTemplate)
      nLinesAdded += 1
    }
  }
  return [mdWithDivs.join('\n'), nLinesAdded]
}

const readViewLineRemover = (nLinesAdded, lineSelector = 'div.cm-line.glia-rendered') => {
  const removeLines = (mutations) => {
    const ndList = mutations.reduce((nodes, mut) => nodes.concat(...mut.addedNodes), [])
    ndList.forEach((nd) => nd?.querySelectorAll?.(lineSelector)?.forEach((ln) => ln.remove()))
    // ndList.forEach((nd) => {
    //   // nd?.querySelectorAll?.(lineSelector)?.forEach((ln) =>ln.remove())
    //   const lines = nd?.querySelectorAll?.(lineSelector)
    //   if (lines) lines.forEach((line) => line.remove())
    //   lines?.forEach((line) => {
    //     line.remove()
    //     console.log('removed line')
    //   })
    // })
    // console.log(ndList)
    // for (const mutation of mutationList) {
    //   mutation.addedNodes.forEach((node) => {
    //     const lines = node?.querySelectorAll?.(lineSelector)

    //     lines?.forEach((line) => {
    //       line.remove()
    //       console.log('removed line')
    //     })
    //   })
    // }
  }

  const observerConfig = {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false,
  }

  const readViewEls = document.querySelectorAll('.mod-active .markdown-reading-view')
  let nLinesRemoved = 0
  readViewEls.forEach((el) => {
    el.querySelectorAll(lineSelector).forEach((line) => {
      line.remove()
      nLinesRemoved += 1
    })
    console.log(`removed ${nLinesRemoved} lines initially`)
    if (nLinesRemoved < nLinesAdded) {
      const observer = new MutationObserver(removeLines)
      observer.observe(el, observerConfig)
      console.log('added observer')
      setTimeout(() => {
        console.log('line remover observer timed out.')
        observer.disconnect()
      }, 1000)
    }
  })
}

/**
 * Fixes Obsidian Dataview's markdown rendering discrepencies. Adds wrapped line breaks before
 * empty lines for Live Preview and removes them for Reading mode. Allows for dynamically
 * rendered templates in both Live Preview and Reading mode, unlike Templater.
 * @param rawMd - Multiline string containing the markdown to be rendered.
 * @param dv - The dataview object.
 */
const renderMd = (rawMd, dv, tag = 'section', extraClass = 'glia-rendered') => {
  // Add lines for Live Preview
  const [newMd, nLinesAdded] = addLineEls(rawMd)

  // Render the template in the specified parent element.
  const parentEl = dv.el(tag, newMd, { cls: extraClass })

  // Put childSpan's children (the rendered MD) under parentEl
  const childSpan = parentEl.querySelector('span.node-insert-event')
  grandpaKidnaps(childSpan, parentEl)

  // Remove lines from reading view
  readViewLineRemover(nLinesAdded)
}

console.log('glia.dom loaded.')
module.exports = { addLineEls, renderMd }
