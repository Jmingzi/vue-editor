<template>
  <div
    class="xm-editor__item-paragraph"
    :style="{
      textAlign: data.attributes.align
    }"
    :class="{
      h1: data.attributes.tag === 'h1',
      h2: data.attributes.tag === 'h2',
      h3: data.attributes.tag === 'h3',
      editing: data.editing
    }"
  >
    <span
      v-for="(item, i) in data.content"
      :key="i + getTs()"
      :style="{
        textDecoration: item.lineThrough && 'line-through'
      }"
      :data-piece="i"
    >{{ item.value || '&#8203;' }}</span>
  </div>
</template>

<script>
// import { computed } from '@vue/composition-api'

export default {
  name: 'paragraph',

  props: {
    data: Object
  },

  setup (props, ctx) {
    return {
      // contents
      getTs () {
        return Date.now()
      }
    }
  }
}
</script>

<style lang="less">
.xm-editor__item-paragraph {
  //overflow: hidden;
  &.h1 {
    font-size: 36px;
    font-weight: 500;
  }
  &.h2 {
    font-size: 32px;
    font-weight: 500;
  }
  &.h3 {
    font-size: 28px;
    font-weight: 500;
  }
  &.editing {
    background: antiquewhite;
  }
}
</style>
