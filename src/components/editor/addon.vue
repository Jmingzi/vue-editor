<template>
  <div class="xm-editor__addon">
    <div
      class="xm-editor__addon-hover"
      :style="{ top: addonTop + 'px' }"
      @mouseenter="handleMouseOverAddon"
      @mouseleave="handleMouseOutAddon"
    >
      <c-svg :type="isPlaceholder ? 'plus' : 'line'" />
    </div>
    <transition name="xm-editor__zoom">
      <div
        v-if="showPopup"
        class="xm-editor__addon-popup xm-editor__addon-paragraph"
        :style="{ top: addonTop + 25 + 'px' }"
        @mouseenter="handleMouseOverPopup"
        @mouseleave="handleMouseOutPopup"
      >
        <p class="xm-editor__addon-title">样式</p>
        <div class="xm-editor__addon-block">
          <div
            v-for="(item, i) in menus"
            :key="i"
            class="xm-editor__addon-block-menu"
            :class="{
              'xm-editor__addon-block-menu--active': !isPlaceholder &&
                hoverNode &&
                hoverNode.attributes[item.field] === item[item.field]
            }"
            @click="item.action(hoverNode), showPopup = false"
          >
            <c-svg :type="item.icon" />
          </div>
        </div>
        <div v-if="isPlaceholder">
          <p class="xm-editor__addon-title">通用</p>
          <div
            v-for="(item, i) in placeholderMenus"
            :key="i"
            class="xm-editor__addon-line-menu"
            @click="item.action(hoverNode), showPopup = false"
          >
            <c-svg :type="item.icon" :style="{ fill: item.color }" />
            <span>{{ item.label }}</span>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import useAddon, { menus, placeholderMenus } from '../../assets/addon'
import CSvg from '@/components/svg'

export default {
  components: {
    CSvg
  },

  setup (props, ctx) {
    const {
      addonTop,
      showPopup,
      hoverNode,
      isPlaceholder,
      handleMouseOverAddon,
      handleMouseOutAddon,
      handleMouseOverPopup,
      handleMouseOutPopup
    } = useAddon(ctx)
    return {
      addonTop,
      showPopup,
      hoverNode,
      menus,
      placeholderMenus,
      isPlaceholder,
      handleMouseOverAddon,
      handleMouseOutAddon,
      handleMouseOverPopup,
      handleMouseOutPopup
    }
  }
}
</script>

<style lang="less">
.xm-editor__zoom {
  &-enter {
    opacity: 0;
    transform-origin: top left;
    transform: scale3d(0, 0, 0);
  }
  &-leave {
    opacity: 1;
  }
  &-enter-active {
    transition: all .1s;
    opacity: 1;
  }
  &-leave-active {
    transition: all .1s;
    transform-origin: top left;
    transform: scale3d(0.3, 0.3, 0.3);
    opacity: 0;
  }
}
.xm-editor__addon {
  font-size: 14px;
  &-hover {
    position: absolute;
    width: 25px;
    height: 25px;
    border-radius: 25px;
    // background: #ccc;
    left: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }
  &-popup {
    position: absolute;
    width: 180px;
    // min-height: 200px;
    box-shadow: 0 0 5px rgba(0, 0, 0, .3);
    border-radius: 5px;
    left: 10px;
    background: #fff;
    padding: 15px;
    z-index: 9;
  }
  &-paragraph {
  }
  &-block {
    display: flex;
    flex-wrap: wrap;
    margin: 10px 0;
  }
  &-block-menu {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    // border: 1px #ccc solid;
    cursor: pointer;
    border-radius: 4px;
    &:hover {
       background: #eee;
    }
    &--active {
      background: lightblue;
    }
  }
  &-title {
    color: #999;
    padding: 0;
    margin: 0;
  }
  &-line-menu {
    display: flex;
    align-items: center;
    // border-bottom: 1px #eee solid;
    height: 35px;
    color: #646a73;
    cursor: pointer;
    &:first-of-type {
      margin-top: 10px;
    }
    &:hover {
      background: #eee;
    }
    .xm-editor__svg {
      margin-right: 20px;
    }
  }
}
</style>
