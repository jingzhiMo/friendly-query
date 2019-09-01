import Vue from 'vue'
import Router from 'vue-router'
import base from '@/components/base-usage.vue'

Vue.use(Router)
const routes = [
  {
    path: '/',
    name: 'home',
    redirect: 'foo'
  },
  {
    path: '/base',
    name: 'base',
    component: base
  }
]


export default new Router({
  mode: 'history',
  routes
})
