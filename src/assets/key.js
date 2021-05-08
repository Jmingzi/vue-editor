import VueCompositionAPI, { nextTick, reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'
import useNodes from './node'
import { getParentItemNode, isCharactor, isInputKey, getEditorEl } from './utils'
import useZh from './zh'
import useMouse from './mouse'
// import useCursor from './cursor'
import { getCurrentRange, setRangeState } from './range'
import { isPlaceholder } from './node-placeholder'
import { isParagraph, handleKeyEnter, getDefaultParagraph, deleteNodeByRange, mergeParagraphNode } from './node-paragraph'

Vue.use(VueCompositionAPI)

const state = reactive({})
const { nodes, addNode, currentNode, updateNode, updateNodeContent, setCurrentNodeById, deleteNodeById } = useNodes()
const { isOpenZh } = useZh()
const { setMouseState } = useMouse()
// const { setCursorPosition } = useCursor()

export default function useKey () {
  return {
    ...toRefs(state),
    handleKeyDown
  }
}

async function handleKeyDown (e) {
  // console.log('handleKeyDown => isZhStart', zhInfo.start)
  if (isOpenZh()) {
    return
  }

  const isEnter = e.key === 'Enter'
  const isArrowUp = e.key === 'ArrowUp'
  const isArrowDown = e.key === 'ArrowDown'
  const isArrowLeft = e.key === 'ArrowLeft'
  const isArrowRight = e.key === 'ArrowRight'
  const isDelete = e.key === 'Backspace'
  // console.log(e)
  const isAltKey = e.altKey
  const isMetaKey = e.metaKey
  const isCtrlKey = e.ctrlKey
  const isShiftKey = e.shiftKey
  const isComposedKey = isAltKey || isMetaKey || isCtrlKey || isShiftKey
  const isPaste = isComposedKey && e.key === 'v'
  const maybeShortcut = isCharactor(e.key)
  const editorEl = getEditorEl()

  if (isEnter) {
    e.preventDefault()
    const { setCursor } = getCurrentRange()
    if (isParagraph(currentNode.value.type)) {
      // 在段落中处理换行
      handleKeyEnter()
    } else {
      addNode({ isCurrentAfter: true })
    }
    // 将光标移动到新创建的文本节点
    await nextTick()
    setCursor(0)
  } else if (((isComposedKey && !maybeShortcut) || !isComposedKey) && isInputKey(e.key)) {
    e.preventDefault()
    setTimeout(async () => {
      // 中文的 compositionstart 时机晚于 keydown
      // 只能做延时处理
      if (isOpenZh()) {
        // 中文输入交给 compositionend 处理
        return
      }
      if (isPlaceholder(currentNode.value.type)) {
        // 设置为 文本 节点
        updateNode(getDefaultParagraph(e.key), currentNode.value.id)
        await nextTick()
        // 改变焦点
        const { startContainer, setCursor } = getCurrentRange()
        // console.log('consooe', startContainer)
        if (startContainer === editorEl) {
        }
        setCursor(e.key.length)
        // return
      } else if (isParagraph(currentNode.value.type)) {
        const { startContainer, startOffset, startPiece, setCursor } = getCurrentRange()
        const cursorIndex = startOffset
        let text = startContainer.parentNode.textContent
        if (text.charCodeAt(0) === 8203) {
          // 占位字符
          text = ''
        }
        const pieceIndex = startPiece
        // todo 输入的不止一个字符长度
        console.log('pieceIndex', pieceIndex, currentNode.value.id)
        text = text.substr(0, cursorIndex) + e.key + text.substr(cursorIndex)
        updateNodeContent(text, pieceIndex)
        await nextTick()
        // console.log(endContainer)
        setCursor(cursorIndex + e.key.length)
      }
    })
  } else if (isArrowUp || isArrowDown || isArrowLeft || isArrowRight) {
    // 通过箭头控制光标上下
    // 改变当前节点
    setTimeout(() => {
      const { startContainer, startOffset, startPiece, setCursor } = getCurrentRange()
      const parent = getParentItemNode(startContainer)
      setCurrentNodeById(parent.id)
      setCursor(startOffset, startPiece)
    })
  } else if (isDelete) {
    // todo 选中再删除一段字符
    // todo 跨节点选中删除
    e.preventDefault()
    setMouseState({ currentHoverElItemId: undefined })
    setRangeState()
    const currentRange = getCurrentRange()
    const { startOffset, endOffset, startContainer, endContainer, startPiece, setCursor } = currentRange
    if (startContainer === endContainer) {
      // 同节点
      if (startOffset !== endOffset) {
        // 删除单个
        return
      }
    } else {
      // 跨节点删除
      return deleteNodeByRange(currentRange)
    }

    const cursorIndex = startOffset
    const pieceIndex = startPiece
    const text = startContainer.parentNode.textContent
    if (text.charCodeAt(0) === 8203) {
      const itemEl = getParentItemNode(startContainer)
      // 获取删除后的下一个节点
      const nodeIndex = nodes.value.findIndex(x => x.id === itemEl.id)
      let targetNode
      if (nodes.value.length > 1) {
        if (nodeIndex === 0) {
          targetNode = nodes.value[nodeIndex + 1]
        } else {
          targetNode = nodes.value[nodeIndex - 1]
        }
      }
      // 删除该节点
      deleteNodeById(itemEl.id)
      await nextTick()
      // 如果删除的是第一个节点，删除后去下一个节点的末尾
      // 否则删除后去上一个节点的末尾
      if (targetNode) {
        // 更新当前节点
        setCurrentNodeById(targetNode.id)
        const targetNodeEl = document.getElementById(targetNode.id)
        const textEl = targetNodeEl.childNodes[0].childNodes[0]
        const offset = textEl.textContent.charCodeAt(0) === 8203 ? 0 : textEl.textContent.length
        setCursor(offset)
      }
      return
    } else if (cursorIndex === 0) {
      // 将本节点合并到上一个节点
      const mergeInfo = mergeParagraphNode()
      if (mergeInfo) {
        await nextTick()
        setCursor(mergeInfo.offset)
      }
      return
    }
    updateNodeContent(text.substr(0, cursorIndex - 1) + text.substr(cursorIndex), pieceIndex)
    await nextTick()
    setCursor(cursorIndex - 1)
  } else if (isPaste) {
    e.preventDefault()
    // 获取剪切板文本
    const res = await navigator.clipboard.readText()
    if (!res) {
      console.log('剪切板无内容...')
      return
    }
    const { startPiece, endPiece, startOffset, endOffset, startContainer, setCursor } = getCurrentRange()
    // 只支持同节点，同 piece 的文本粘贴
    if (startPiece === endPiece) {
      const text = startContainer.parentNode.textContent
      if (startOffset === endOffset) {
        const cursorIndex = startOffset
        // 单点粘贴
        updateNodeContent(text.substr(0, cursorIndex) + res + text.substr(cursorIndex), startPiece)
      } else {
        // 选中再粘贴
        updateNodeContent(text.substr(0, startOffset) + res + text.substr(endOffset), startPiece)
        setRangeState()
      }
      await nextTick()
      setCursor(startOffset + res.length, startPiece)
    } else {
      // todo 剪切板 选中跨节点或跨piece 粘贴
      console.warn('跨节点或跨piece 粘贴操作暂不支持')
    }
  } else {
    if (!isMetaKey && maybeShortcut) {
      e.preventDefault()
    }
    if (isComposedKey && e.key === 'w') {
      e.preventDefault()
    }
    // todo 快捷键
    console.log(e.key)
  }
}

// window.addEventListener('beforeunload', () => {
//   return true
// })
// window.addEventListener('unload', () => {
//   console.log(111)
// })
