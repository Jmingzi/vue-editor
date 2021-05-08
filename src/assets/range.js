import VueCompositionAPI, { reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'
// import { state as nodeState } from './node'
import { setCursorPosition } from './cursor'
Vue.use(VueCompositionAPI)

const state = reactive({
  currentRange: null,
  nodeId: '',
  rangeWidth: 0,
  rangeDir: 'leftRight',
  startX: 0,
  endX: 0,
  startPiece: 0,
  endPiece: 0
})

// const { currentNode } = useNodes()

export function setRangeState (range, nodeId, startX, endX, startPiece, endPiece) {
  state.currentRange = range
  state.nodeId = nodeId
  state.rangeWidth = Math.abs(endX - startX)
  state.startX = startX
  state.endX = endX
  state.rangeDir = endX > startX ? 'leftRight' : 'rightLeft'
  state.startPiece = startPiece
  state.endPiece = endPiece
}

export default function useRange () {
  return {
    ...toRefs(state),
    setRangeState,
    getCurrentRange
  }
}

export function getCurrentRange () {
  const selection = window.getSelection()
  if (!selection.rangeCount) {
    console.warn('range.getCurrentRange 当前 selection 没有选区')
    return
  }
  const range = selection.getRangeAt(0)
  const { endContainer, startContainer, startOffset, endOffset, collapsed } = range
  // console.log(startOffset, endOffset, range)
  let startPiece = startContainer.parentNode.dataset.piece
  let endPiece = endContainer.parentNode.dataset.piece
  if (startPiece) {
    startPiece = Number(startPiece)
  }
  if (endPiece) {
    endPiece = Number(endPiece)
  }
  // const setCursor = (offset, piece = 0) => {
  //   const itemEl = document.getElementById(nodeState.currentNode.id)
  //   const textEl = itemEl.childNodes[piece].childNodes[0]
  //   range.setStart(textEl, offset)
  //   range.setEnd(textEl, offset)
  // }
  return {
    collapsed,
    startOffset,
    endOffset,
    startContainer,
    endContainer,
    startPiece,
    endPiece,
    setCursor: (...args) => setCursorPosition.apply(null, args.concat(args.length === 1 ? [undefined, range] : range))
  }
}
