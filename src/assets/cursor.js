import VueCompositionAPI, { reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'
import { state as nodeState } from './node'
Vue.use(VueCompositionAPI)

export const state = reactive({
  piece: -1,
  startOffset: -1,
  id: ''
})

export function setCursorPosition (offset, piece = 0, range) {
  if (!range) {
    const selection = window.getSelection()
    if (selection.rangeCount > 0) {
      range = selection.getRangeAt(0)
    } else {
      console.warn('cursor.setCursorPosition 当前 selection 没有选区')
      return
    }
  }
  const itemEl = document.getElementById(nodeState.currentNode.id)
  const textEl = itemEl.childNodes[piece].childNodes[0]
  range.setStart(textEl, offset)
  range.setEnd(textEl, offset)
  // let startPiece = range.startContainer.parentNode.dataset.piece
  // if (startPiece) {
  //   startPiece = Number(startPiece)
  // }
  setCursorState(range.startOffset, piece)
}

export function setCursorState (startOffset, piece, id = nodeState.currentNode.id) {
  state.startOffset = startOffset
  state.piece = piece
  state.id = id
}

export default function useCursor () {
  return {
    ...toRefs(state),
    setCursorPosition
  }
}
