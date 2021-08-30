import Vue from 'vue'
import VueRouter from 'vue-router'
import Diagram from '../components/Diagram.vue'

Vue.use(VueRouter)

const routes = [{
        path: '/',
        redirect: '/Diagram'
    },
    {
        path: '/Diagram',
        component: Diagram
    }
]

const router = new VueRouter({
    routes
})

export default router