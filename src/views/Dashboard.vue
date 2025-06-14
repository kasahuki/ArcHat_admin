<template>
  <div class="pocket-planner">
    <!-- 顶部导航栏 -->
    <el-header class="app-header">
      <div class="header-left">
        <h2><img src="/src/assets/archat.png" alt="" width="50px"></h2>
        <h1 class="app-title">ArcHat</h1>
       
      </div>
      <div class="header-right">
        <el-badge :value="1" class="notification-badge">
          <el-button circle>
            <el-icon><Bell /></el-icon>
          </el-button>
        </el-badge>
        <el-dropdown @command="handleCommand">
          <div class="user-profile">
            <el-avatar :size="32" :src="userInfo.avatar"></el-avatar>
            <span class="username">{{ userInfo.username }}</span>
            <el-icon class="el-icon--right"><arrow-down /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="settings">
                <el-icon><Setting /></el-icon>
                系统设置
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出系统
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </el-header>

    <el-container class="main-container">
      <!-- 左侧导航栏 -->
      <el-aside width="240px" class="sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
        >
          <el-menu-item index="/user" class="menu-item">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          
          <el-menu-item index="/friendship" class="menu-item">
            <el-icon><Connection /></el-icon>
            <span>好友关系管理</span>
          </el-menu-item>
          
          <el-sub-menu index="/conversation" class="menu-item">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>会话管理</span>
            </template>
            <el-menu-item index="/conversation/group">
              <el-icon><ChatLineRound /></el-icon>
              <span>群聊会话</span>
            </el-menu-item>
            <el-menu-item index="/conversation/private">
              <el-icon><ChatDotSquare /></el-icon>
              <span>私聊会话</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/message" class="menu-item">
            <el-icon><Message /></el-icon>
            <span>消息管理</span>
          </el-menu-item>
          
          <el-menu-item index="/settings" class="menu-item">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserInfoStore } from '@/stores/user' 
import {
  Bell,
  User,
  UserFilled,
  ChatDotRound,
  Setting,
  ArrowDown,
  SwitchButton,
  ChatLineRound,
  ChatDotSquare,
  Connection,
  Message
} from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

import { logoutService } from '@/api/user';

const route = useRoute();
const router = useRouter();
const activeMenu = computed(() => route.path);
const userInfoStore = useUserInfoStore();
const userInfo = computed(() => userInfoStore.userInfo);

// 获取当前日期
const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'settings') {
    router.push('/settings');
  } else if (command === 'logout') {
    ElMessageBox.confirm(
      '确定要退出系统吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
      .then(async () => {
        // 清除用户登录状态
        
        const token = userInfoStore.userInfo.token
        let res = await logoutService(token);

        userInfoStore.removeUserInfo()
        // 跳转到登录页面
        router.push('/login');
      })
      .catch(() => {
        // 取消退出
      });
  }
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #d8d7d76c;

  background-size: cover;
  background-attachment: fixed;
  transition: all 0.3s ease;
}

.pocket-planner {
  height: 100vh;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* 顶部导航栏 */
.app-header {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-bottom: 2px solid rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.app-title {
  font-size: 32px;
  font-weight: 600;
  background: linear-gradient(45deg, #7F7FD5, #163672, #35404b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  transition: all 0.3s ease;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.current-date {
  color: #909399;
  font-size: 14px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 16px;
  border-radius: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.user-profile:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.1);
}

.username {
  font-size: 14px;
  color: #303133;
}

/* 主容器 */
.main-container {
  flex: 1;
  overflow: hidden;
}

/* 侧边栏 */
.sidebar {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-right: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: inset 2px 0 4px rgba(255, 255, 255, 0.5),
              inset -2px 0 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 16px;
}

.menu-item {
  margin: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.menu-item:hover {
  background: rgba(127, 127, 213, 0.15);
  transform: translateX(4px);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(45deg, #7F7FD5, #86A8E7, #91EAE4);
  color: white;
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.3),
              inset 0 -2px 4px rgba(0, 0, 0, 0.2);
  transform: translateX(4px);
}

:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: white;
  border-radius: 0 4px 4px 0;
}

:deep(.el-sub-menu__title:hover) {
  background: rgba(127, 127, 213, 0.15);
  transform: translateX(4px);
}

:deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: #7F7FD5;
  font-weight: 600;
}

/* 通知按钮 */
.notification-badge :deep(.el-button) {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.4);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1);
}

.notification-badge :deep(.el-button:hover) {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1),
              0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 下拉菜单样式 */
:deep(.el-dropdown-menu) {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.5),
              inset 0 -2px 4px rgba(0, 0, 0, 0.1),
              0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 8px;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 8px;
  margin: 2px 0;
}

:deep(.el-dropdown-menu__item:hover) {
  background: rgba(127, 127, 213, 0.15);
  color: #7F7FD5;
  transform: translateX(4px);
}


</style>