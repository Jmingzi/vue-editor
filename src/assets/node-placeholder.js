// import VueCompositionAPI, { nextTick, reactive, toRefs } from '@vue/composition-api'
// import Vue from 'vue'
// Vue.use(VueCompositionAPI)
import { getUniId } from './utils'
import { TYPE_PLACEHOLDER } from './constants'

export function getNode () {
  return {
    id: getUniId(),
    type: TYPE_PLACEHOLDER
  }
}

export function isPlaceholder (type) {
  return type === TYPE_PLACEHOLDER
}
