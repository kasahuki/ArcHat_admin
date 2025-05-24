import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import User from '../views/User.vue'
import Group from '../views/Group.vue'
import Message from '../views/Message.vue'
import GroupMessage from '../views/message/GroupMessage.vue'
import PersonalMessage from '../views/message/PersonalMessage.vue'
import Settings from '../views/Settings.vue'

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
          path: 'group',
          name: 'group',
          component: Group
        },
        {
          path: 'message',
          name: 'message',
          component: Message,
          children: [
            {
              path: 'group',
              name: 'group-message',
              component: GroupMessage
            },
            {
              path: 'personal',
              name: 'personal-message',
              component: PersonalMessage
            }
          ]
        },
        {
          path: 'settings',
          name: 'settings',
          component: Settings
        }
      ]
    }
  ]
})

export default router