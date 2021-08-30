import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
import './css/base.css'
import axios from 'axios'
import * as echarts from 'echarts';
import UmyUi from 'umy-ui';
import 'umy-ui/lib/theme-chalk/index.css'; // 引入样式

Vue.use(UmyUi);
Vue.prototype.$echarts = echarts

axios.defaults.baseURL = 'http://127.0.0.1:85/'
Vue.prototype.$http = axios
Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')

Vue.prototype.openLoading = function() {
    const loading = this.$loading({ // 声明一个loading对象
            lock: true, // 是否锁屏
            text: '正在加载...', // 加载动画的文字
            spinner: 'el-icon-loading', // 引入的loading图标
            background: '#4A4A4A', // 背景颜色
            target: '.main', // 需要遮罩的区域
            body: true,
            customClass: 'mask' // 遮罩层新增类名
        })
        // setTimeout(function() { // 设定定时器，超时5S后自动关闭遮罩层，避免请求失败时，遮罩层一直存在的问题
        //     loading.close(); // 关闭遮罩层
        // }, 5000)
    return loading;
}