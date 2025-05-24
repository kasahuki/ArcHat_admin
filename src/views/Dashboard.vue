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
            <el-avatar :size="32" src="https://via.placeholder.com/32?text=DK"></el-avatar>
            <span class="username">Admin</span>
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
          
          <el-menu-item index="/group" class="menu-item">
            <el-icon><UserFilled /></el-icon>
            <span>群组管理</span>
          </el-menu-item>
          
          <el-sub-menu index="/message" class="menu-item">
            <template #title>
              <el-icon><ChatDotRound /></el-icon>
              <span>消息管理</span>
            </template>
            <el-menu-item index="/message/group">
              <el-icon><ChatLineRound /></el-icon>
              <span>群组消息</span>
            </el-menu-item>
            <el-menu-item index="/message/personal">
              <el-icon><ChatDotSquare /></el-icon>
              <span>个人消息</span>
            </el-menu-item>
          </el-sub-menu>
          
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
import {
  Bell,
  User,
  UserFilled,
  ChatDotRound,
  Setting,
  ArrowDown,
  SwitchButton,
  ChatLineRound,
  ChatDotSquare
} from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';

const route = useRoute();
const router = useRouter();
const activeMenu = computed(() => route.path);

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
      .then(() => {
        // 这里添加退出登录的逻辑
        console.log('用户退出系统');
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
  background-color: #f5f7fa;
}

.pocket-planner {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 顶部导航栏 */
.app-header {
  background: white;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
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
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-profile:hover {
  background-color: #f5f7fa;
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
  background: #f8f9fa;
  border-right: 1px solid #e4e7ed;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
}

.menu-item {
  margin: 4px 12px;
  border-radius: 8px;
}

/* 主内容区 */
.main-content {
  padding: 24px;
  overflow-y: auto;
}

/* 下拉菜单样式 */
.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.el-dropdown-menu__item .el-icon {
  margin-right: 4px;
}
</style>