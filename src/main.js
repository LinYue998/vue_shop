import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './assets/css/reset.css'
import './assets/css/base.css'
import 'default-passive-events'
// 将封装后的axios导入
import service from './assets/js/service.js'
//引入font-awesome的图标样式
import 'font-awesome/css/font-awesome.min.css' 
// 带树网格的vue表
import TreeTable from 'vue-table-with-tree-grid'

// 将其挂载到原型上面
Vue.prototype.service = service;
Vue.config.productionTip = false

// 重命名
Vue.component('tree-table', TreeTable);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
