import VueCompositionAPI, { reactive, toRefs } from '@vue/composition-api'
import Vue from 'vue'
import cloneDeep from 'lodash/cloneDeep'
import { getUniId } from './utils'
import { getNode as getNodePlaceholder } from './node-placeholder'
import { isParagraph } from './node-paragraph'
Vue.use(VueCompositionAPI)

export const state = reactive({
  nodes: [],
  currentNode: null
})

export function addNode (option = {}) {
  // isCurrentBefore 插入在当前节点之前
  // isCurrentAfter 插入在当前节点之后
  const { isCurrentBefore, isCurrentAfter } = option
  const itemIndex = state.currentNode ? state.nodes.findIndex(x => x.id === state.currentNode.id) : -1
  if (isCurrentBefore) {
    const item = getNodePlaceholder()
    state.nodes.splice(itemIndex, 0, item)
  } else if (isCurrentAfter) {
    // 克隆当前节点
    const item = cloneDeep(state.currentNode)
    item.id = getUniId()
    if (isParagraph(item.type)) {
      item.content = [{ value: '' }]
    }
    state.nodes.splice(itemIndex + 1, 0, item)
    state.currentNode = item
  } else {
    const item = getNodePlaceholder()
    state.nodes.push(item)
    state.currentNode = item
  }
}

function updateNode (updateData, id) {
  if (!id && state.currentNode) {
    id = state.currentNode.id
  }
  if (!id) {
    throw new Error('updateNode id is undefined')
  }
  const item = state.nodes.find(x => x.id === id)
  Object.keys(updateData).forEach(k => {
    if (item[k] === undefined) {
      Vue.set(item, k, updateData[k])
    } else {
      item[k] = updateData[k]
    }
  })
}

function updateNodeContent (str, index = 0) {
  const { id } = state.currentNode
  if (!id) {
    console.error('当前节点不存在')
  }
  const item = state.nodes.find(x => x.id === id)
  item.content[index].value = str
}

export function setCurrentNodeById (id) {
  state.currentNode = state.nodes.find(x => x.id === id)
}

function deleteNodeById (id) {
  const index = state.nodes.findIndex(x => x.id === id)
  if (state.nodes.length > 1) {
    state.nodes.splice(index, 1)
  }
}

export default function useNodes () {
  return {
    ...toRefs(state),
    addNode,
    updateNode,
    updateNodeContent,
    setCurrentNodeById,
    deleteNodeById
  }
}
