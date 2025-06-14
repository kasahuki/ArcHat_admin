<template>
  <div class="neumorphic-background">
    <slot></slot>
  </div>
</template>

<script setup>
// No script needed for this component
</script>

<style scoped>
.neumorphic-background {
  /* 玻璃拟态风格 */
  background: rgba(255, 255, 255, 0.7); /* 半透明白色背景 */
  backdrop-filter: blur(10px); /* 背景模糊效果 */
  -webkit-backdrop-filter: blur(10px); /* Safari 支持 */
  border: 1px solid rgba(255, 255, 255, 0.3); /* 细微的边框 */
  border-radius: 12px;
  box-shadow: 
    0 4px 6px rgba(0, 0, 0, 0.05),
    0 1px 3px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  padding: 12px;
  transition: all 0.3s ease;
}

/* 悬停效果 */
.neumorphic-background:hover {
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 
    0 8px 12px rgba(0, 0, 0, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* 点击效果 */
.neumorphic-background:active {
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  transform: translateY(0);
}
</style> 