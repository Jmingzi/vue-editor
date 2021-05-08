/*
 * 菜单及交互
 */

import VueCompositionAPI, { onMounted, reactive, toRefs, watchEffect, computed } from '@vue/composition-api'
import Vue from 'vue'
import useNodes from './node'
import useMouse from './mouse'
Vue.use(VueCompositionAPI)

const state = reactive({
  addonTop: -1000,
  showPopup: false,
  hoverNode: null,
  parentRect: null
})

const { nodes, updateNode } = useNodes()
const { currentHoverElItemId } = useMouse()
// const addonTop = ref(-1000)
// const showPopup = ref(false)
// const hoverNode = ref(null)
// const parentRect = ref(null)
let isOverPopup = false

function handleMouseOverAddon () {
  state.showPopup = true
  // console.log(1)
}

function handleMouseOutAddon () {
  setTimeout(() => {
    if (!isOverPopup) {
      state.showPopup = false
      // console.log(2)
    }
  })
}

function handleMouseOverPopup () {
  isOverPopup = true
  // console.log(3)
}

function handleMouseOutPopup () {
  isOverPopup = false
  state.showPopup = false
  // console.log(4)
}

watchEffect(() => {
  if (currentHoverElItemId.value) {
    const id = currentHoverElItemId.value
    // 根据 id 获取 dom 所在的高度
    const el = document.getElementById(id)
    const { top } = el.getBoundingClientRect()
    state.addonTop = top - (state.parentRect ? state.parentRect.top : 0)
    // 当前 hover 的节点
    state.hoverNode = nodes.value.find(x => x.id === id)
  }
})

watchEffect(() => {
  if (state.hoverNode) {
    if (state.showPopup) {
      updateNode({ editing: true }, state.hoverNode.id)
    } else if (state.hoverNode.editing) {
      updateNode({ editing: false }, state.hoverNode.id)
    }
  }
})

export const menus = [
  {
    label: 'H1',
    icon: 'h1',
    action: (node) => {
      if (node.attributes.tag === 'h1') {
        node.attributes.tag = 'p'
      } else {
        node.attributes.tag = 'h1'
      }
    },
    tag: 'h1',
    field: 'tag'
  },
  {
    label: 'H2',
    icon: 'h2',
    action: (node) => {
      if (node.attributes.tag === 'h2') {
        node.attributes.tag = 'p'
      } else {
        node.attributes.tag = 'h2'
      }
    },
    tag: 'h2',
    field: 'tag'
  },
  {
    label: 'H3',
    icon: 'h3',
    action: (node) => {
      if (node.attributes.tag === 'h3') {
        node.attributes.tag = 'p'
      } else {
        node.attributes.tag = 'h3'
      }
    },
    tag: 'h3',
    field: 'tag'
  },
  {
    label: '',
    icon: 'li-decimal',
    action: () => {
    }
  },
  {
    label: '',
    icon: 'li-disc',
    action: () => {
    }
  },
  {
    label: '',
    icon: 'blockquote',
    action: () => {
    }
  },
  {
    label: '',
    icon: 'tip',
    action: () => {
    }
  },
  {
    label: '',
    icon: 'code',
    action: () => {
    }
  }
]

export const paragraphStyleMenus = [
  {
    label: '左',
    icon: 'align-left',
    action: (node) => {
      node.attributes.align = 'left'
    },
    align: 'left',
    field: 'align'
  },
  {
    label: '中',
    icon: 'align-center',
    action: (node) => {
      node.attributes.align = 'center'
    },
    align: 'center',
    field: 'align'
  },
  {
    label: '右',
    icon: 'align-right',
    action: (node) => {
      node.attributes.align = 'right'
    },
    align: 'right',
    field: 'align'
  }
]

export const placeholderMenus = [
  {
    label: '图片',
    icon: 'image',
    color: '#ffc60a'
  },
  {
    label: '表格',
    icon: 'table',
    color: '#00d6b9'
  }
]

export default function useAddon (ctx) {
  onMounted(() => {
    state.parentRect = ctx.parent.$el.getBoundingClientRect()
  })
  return {
    ...toRefs(state),
    isPlaceholder: computed(() => state.hoverNode && state.hoverNode.type === 'placeholder'),
    handleMouseOverAddon,
    handleMouseOutAddon,
    handleMouseOverPopup,
    handleMouseOutPopup
  }
}
