// 将axios进行二次封装
import axios from 'axios'

let service = axios.create({
    //baseURL会自动加载接口地址上
    baseURL: 'http://127.0.0.1:8888/api/private/v1/',
    
});

// 添加拦截器,需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌,保证有获得数据的权限
service.interceptors.request.use( config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    // console.log(config);
    // 最后必须返回return
    return config
})

// 导出
export default service