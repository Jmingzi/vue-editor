import { EDITOR_CLASS } from './constants'

export function isCharactor (key) {
  return 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(key) > -1
}

export function isInputKey (key) {
  const words = '0123456789，。·、！@$@#¥%&*（）——+!^()-_=+`~\\{}[];:\'",.<>《》'
  return isCharactor(key) || words.indexOf(key) > -1
}

export function getParentItemNode (el) {
  let num = 0
  while (el && (!el.classList || !el.classList.contains('xm-editor__item')) && num <= 5) {
    el = el.parentNode
    num += 1
  }
  return el
}

let editorEl = null
export function getEditorEl () {
  if (!editorEl) {
    editorEl = document.querySelector(`.${EDITOR_CLASS}`)
  }
  return editorEl
}

export function getUniId (num = 6) {
  const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const getWord = () => str[Math.floor(Math.random() * str.length)]
  let id = ''
  for (let i = 0; i < num; i++) {
    id += getWord()
  }
  return id
}
