"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const fs = (() => {
  const mod = require("fs");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const Path = (() => {
  const mod = require("path");
  return mod && mod.__esModule ? mod : Object.assign(/* @__PURE__ */ Object.create(null), mod, { default: mod, [Symbol.toStringTag]: "Module" });
})();
const noIndent = (s) => s.replace(/^[^\S\r\n]+/gm, "");
const throwError = (errStr) => {
  throw new Error(noIndent(errStr));
};
const globalHas = (prop) => {
  return global?.[prop] ? true : false;
};
const readFile = (path) => fs.readFileSync(path, "utf8");
const getPageByName = (app, dv, name) => {
  const pagePath = Path.resolve(app.vault.adapter.basePath, dv.page(name).file.path);
  return readFile(pagePath);
};
const utils = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getPageByName,
  globalHas,
  noIndent,
  readFile,
  throwError
}, Symbol.toStringTag, { value: "Module" }));
const grandpaKidnaps = (parent, grandpa) => {
  while (parent.firstChild) {
    grandpa.insertBefore(parent.firstChild, parent);
  }
  grandpa.removeChild(parent);
};
const addLineEls = (rawMd, extraClass = "glia-rendered") => {
  const lineTemplate = `<div class="cm-line ${extraClass}"><br></div>
`;
  const mdWithDivs = [];
  let nLinesAdded = 0;
  for (const line of rawMd.split(/\r\n|\r|\n/)) {
    if (line.match(/^\s*$/gm) == null) {
      mdWithDivs.push(line);
    } else {
      mdWithDivs.push(lineTemplate);
      nLinesAdded += 1;
    }
  }
  return [mdWithDivs.join("\n"), nLinesAdded];
};
const readViewLineRemover = (lineSelector = "div.cm-line.glia-rendered") => {
  const removeLines = (mutations) => {
    const ndList = mutations.reduce((nodes, mut) => nodes.concat(...mut.addedNodes), []);
    ndList.forEach((nd) => nd?.querySelectorAll?.(lineSelector)?.forEach((ln) => ln.remove()));
  };
  const readViewEls = document.querySelectorAll(".mod-active .markdown-reading-view");
  readViewEls.forEach((el) => {
    el.querySelectorAll(lineSelector).forEach((line) => line.remove());
    const observer = new MutationObserver(removeLines);
    observer.observe(el, { childList: true, subtree: true });
    setTimeout(() => observer.disconnect(), 1e3);
  });
};
const renderMd = (rawMd, dv, tag = "section", extraClass = "glia-rendered") => {
  const [newMd, _] = addLineEls(rawMd);
  const parentEl = dv.el(tag, newMd, { cls: extraClass });
  const childSpan = parentEl.querySelector("span.node-insert-event");
  grandpaKidnaps(childSpan, parentEl);
  readViewLineRemover();
};
const domManipulator = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  addLineEls,
  grandpaKidnaps,
  readViewLineRemover,
  renderMd
}, Symbol.toStringTag, { value: "Module" }));
const renderTemplate = (app, dv, name) => {
  const template = getPageByName(app, dv, name);
  renderMd(template, dv);
};
exports.dom = domManipulator;
exports.renderTemplate = renderTemplate;
exports.utils = utils;