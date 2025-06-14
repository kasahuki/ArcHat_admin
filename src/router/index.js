import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import User from '../views/User.vue'
import Message from '../views/Message.vue'
import Settings from '../views/Settings.vue'
import Login from '@/views/Login.vue'
import Friendship from '../views/Friendship.vue'
import GroupConversation from '../views/conversation/GroupConversation.vue'
import PrivateConversation from '../views/conversation/PrivateConversation.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Dashboard,
      children: [
        {
          path: 'user',
          name: 'user',
          component: User
        },
        {
          path: 'friendship',
          name: 'friendship',
          component: Friendship
        },
        {
          path: 'conversation',
          name: 'conversation',
          children: [
            {
              path: 'group',
              name: 'group-conversation',
              component: GroupConversation
            },
            {
              path: 'private',
              name: 'private-conversation',
              component: PrivateConversation
            }
          ]
        },
        {
          path: 'message',
          name: 'message',
          component: Message
        },
        {
          path: 'settings',
          name: 'settings',
          component: Settings
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    // 404页面
    {
      path: '/:pathMatch(.*)*',
      component: () => import('@/views/404NotFound.vue')
    }
  ]
})

export default router