<template>
  <el-button
    :type="type"
    :size="size"
    :loading="loading"
    :disabled="disabled"
    class="neumorphic-button"
    v-bind="$attrs"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </el-button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger', 'info', 'green', 'orange'].includes(value)
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  loading: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const buttonClass = computed(() => {
  const baseClass = 'neumorphic-button'
  const typeClass = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
    green: 'green',
    orange: 'orange'
  }[props.type] || 'default'
  return `${baseClass} ${typeClass}`
})

defineEmits(['click'])
</script>

<style scoped>
.neumorphic-button {
  height: 32px;
  padding: 0 16px;
  border-radius: 8px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  position: relative;
  overflow: hidden;
}

.neumorphic-button::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.neumorphic-button:hover::after {
  opacity: 1;
}

/* 默认按钮样式 */
.neumorphic-button {
  background: linear-gradient(145deg, #f0f0f0, #ffffff);
  box-shadow: inset 2px 2px 5px #d9d9d9,
              inset -2px -2px 5px #ffffff;
  color: #333;
}

.neumorphic-button:hover {
  box-shadow: inset 3px 3px 6px #d9d9d9,
              inset -3px -3px 6px #ffffff;
  transform: translateY(-1px);
}

.neumorphic-button:active {
  box-shadow: inset 4px 4px 8px #d9d9d9,
              inset -4px -4px 8px #ffffff;
  transform: translateY(1px);
}

/* 主要按钮样式 */
.neumorphic-button.el-button--primary {
  background: linear-gradient(145deg, #0052a3, #0066cc);
  box-shadow: inset 2px 2px 5px #004d99,
              inset -2px -2px 5px #0077ff;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.neumorphic-button.el-button--primary:hover {
  background: linear-gradient(145deg, #0066cc, #0077ff);
  box-shadow: inset 3px 3px 6px #004d99,
              inset -3px -3px 6px #0077ff;
  transform: translateY(-1px);
}

.neumorphic-button.el-button--primary:active {
  background: linear-gradient(145deg, #004d99, #0052a3);
  box-shadow: inset 4px 4px 8px #004d99,
              inset -4px -4px 8px #0077ff;
  transform: translateY(1px);
}

/* 危险按钮样式 */
.neumorphic-button.el-button--danger {
  background: linear-gradient(145deg, #dc2626, #ef4444);
  box-shadow: inset 2px 2px 5px #b91c1c,
              inset -2px -2px 5px #f87171;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.neumorphic-button.el-button--danger:hover {
  background: linear-gradient(145deg, #ef4444, #f87171);
  box-shadow: inset 3px 3px 6px #b91c1c,
              inset -3px -3px 6px #f87171;
  transform: translateY(-1px);
}

.neumorphic-button.el-button--danger:active {
  background: linear-gradient(145deg, #b91c1c, #dc2626);
  box-shadow: inset 4px 4px 8px #b91c1c,
              inset -4px -4px 8px #f87171;
  transform: translateY(1px);
}

/* 绿色按钮样式 */
.neumorphic-button.el-button--green {
  background: linear-gradient(145deg, #67c23a, #85ce61);
  box-shadow: inset 2px 2px 5px #67c23a,
              inset -2px -2px 5px #85ce61;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.neumorphic-button.el-button--green:hover {
  background: linear-gradient(145deg, #85ce61, #95de73);
  box-shadow: inset 3px 3px 6px #67c23a,
              inset -3px -3px 6px #85ce61;
  transform: translateY(-1px);
}

.neumorphic-button.el-button--green:active {
  background: linear-gradient(145deg, #67c23a, #85ce61);
  box-shadow: inset 4px 4px 8px #67c23a,
              inset -4px -4px 8px #85ce61;
  transform: translateY(1px);
}

/* 禁用状态 */
.neumorphic-button.is-disabled {
  background: #f5f5f5;
  box-shadow: none;
  color: #c0c4cc;
  cursor: not-allowed;
  transform: none;
}

.neumorphic-button.is-disabled::after {
  display: none;
}

/* 加载状态 */
.neumorphic-button.is-loading {
  opacity: 0.8;
  cursor: wait;
}

.neumorphic-button.is-loading::after {
  display: none;
}

/* 小尺寸按钮 */
.neumorphic-button.el-button--small {
  height: 24px;
  padding: 0 12px;
  font-size: 12px;
}

/* 大尺寸按钮 */
.neumorphic-button.el-button--large {
  height: 40px;
  padding: 0 20px;
  font-size: 14px;
}

/* 橙色按钮样式 */
.neumorphic-button.el-button--orange {
  background: linear-gradient(145deg, #e6a23c, #f0b95c);
  box-shadow: inset 2px 2px 5px #e6a23c,
              inset -2px -2px 5px #f0b95c;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.neumorphic-button.el-button--orange:hover {
  background: linear-gradient(145deg, #f0b95c, #f5c97a);
  box-shadow: inset 3px 3px 6px #e6a23c,
              inset -3px -3px 6px #f0b95c;
  transform: translateY(-1px);
}

.neumorphic-button.el-button--orange:active {
  background: linear-gradient(145deg, #e6a23c, #f0b95c);
  box-shadow: inset 4px 4px 8px #e6a23c,
              inset -4px -4px 8px #f0b95c;
  transform: translateY(1px);
}
</style> 