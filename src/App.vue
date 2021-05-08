<template>
  <div id="app">
    <editor />
    <console />
    <c-svg v-if="false" type="table" />
  </div>
</template>

<script>
import Editor from '@/components/editor'
import Console from '@/components/console'
import CSvg from '@/components/svg'

export default {
  components: {
    Editor,
    Console,
    CSvg
  },

  created () {
    // console.log('debug', this)
  }
}
</script>

<style lang="less">
#app {
  display: flex;
}
body {
  padding: 0;
  margin: 0;
}
* {
  box-sizing: border-box;
}
</style>
