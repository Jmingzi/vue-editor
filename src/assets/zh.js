import VueCompositionAPI, { nextTick, reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'
import useNodes from './node'
Vue.use(VueCompositionAPI)

const state = reactive({
  start: false,
  beforeStartText: '',
  beforeStartCursorIndex: 0,
  pieceIndex: 0
})
const {
  // nodes,
  currentNode,
  // addNode,
  updateNodeContent,
  updateNode,
  getDefaultParagraph
} = useNodes()

function openZh (open = true) {
  state.start = open
}

function isOpenZh () {
  return state.start
}

function setZhState (obj) {
  Object.keys(obj).forEach(k => {
    state[k] = obj[k]
  })
}

async function handleZhStart (e) {
  e.preventDefault()
  // zhInfo.start = true
  openZh()
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const pieceParent = range.startContainer.parentNode
  setZhState({
    beforeStartText: pieceParent.dataset.piece ? pieceParent.textContent : '',
    beforeStartCursorIndex: range.startOffset,
    pieceIndex: pieceParent.dataset.piece ? Number(pieceParent.dataset.piece) : 0
  })
  // zhInfo.beforeStartText = pieceParent.dataset.piece ? pieceParent.textContent : ''
  // zhInfo.beforeStartCursorIndex = range.startOffset
  // zhInfo.pieceIndex = pieceParent.dataset.piece ? Number(pieceParent.dataset.piece) : 0
}

async function handleZhEnd (e) {
  // if (!nodes.value.length) {
  //   // 移除初次中文输入的节点
  //   const editorEl = document.querySelector(`.${EDITOR_CLASS}`)
  //   const { firstChild } = editorEl
  //   if (firstChild.textContent === e.data) {
  //     firstChild.remove()
  //   }
  //   addNode()
  // }
  if (currentNode.value.type === 'placeholder') {
    updateNode(getDefaultParagraph(), currentNode.value.id)
  }
  openZh(false)
  // zhInfo.start = false
  const text = state.beforeStartText
  const cursorIndex = state.beforeStartCursorIndex
  updateNodeContent(text.substr(0, cursorIndex) + e.data + text.substr(cursorIndex), state.pieceIndex)
  await nextTick()
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  const offset = cursorIndex + e.data.length
  range.setStart(range.startContainer, offset)
  range.setEnd(range.endContainer, offset)
  // range.collapse(true)
  // for (let i = 0; i < (cursorIndex + e.data.length); i++) {
  //   window.getSelection().modify('move', 'right', 'character')
  // }
}

export default function useZh () {
  return {
    ...toRefs(state),
    openZh,
    isOpenZh,
    setZhState,
    handleZhStart,
    handleZhEnd
  }
}
