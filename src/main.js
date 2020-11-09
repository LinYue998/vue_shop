import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/reset.css'
import './assets/css/base.css'
// 将封装后的axios导入
import service from './assets/js/service.js'
//引入font-awesome的图标样式
import 'font-awesome/css/font-awesome.min.css' 

// 将其挂载到原型上面
Vue.prototype.service = service;
Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
