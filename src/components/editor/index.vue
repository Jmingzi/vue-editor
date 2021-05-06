<template>
  <div class="xm-editor">
    <div
      class="xm-editor__content"
      contenteditable="true"
      ref="editor"
      @keydown="handleKeyDown"
      @mousedown="handleMousedown"
      @compositionstart="handleZhStart"
      @compositionend="handleZhEnd"
      @mousemove="handleMousemove"
      @mouseup="handleMouseup"
    >
      <component
        v-for="(item) in nodes"
        :key="item.id"
        :is="item.type"
        :data="item"
        :id="item.id"
        ref="items"
        class="xm-editor__item"
      />
    </div>
    <addon ref="addon" />
    <basic-tools />
    <div class="xm-editor__line">
      <div v-for="(it, i) in nodes" :key="it.id">{{ i + 1 }}.</div>
    </div>
  </div>
</template>

<script>
import useNodes from '../../assets/node'
import useZh from '../../assets/zh'
import useMouse from '../../assets/mouse'
import useKey from '../../assets/key'
import Paragraph from './item-paragraph'
import Placeholder from './item-placeholder'
import Addon from './addon'
import BasicTools from './basic-tools'
import throttle from 'lodash/throttle'

export default {
  components: {
    [Paragraph.name]: Paragraph,
    [Placeholder.name]: Placeholder,
    Addon,
    BasicTools
  },

  setup () {
    const { nodes } = useNodes()
    const { handleZhStart, handleZhEnd } = useZh()
    const { handleMousedown, handleMousemove, handleMouseup } = useMouse()
    const { handleKeyDown } = useKey()

    return {
      nodes,
      handleKeyDown,
      handleMousedown,
      handleZhStart,
      handleZhEnd,
      handleMousemove: throttle(handleMousemove, 100, { trailing: true }),
      handleMouseup
    }
  }
}
</script>

<style lang="less">
.xm-editor {
  position: relative;
  width: 900px;
  // margin: 0 auto;
  box-shadow: 0 0 5px rgba(0, 0, 0, .3);
  &__content {
    padding: 15px 40px 20px 40px;
    min-height: 810px;
    font-size: 16px;
    line-height: 1.68;
    box-sizing: border-box;
    &:focus {
      outline: none;
    }
  }
  &__line {
    position: absolute;
    left: 0;
    top: 15px;
    font-size: 16px;
    line-height: 1.68;
    background: #f2f2f2;
    padding: 0 5px;
    color: #999;
  }
}
</style>
