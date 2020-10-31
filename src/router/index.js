import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    // 路由重定向
    {
      path: '/',
      redirect :'/login'
    },
    {
      path: '/login',
      component: Login,
    },
    {
      path: '/home',
      component: Home
    }
  ],
  mode:'history'
});

// 挂载路由守卫-- 全局
router.beforeEach((to, from, next) => {
  if(to.path === '/login') return next();
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token');
  if(!tokenStr) return next('/login')
  next()
})

export default router