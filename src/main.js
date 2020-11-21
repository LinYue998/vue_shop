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
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 将其挂载到原型上面
Vue.prototype.service = service;
Vue.config.productionTip = false

// 重命名
Vue.component('tree-table', TreeTable);

// 定义一个格式化时间的过滤器
Vue.filter('dateFormat', function(originVal){
  const dt = new Date(originVal * 1000);

  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + '').padStart(2, '0');
  const d = (dt.getDate() + '').padStart(2, '0');

  const hh = (dt.getHours() + '').padStart(2, '0');
  const mm = (dt.getMinutes() + '').padStart(2, '0');
  const ss = (dt.getSeconds() + '').padStart(2, '0');

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
});

// 将富文本编辑器，注册为全局可用的组件
Vue.use(VueQuillEditor);

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
