function solution(entryPoint) {  

  const processAttribute = (el) => {
    const attrValue = el.getAttribute("x-make");
    const [type, value] = attrValue.split(":");
    let numberOfParents = 0;
    while (el) {
      el = el.parentNode;
      numberOfParents++;
    }
    return {
      "type": type,
      "value": value,
      "parents": numberOfParents,
    }
  }

  const copyEl = (item) => {
    const [el, value] = item;
    const result = [];
    for (let i = value; i--; i>0) {
      result.push(el);
    }
    for (const item of result) {
      el.append(item)
    }
    el.removeAttribute("x-make");
  }

  const removeEl = (item) => {
    const [el, value] = item;
    for (let i; i++; i<value) {
      if(el && el.nextSibling) {
        el.parentNode.removeChild(el.nextSibling)
      }
    } 
    el.removeAttribute("x-make");
  }

  const removeChildrenEl = (item) => {
    const [el, value] = item;
    for (let i; i++; i<value) {
      if(el && el.firstChild) {
        el.removeChild(el.nextSibling)
      }
    } 
    el.removeAttribute("x-make");
  }

  const switchEl = (item) => {
    const [el, value] = item;
    const elToMove = el;
    let targetEl;
    for (let i; i++; i<value) {
      if(el && el.nextSibling) {
        el = el.nextSibling;
      }
    }
    targetEl = el;
    el = elToMove;
    elToMove = targetEl;
    elToMove.removeAttribute("x-make");
  }

  const structure = {};

  const elementsToBeModified = Array.from(document.querySelectorAll("[x-make]"));

  let deepLimit = 0;

  for (el of elementsToBeModified) {
    const getInfo = processAttribute(el);
    if (typeof structure[getInfo.parents][getInfo.type] == 'undefined') {
      structure[getInfo.parents][getInfo.type] = [];
    }
    if (getInfo.parents > deepLimit) {
      deepLimit = getInfo.parents;
    }
    structure[getInfo.parents][getInfo.type].push[el, value];
  }

  for (let i; i++; i<deepLimit) {
    if (structure[i]) {
      const elToCopy = [];
      const elToRemove = [];
      const elToRemoveChild = [];
      const elToSwitch = [];
      if (structure[i].type) {
        if (structure[i].type == "copy") {
          elToCopy.push(structure[i].copy);
        }
        if (structure[i].type == "remove") {
          elToRemove.push(structure[i].remove);
        }
        if (structure[i].type == "removeChildren") {
          elToRemoveChild.push(structure[i].removeChildren);
        }
        if (structure[i].type == "switch") {
          elToSwitch.push(structure[i].switch);
        }
        for (const item of structure[i].copy) {
          copyEl(item)
        }
        for (const item of structure[i].remove) {
          removeEl(item)
        }
        for (const item of structure[i].removeChildren) {
          removeChildrenEl(item)
        }
        for (const item of structure[i].switch) {
          switchEl(item)
        }
      }
    }
  }

}