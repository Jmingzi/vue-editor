import { TYPE_PARAGRAPH } from './constants'
import { getCurrentRange } from './range'
import { state as nodeState, addNode, setCurrentNodeById } from './node'
import { getParentItemNode, getUniId } from './utils'
import { nextTick } from '@vue/composition-api'
import cloneDeep from 'lodash/cloneDeep'

export function isParagraph (type) {
  return type === TYPE_PARAGRAPH
}

export function handleKeyEnter () {
  const { startPiece, startOffset, endOffset } = getCurrentRange()
  const pieceIndex = startPiece
  if (
    pieceIndex === nodeState.currentNode.content.length - 1 &&
    endOffset === nodeState.currentNode.content[pieceIndex].value.length
  ) {
    // 在末尾，直接创建占位节点
    console.log('末尾...')
    addNode({ isCurrentAfter: true })
  } else if (
    pieceIndex === 0 &&
    startOffset === 0
  ) {
    // 在开头，在当前节点直接创建占位节点
    console.log('开头...')
    addNode({ isCurrentBefore: true })
  } else {
    console.log('中间换行...')
    // 在中间，将当前节点截断，创建新节点
    addNodeByCurrent(pieceIndex, startOffset)
  }
}

export function getDefaultParagraph (content = '') {
  return {
    // id: getUniId(),
    type: 'paragraph',
    content: [
      {
        value: content
      }
    ],
    editing: false,
    attributes: {
      tag: 'p',
      align: 'left'
    }
  }
}

export function addNodeByCurrent (pieceIndex, cursorIndex) {
  const itemIndex = nodeState.nodes.findIndex(x => x.id === nodeState.currentNode.id)
  const item = nodeState.nodes[itemIndex]
  const pieceItem = item.content[pieceIndex]
  let newContent
  if (cursorIndex === 0) {
    item.content = item.content.slice(0, pieceIndex)
    newContent = item.content.slice(pieceIndex)
  } else if (cursorIndex === pieceItem.value.length) {
    item.content = item.content.slice(0, pieceIndex + 1)
    newContent = item.content.slice(pieceIndex + 1)
  } else {
    // 中间
    item.content = item.content.slice(0, pieceIndex + 1)
    newContent = item.content.slice(pieceIndex + 1)
    newContent.unshift({
      ...cloneDeep(pieceItem),
      value: pieceItem.value.substr(cursorIndex)
    })
    pieceItem.value = pieceItem.value.substr(0, cursorIndex)
  }
  if (newContent.length) {
    const newItem = { ...cloneDeep(item), content: newContent, id: getUniId() }
    nodeState.nodes.splice(itemIndex + 1, 0, newItem)
    nodeState.currentNode = newItem
  }
}

export function mergeParagraphNode () {
  const curIndex = nodeState.nodes.findIndex(x => x.id === nodeState.currentNode.id)
  if (curIndex > 0) {
    const priItem = nodeState.nodes[curIndex - 1]
    if (
      priItem.type === 'placeholder' ||
      (priItem.content.length === 1 && !priItem.content[0].value)
    ) {
      // 前节点为空，直接删除
      nodeState.nodes.splice(curIndex - 1, 1)
    } else if (priItem.type === 'paragraph') {
      // 比较前节点最后的 piece 与当前节点的第一个 piece
      const lastIndex = priItem.content.length - 1
      const last = priItem.content[lastIndex]
      const curContent = nodeState.nodes[curIndex].type === 'paragraph' ? nodeState.nodes[curIndex].content : []
      const cur = curContent[0]
      const same = Object.keys(cur).filter(x => x !== 'value').every(x => cur[x] === last[x])
      const offset = last.value.length
      if (same) {
        // 将 cur 合并到 last
        last.value += cur.value
        curContent.shift()
        priItem.content = priItem.content.concat(curContent)
      } else {
        priItem.content = priItem.content.concat(curContent)
      }
      nodeState.nodes.splice(curIndex, 1)
      nodeState.currentNode = priItem
      return { offset, piece: lastIndex }
    }
  }
}

export function deleteNodeByRange ({
  startContainer,
  endContainer,
  startOffset,
  endOffset,
  startPiece,
  endPiece,
  setCursor
}) {
  // console.log(startContainer)
  const startEl = getParentItemNode(startContainer)
  const endEl = getParentItemNode(endContainer)
  const startElIndex = nodeState.nodes.findIndex(x => x.id === startEl.id)
  const endElIndex = nodeState.nodes.findIndex(x => x.id === endEl.id)
  // let selectElLength = endElIndex - startElIndex - 1
  const startNode = nodeState.nodes[startElIndex]
  const endNode = nodeState.nodes[endElIndex]
  let start = startElIndex + 1
  let end = endElIndex - 1
  let needMerge = false
  if (startPiece === 0 && startOffset === 0) {
    // 删除开始节点
    start = startElIndex
  } else {
    // 截取开始节点
    startNode.content = startNode.content.slice(0, startPiece + 1)
    startNode.content[startPiece].value = startNode.content[startPiece].value.substr(0, startOffset)
  }
  if (
    endPiece === endNode.content.length - 1 &&
    endOffset === endNode.content[endNode.content.length - 1].value.length
  ) {
    // 删除末尾节点
    end = endElIndex
  } else {
    needMerge = true
    // 截取末尾节点
    endNode.content = endNode.content.slice(endPiece, endNode.content.length)
    endNode.content[endPiece].value = endNode.content[endPiece].value.substr(endOffset)
  }
  // 删除中间节点
  if (start <= end) {
    nodeState.nodes.splice(start, end - start + 1)
  }
  // 设置当前节点
  if (!nodeState.nodes.length) {
    addNode()
  } else {
    const item = nodeState.nodes[start] || nodeState.nodes[start - 1]
    if (item) {
      setCurrentNodeById(item.id)
    } else {
      console.warn(`start = ${start} 对应的节点不存在`)
    }
  }
  if (needMerge) {
    // 根据当前节点向前合并
    const mergeResult = mergeParagraphNode()
    if (mergeResult) {
      nextTick().then(() => {
        setCursor(mergeResult.offset)
      })
    }
  } else {
    nextTick().then(() => {
      if (startPiece === 0 && startOffset === 0) {
        // 焦点设置为前一个节点的末尾
        const pri = nodeState.nodes[start - 1]
        const last = pri.content[pri.content.length - 1]
        setCursor(last.value.length, pri.content.length - 1)
      } else {
        // 焦点设置为当前节点的末尾
        setCursor(startNode.content[startPiece].value.length, startPiece)
      }
    })
  }
}
