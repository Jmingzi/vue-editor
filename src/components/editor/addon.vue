<template>
  <div class="xm-editor__addon">
    <div
      class="xm-editor__addon-hover"
      :style="{ top: addonTop + 'px' }"
      @mouseenter="handleMouseOverAddon"
      @mouseleave="handleMouseOutAddon"
    >
      {{ isPlaceholder ? '+' : '=' }}
    </div>
    <div
      v-if="showPopup"
      class="xm-editor__addon-popup xm-editor__addon-paragraph"
      :style="{ top: addonTop + 25 + 'px' }"
      @mouseenter="handleMouseOverPopup"
      @mouseleave="handleMouseOutPopup"
    >
      <div class="" style="display: flex">
        <div
          v-for="(item, i) in isPlaceholder ? placeholderMenus : paragraphMenus"
          :key="i"
          class="xm-editor__addon-block-menu"
          :class="{
            'xm-editor__addon-block-menu--active': !isPlaceholder &&
              hoverNode &&
              hoverNode.attributes[item.field] === item[item.field]
          }"
          @click="item.action(hoverNode), showPopup = false"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { watchEffect, ref, computed, onMounted } from '@vue/composition-api'
import useNodes from '../../assets/node'
import useMouse from '../../assets/mouse'

const paragraphMenus = [
  {
    label: 'H1',
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
    label: 'H3',
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
    label: '左',
    action: (node) => {
      node.attributes.align = 'left'
    },
    align: 'left',
    field: 'align'
  },
  {
    label: '中',
    action: (node) => {
      node.attributes.align = 'center'
    },
    align: 'center',
    field: 'align'
  },
  {
    label: '右',
    action: (node) => {
      node.attributes.align = 'right'
    },
    align: 'right',
    field: 'align'
  }
]

const placeholderMenus = [
  {
    label: '图片'
  },
  {
    label: '表格'
  }
]

export default {
  setup (props, ctx) {
    const { nodes, updateNode, currentNode } = useNodes()
    const { currentHoverElItemId } = useMouse()
    const addonTop = ref(-1000)
    const showPopup = ref(false)
    const hoverNode = ref(null)
    const parentRect = ref(null)
    let isOverPopup = false

    function handleMouseOverAddon () {
      showPopup.value = true
      // console.log(1)
    }

    function handleMouseOutAddon () {
      setTimeout(() => {
        if (!isOverPopup) {
          showPopup.value = false
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
      showPopup.value = false
      // console.log(4)
    }

    onMounted(() => {
      parentRect.value = ctx.parent.$el.getBoundingClientRect()
    })

    watchEffect(() => {
      if (currentHoverElItemId.value) {
        const id = currentHoverElItemId.value
        // 根据 id 获取 dom 所在的高度
        const el = document.getElementById(id)
        const { top } = el.getBoundingClientRect()
        addonTop.value = top - (parentRect.value ? parentRect.value.top : 0)
        // 当前 hover 的节点
        hoverNode.value = nodes.value.find(x => x.id === id)
      }
    })

    watchEffect(() => {
      if (hoverNode.value) {
        if (showPopup.value) {
          updateNode({ editing: true }, hoverNode.value.id)
        } else if (hoverNode.value.editing) {
          updateNode({ editing: false }, hoverNode.value.id)
        }
      }
    })

    return {
      addonTop,
      showPopup,
      hoverNode,
      paragraphMenus,
      placeholderMenus,
      isPlaceholder: computed(() => currentNode.value && currentNode.value.type === 'placeholder'),
      handleMouseOverAddon,
      handleMouseOutAddon,
      handleMouseOverPopup,
      handleMouseOutPopup
    }
  }
}
</script>

<style lang="less">
.xm-editor__addon {
  &-hover {
    position: absolute;
    width: 25px;
    height: 25px;
    border-radius: 25px;
    background: #ccc;
    left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  &-popup {
    position: absolute;
    width: 200px;
    height: 200px;
    box-shadow: 0 0 5px rgba(0, 0, 0, .3);
    border-radius: 5px;
    left: 10px;
    background: #fff;
    padding: 15px;
    z-index: 9;
  }
  &-paragraph {
  }
  &-block-menu {
    width: 30px;
    height: 30px;
    border: 1px #ccc solid;
    &--active {
      background: lightblue;
    }
  }
}
</style>
