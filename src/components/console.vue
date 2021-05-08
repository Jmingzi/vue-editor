<template>
  <div class="console">
    <p>cursor: id {{ id }} / piece {{ piece }} / startOffset {{ startOffset }}</p>
    <p v-if="false">currentNode: </p>
    <pre v-if="false" style="font-size: 12px;background: #f2f2f2;padding: 10px">{{ str(currentNode) }}</pre>
    <p>nodes:</p>
    <pre
      v-for="(item, i) in nodes"
      :key="i"
      :style="{
        border: item.id === currentNode.id ? '1px red solid' : '',
        background: item.id === currentNode.id ? '#FFCCCC' : '#f2f2f2'
      }"
      style="font-size: 12px;padding: 10px"
    >(节点{{ i + 1 }}): {{ str(item) }}</pre>
  </div>
</template>

<script>
import useNodes from '@/assets/node'
import useCursor from '@/assets/cursor'

export default {
  setup () {
    const { nodes, currentNode } = useNodes()
    const { piece, startOffset, id } = useCursor()
    return {
      nodes,
      currentNode,
      piece,
      startOffset,
      id,
      str (obj) {
        return JSON.stringify(obj, null, 2)
      }
    }
  }
}
</script>

<style lang="less">
.console {
  height: 100vh;
  overflow: auto;
  // position: absolute;
  // bottom: 0;
  // width: 1000px;
  // margin: 0 auto;
  flex-grow: 1;
  padding: 20px 20px 100px 20px;
  // left: 50%;
  // margin-left: -50%;
  // transform: translateX(-50%);
  font-size: 14px;
}
</style>
