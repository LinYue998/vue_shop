import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/components/Login.vue'
import Home from '@/components/Home.vue'
import Welcome from '@/components/Welcome.vue'
import Users from '@/components/user/Users.vue'
import Rights from '@/components/pover/Rights.vue'
import Roles from '@/components/pover/Roles.vue'
import Categories from '@/components/goods/Categories.vue'
import Params from '@/components/goods/Params.vue'
import GoodsList from '@/components/goods/List.vue'
import Add from '@/components/goods/Add.vue'
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
      component: Home,
      redirect: '/home/welcome',
      children:[
        {
          path: '/home/welcome',
          component: Welcome,
        },
        {
          path: '/home/users',
          component: Users,
        },
        {
          path: '/home/rights',
          component: Rights,
        },
        {
          path: '/home/roles',
          component: Roles,
        },
        {
          path: '/home/categories',
          component: Categories,
        },
        {
          path: '/home/params',
          component: Params,
        },
       {
          path: '/home/goods',
          component: GoodsList,
        },
        {
          path: '/home/goods/add',
          component: Add,
        },
      ]
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
