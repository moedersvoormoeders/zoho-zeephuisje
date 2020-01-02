import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Simplert from 'vue2-simplert-plugin'

import '@fortawesome/fontawesome-pro/css/all.css'
import '@fortawesome/fontawesome-pro/js/all.js'

require('vue2-simplert-plugin/dist/vue2-simplert-plugin.css')

Vue.use(Simplert)
Vue.config.productionTip = false

Vue.directive('focus', {
  inserted: function (el) {
      el.focus()
  }
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
