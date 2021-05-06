<template>
  <div id="app">
    <editor />
    <console />
  </div>
</template>

<script>
import Editor from '@/components/editor'
import Console from '@/components/console'

export default {
  components: {
    Editor,
    Console
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
