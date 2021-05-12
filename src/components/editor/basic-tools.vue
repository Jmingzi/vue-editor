<template>
  <div
    v-if="show"
    class="basic-tools"
    ref="self"
    :style="{
      left: position.left + 'px',
      top: position.top + 'px'
    }"
  >
    <div
      v-for="(item, i) in tools"
      :key="i"
      class="basic-tools__item"
      :class="{
        active: checkToolActive(item)
      }"
      @click="item.action()"
    >
      <c-svg :type="item.icon" />
    </div>
  </div>
</template>

<script>
import { ref, watchEffect, reactive, nextTick, onMounted } from '@vue/composition-api'
import useRange from '@/assets/range'
import useNodes from '@/assets/node'
import CSvg from '../svg'

export default {
  components: {
    CSvg
  },

  setup (props, ctx) {
    const show = ref(false)
    const state = reactive({
      rect: null
    })
    const position = reactive({
      top: -1000,
      left: -1000
    })
    const { currentRange, rangeWidth, startX, endX, rangeDir, nodeId, startPiece, endPiece } = useRange()
    const { nodes } = useNodes()
    async function selectRangePiece (index, start, end) {
      // 重新选中
      await nextTick()
      const selection = window.getSelection()
      selection.removeAllRanges()
      const range = document.createRange()
      const nodeEl = document.getElementById(nodeId.value)
      const pieceEl = nodeEl.childNodes[index].childNodes[0]
      // range.selectNodeContents(pieceEl)
      range.setStart(pieceEl, start)
      range.setEnd(pieceEl, end)
      currentRange.value = range
      selection.addRange(range)
    }
    function commonAction (checkActionFn, doActionFn) {
      const { startOffset, endOffset } = currentRange.value
      const node = nodes.value.find(x => x.id === nodeId.value)
      if (startPiece.value === endPiece.value) {
        const pieceIndex = startPiece.value
        let newPieceIndex = pieceIndex
        console.log('同 piece 选中', startOffset, endOffset)
        const currentPiece = node.content[pieceIndex]
        const { value } = currentPiece
        if (checkActionFn(currentPiece)) {
          console.log('取消操作')
          currentPiece.value = value.substr(startOffset, endOffset)
          let existPri
          let existNext
          let mergeStartOffset = 0
          // let mergeEndOffset = value.length
          if (pieceIndex > 0) {
            // 合并前一项
            existPri = true
            const pri = node.content[pieceIndex - 1]
            if (!checkActionFn(pri)) {
              newPieceIndex -= 1
              mergeStartOffset = pri.value.length
              currentPiece.value = pri.value + currentPiece.value
            }
          }
          if (pieceIndex < node.content.length - 1) {
            // 合并后一项
            existNext = true
            const next = node.content[pieceIndex + 1]
            if (!checkActionFn(next)) {
              currentPiece.value = currentPiece.value + next.value
            }
          }
          // 删除前后
          if (existPri) {
            node.content.splice(pieceIndex - 1, 1)
            if (existNext) {
              node.content.splice(pieceIndex, 1)
            }
          } else if (existNext) {
            node.content.splice(pieceIndex + 1, 1)
          }
          doActionFn(currentPiece, true)
          if (startOffset > 0) {
            const item = doActionFn({ ...currentPiece, value: value.substring(0, startOffset) })
            if (pieceIndex === 0) {
              node.content.unshift(item)
            } else {
              node.content.splice(pieceIndex - 1, 0, item)
            }
          }
          if (endOffset < value.length) {
            const item = doActionFn({ ...currentPiece, value: value.substr(endOffset) })
            node.content.splice(pieceIndex, 0, item)
          }
          console.log('newPieceIndex', newPieceIndex)
          startPiece.value = endPiece.value = newPieceIndex
          selectRangePiece(newPieceIndex, mergeStartOffset, mergeStartOffset + currentRange.value.toString().length)
        } else {
          // 同一个文本拆分
          const left = value.substring(0, startOffset)
          const center = value.substring(startOffset, endOffset)
          const right = value.substring(endOffset)
          // console.log(left, center, right)
          // 删除原 content，插入选中文本
          node.content.splice(pieceIndex, 1)
          if (right.length) {
            node.content.splice(pieceIndex, 0, { value: right })
          }
          node.content.splice(pieceIndex, 0, doActionFn({ value: center }))
          if (left.length) {
            newPieceIndex += 1
            node.content.splice(pieceIndex, 0, { value: left })
          }
          startPiece.value = endPiece.value = newPieceIndex
          selectRangePiece(newPieceIndex, 0, center.length)
        }
      } else {
        // 跨 piece 选中
        // console.log(startPiece.value, endPiece.value)
        console.log('跨 piece 选中', startOffset, endOffset)
        if (
          node.content.some((x, i) =>
            i >= startPiece.value &&
            i <= endPiece.value &&
            checkActionFn(x)
          )
        ) {
          // 选中的 piece 都做 action 操作
          // todo 将选中的 piece 中连续的相同的 action 合并
          const selectedRanges = node.content.splice(startPiece.value, endPiece.value - startPiece.value + 1)
          // console.log('选中的 piece', selectedRanges.length)
          const mergeRanges = []
          let mergeItem
          selectedRanges.forEach((x, i) => {
            if (i === startPiece.value) {
              if (startOffset > 0 && !checkActionFn(x)) {
                mergeRanges.push({ value: x.value.substr(0, startOffset) })
                mergeItem = { value: x.value.substr(startOffset) }
              } else {
                mergeItem = { value: x.value }
              }
              mergeRanges.push(doActionFn(mergeItem))
            } else if (i < endPiece.value) {
              mergeItem.value += x.value
            }
            if (i === endPiece.value) {
              if (endOffset < x.value.length && !checkActionFn(x)) {
                mergeItem.value += x.value.substr(0, endOffset)
                mergeRanges.push({ value: x.value.substr(endOffset) })
              } else {
                mergeItem.value += x.value
              }
            }
          })
          mergeRanges.reverse().forEach(item => {
            node.content.splice(startPiece.value, 0, item)
          })
          // node.content.splice(startPiece.value, 0, doActionFn(mergeItem))
          startPiece.value = endPiece.value
          selectRangePiece(endPiece.value, 0, currentRange.value.toString().length)
        }
      }
    }
    const tools = [
      {
        label: '颜色',
        icon: 'color',
        action: () => {}
      },
      {
        label: '',
        icon: 'bold',
        action: () => {}
      },
      {
        label: '划线',
        icon: 'line-through',
        field: 'lineThrough',
        action () {
          commonAction(
            content => content.lineThrough,
            (obj, reverse) => {
              obj.lineThrough = !reverse
              return obj
            }
          )
        }
      }
    ]

    function checkToolActive (tool) {
      // const { item: existItem } = getCrossRangeItem()
      // return existItem && existItem[tool.field]
      return false
    }

    watchEffect(() => {
      show.value = !!currentRange.value
      if (currentRange.value && state.rect) {
        // 根据 span 的宽度和选中文本的位置确定位置
        const { offsetTop, offsetHeight } = document.getElementById(nodeId.value)
        position.top = offsetTop + offsetHeight + 10
        position.left = (rangeDir.value === 'leftRight' ? startX.value : endX.value) + rangeWidth.value / 2 - (state.rect.width / 2)
      }
    })

    onMounted(() => {
      state.rect = ctx.refs.self.getBoundingClientRect()
    })

    return {
      show,
      position,
      tools,
      currentRange,
      checkToolActive
    }
  }
}
</script>

<style lang="less">
.basic-tools {
  display: flex;
  position: fixed;
  // width: 200px;
  height: 40px;
  box-shadow: 0 0 5px rgba(0, 0, 0, .3);
  background: #fff;
  border-radius: 6px;
  padding: 0 10px;
  &__item {
    display: flex;
    // width: 40px;
    justify-content: center;
    align-items: center;
    // border-right: 1px #ccc solid;
    .xm-editor__svg {
      cursor: pointer;
      border-radius: 6px;
      &:hover {
        background: #eee;
      }
    }
    &.active {
      // background: lightblue;
    }
  }
}
</style>
