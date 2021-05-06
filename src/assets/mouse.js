import VueCompositionAPI, { nextTick, reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'
import { getParentItemNode, getEditorEl } from './utils'
import useNodes from './node'
import useRange from './range'
// import { EDITOR_CLASS } from './constants'
Vue.use(VueCompositionAPI)

const state = reactive({
  startX: 0,
  startY: 0,
  currentHoverElItemId: ''
})

const {
  nodes,
  addNode,
  setCurrentNodeById
} = useNodes()

const { setRangeState, currentRange } = useRange()

function setMouseState (obj) {
  Object.keys(obj).forEach(k => {
    state[k] = obj[k]
  })
}

async function handleMousedown (e) {
  if (!nodes.value.length) {
    // 添加默认节点
    addNode()
    await nextTick()
  }
  const editorEl = getEditorEl()
  // mouseInfo.startX = e.pageX
  // mouseInfo.startY = e.pageY
  setMouseState({
    startX: e.pageX,
    startY: e.pageY
  })
  let itemEl = getParentItemNode(e.target)
  if (!itemEl) {
    itemEl = document.elementFromPoint(e.pageX, e.pageY)
  }
  if (itemEl === editorEl) {
    // 设置为最后一个节点
    const childs = editorEl.childNodes
    itemEl = childs[childs.length - 1]
  }
  // console.log(itemEl)
  if (itemEl && itemEl.id) {
    console.log('设置当前节点', itemEl.id)
    setCurrentNodeById(itemEl.id)
  } else {
    console.warn('鼠标点击的位置，不是一个节点')
  }
}

function handleMousemove (e) {
  const el = document.elementFromPoint(e.pageX, e.pageY)
  const editorEl = getEditorEl()
  if (
    el &&
    el !== editorEl
  ) {
    const item = getParentItemNode(el)
    if (item) {
      state.currentHoverElItemId = item.id
    }
  } else {
    // currentHoverElItemId.value = undefined
  }
}

async function handleMouseup (e) {
  // console.log(e.target)
  const selection = window.getSelection()
  if (selection.isCollapsed) {
    // if (
    //   currentNode.value.type === 'placeholder' ||
    //   (currentNode.value.content.length === 1 && !currentNode.value.content[0].value)
    // ) {
    //   const range = selection.getRangeAt(0)
    //   range.setStart(range.startContainer, 0)
    //   range.setEnd(range.startContainer, 0)
    //   // console.log(range)
    // }
  } else {
    // 选中了文本
    const range = selection.getRangeAt(0)
    // 只做同段选中
    if (
      getParentItemNode(range.startContainer) === getParentItemNode(range.endContainer) && (
        !currentRange.value ||
        (
          currentRange.value.startOffset !== range.startOffset ||
          currentRange.value.endOffset !== range.endOffset
        )
      )
    ) {
      const el = getParentItemNode(e.target)
      if (el) {
        const startPiece = Number(range.startContainer.parentNode.dataset.piece)
        const endPiece = Number(range.endContainer.parentNode.dataset.piece)
        setRangeState(range, el.id, state.startX, e.pageX, startPiece, endPiece)
        return
      }
    }
  }
  setRangeState()
}

export default function useMouse () {
  return {
    ...toRefs(state),
    setMouseState,
    handleMousedown,
    handleMouseup,
    handleMousemove
  }
}
