<template>
  <div class="form-container">
    <!-- 视频背景 -->
    <div class="video-background">
      <video autoplay loop muted playsinline>
        <source src="/src/assets/shm.mp4" type="video/mp4">
      </video>
    </div>
    
    <!-- 添加 logo -->
    <div class="logo">
      <img src="/src/assets/archat.png" alt="ARCHAT" />
    </div>
    
    <div class="form-wrapper" :class="{ 'show-register': showRegister }">
      <!-- 碎玻璃效果 -->
      <div class="glass-crack"></div>
      <div class="glass-shard"></div>
      
      <!-- Left Panel (Welcome/Register) -->
      <div class="panel welcome-panel" :class="{ 'panel-right': showRegister }">
        <div class="panel-content">
          <h1 class="welcome-title">{{ showRegister ? 'Welcome Back!' : 'Hello, Welcome!' }}</h1>
          <p class="welcome-text">{{ showRegister ? 'Already have an account?' : 'Don\'t have an account?' }}</p>
          <el-button class="action-button" @click="toggleForm">
            {{ showRegister ? 'Login' : 'Register' }}
          </el-button>
        </div>
      </div>

      <!-- Right Panel (Login Form) -->
      <div class="panel form-panel" :class="{ 'panel-left': showRegister }">
        <div class="panel-content">
          <h2 class="form-title">{{ showRegister ? 'Register' : 'Login' }}</h2>

          <!-- Login Form -->
          <div v-if="!showRegister" class="form">
            <el-form :model="loginForm" ref="loginFormRef" :rules="loginRules">
              <el-form-item prop="username">
                <el-input v-model="loginForm.username" placeholder="Username" :prefix-icon="User" />
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="loginForm.password" type="password" placeholder="Password" :prefix-icon="Lock" />
              </el-form-item>

              <div class="forgot-password">
                <a href="#">Forgot password?</a>
              </div>

              <el-button type="primary" class="submit-button" @click="handleLogin">
                Login
              </el-button>
            </el-form>
          </div>

          <!-- Register Form -->
          <div v-else class="form">
            <el-form :model="registerForm" ref="registerFormRef" :rules="registerRules">
              <el-form-item prop="userName">
                <el-input v-model="registerForm.username" placeholder="userName" :prefix-icon="User" />
              </el-form-item>

              <el-form-item prop="password">
                <el-input v-model="registerForm.password" type="password" placeholder="Password" :prefix-icon="Lock" />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input v-model="registerForm.confirmPassword" type="password" placeholder="Confirm Password"
                  :prefix-icon="Lock" />
              </el-form-item>

              <el-button type="primary" class="submit-button" @click="handleRegister">
                Register
              </el-button>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { userRegisterService, userLoginService } from '@/api/user'
import { useRouter } from 'vue-router'
import { useUserInfoStore } from '@/stores/user'
import clickSound from '@/assets/click.m4a'
import toggleSound from '@/assets/toggle.m4a'

// State
const router = useRouter()
const showRegister = ref(false)
const userInfoStore = useUserInfoStore()

// Form data
const loginForm = reactive({
  username: '',
  password: ''
})
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

// Form refs
const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 20, message: '用户名长度为5-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 20, message: '用户名长度为5-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 创建音频对象
const audio = new Audio(clickSound)
const toggleAudio = new Audio(toggleSound)

// 播放音效的函数
const playClickSound = () => {
  audio.currentTime = 0
  audio.play().catch(error => {
    console.error('播放音效失败:', error)
  })
}
const playToggleSound = () => {
  toggleAudio.currentTime = 0
  toggleAudio.play().catch(error => {
    console.error('播放音效失败:', error)
  })
}
// 在组件挂载时预加载音频
onMounted(() => {
  audio.load()
  toggleAudio.load()
})

// Methods
const toggleForm = () => {
  playToggleSound() 
  showRegister.value = !showRegister.value
}

const handleLogin = async () => {
  playClickSound() // 播放点击音效
  if (!loginFormRef.value) return
  try {
    await loginFormRef.value.validate()
    const res = await userLoginService(loginForm)
    if (res.code === 200) {
      userInfoStore.setUserInfo(res.data)// username Avatar 经验值 token
      ElMessage.success('登录成功！')
      router.push('/user')
    } else {
      ElMessage.error(res.msg || '登录失败')
    }
  } catch (error) {
    console.error('登录失败:', error)
    ElMessage.error('登录失败，请检查输入')
  }
}

const handleRegister = async () => {
  playClickSound() // 播放点击音效
  if (!registerFormRef.value) return
  

    await registerFormRef.value.validate()
    const res = await userRegisterService(registerForm)
    ElMessage.success('注册成功！')
    // 注册成功后切换到登录界面
    showRegister.value = false
}
</script>

<style scoped>
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif;
  position: relative;
  overflow: hidden;
}

.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.video-background video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%);
  object-fit: cover;
}

.logo {
  position: absolute;
  top: 40px;
  left: 40px;
  z-index: 10;
  transition: all 0.3s ease;
}

.logo img {
  height: 60px;
  width: auto;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.15));
  transition: all 0.3s ease;
}

.logo:hover img {
  transform: scale(1.05);
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2));
}

.form-wrapper {
  position: relative;
  width: 1000px;
  height: 600px;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.1);
  position: relative;
}

.form-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%),
    linear-gradient(90deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%),
    linear-gradient(0deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 1;
}

.glass-crack {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 45%, rgba(255, 255, 255, 0.4) 50%, transparent 55%),
    linear-gradient(-45deg, transparent 45%, rgba(255, 255, 255, 0.4) 50%, transparent 55%),
    linear-gradient(90deg, transparent 45%, rgba(255, 255, 255, 0.4) 50%, transparent 55%),
    linear-gradient(0deg, transparent 45%, rgba(255, 255, 255, 0.4) 50%, transparent 55%);
  background-size: 50px 50px;
  opacity: 0.3;
  pointer-events: none;
  z-index: 2;
  transform: rotate(5deg);
}

.glass-crack::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.4) 0%, transparent 50%);
  opacity: 0.3;
}

.glass-shard {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%),
    linear-gradient(225deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%);
  clip-path: polygon(
    0% 0%, 100% 0%, 100% 100%, 0% 100%,
    10% 10%, 90% 10%, 90% 90%, 10% 90%,
    20% 20%, 80% 20%, 80% 80%, 20% 80%,
    30% 30%, 70% 30%, 70% 70%, 30% 70%
  );
  opacity: 0.4;
  pointer-events: none;
  z-index: 3;
  transform: rotate(-3deg);
}

.glass-shard::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%),
    linear-gradient(-45deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
  opacity: 0.3;
}

.panel {
  position: relative;
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
  overflow: hidden;
}

.welcome-panel {
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.3), rgba(0, 102, 204, 0.3));
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  border-top-left-radius: 24px;
  border-bottom-left-radius: 24px;
  transform: translateX(0);
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
}

.welcome-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%);
  background-size: 15px 15px;
  opacity: 0.3;
  pointer-events: none;
}

.form-panel {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top-right-radius: 24px;
  border-bottom-right-radius: 24px;
  transform: translateX(0);
  border-left: 1px solid rgba(255, 255, 255, 0.15);
  position: relative;
}

.form-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%);
  background-size: 15px 15px;
  opacity: 0.3;
  pointer-events: none;
}

.panel-content {
  padding: 40px;
  width: 100%;
  max-width: 400px;
  text-align: center;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 2.8rem;
  margin-bottom: 20px;
  font-weight: 600;
  letter-spacing: -0.5px;
  background: linear-gradient(45deg, #8B0000, #4A0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.3),
    -1px -1px 0 rgba(139, 0, 0, 0.3);
}

.welcome-text {
  margin-bottom: 40px;
  font-size: 1.1rem;
  background: linear-gradient(45deg, #A52A2A, #4A0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 400;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.form-title {
  font-size: 2.2rem;
  margin-bottom: 40px;
  font-weight: 600;
  letter-spacing: -0.5px;
  background: linear-gradient(45deg, #8B0000, #4A0000);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 
    2px 2px 4px rgba(0, 0, 0, 0.3),
    -1px -1px 0 rgba(139, 0, 0, 0.3);
  position: relative;
}

.form-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, 
    transparent 0%,
    rgba(255, 255, 255, 0.4) 50%,
    transparent 100%
  );
}

.action-button {
  background: linear-gradient(45deg, rgba(139, 0, 0, 0.8), rgba(74, 0, 0, 0.8));
  border: 1px solid rgba(139, 0, 0, 0.3);
  color: #fff;
  padding: 12px 48px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 45%, rgba(139, 0, 0, 0.2) 50%, transparent 55%),
    linear-gradient(-45deg, transparent 45%, rgba(139, 0, 0, 0.2) 50%, transparent 55%);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

.action-button:hover {
  background: linear-gradient(45deg, rgba(139, 0, 0, 0.9), rgba(74, 0, 0, 0.9));
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 0, 0, 0.15);
}

.action-button:hover::before {
  opacity: 0.7;
}

:deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 8px 16px;
  box-shadow: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
}

:deep(.el-input__wrapper::before) {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%),
    linear-gradient(-45deg, transparent 48%, rgba(255, 255, 255, 0.3) 50%, transparent 52%);
  background-size: 8px 8px;
  opacity: 0.3;
  pointer-events: none;
}

:deep(.el-input__wrapper:hover) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1);
}

:deep(.el-input__inner) {
  background: linear-gradient(45deg, #050505, #f5b20a);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 1rem;
  height: 24px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

:deep(.el-input__inner::placeholder) {
  background: linear-gradient(45deg, #797979, #CD853F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  opacity: 0.8;
}

:deep(.el-input__prefix-inner) {
  background: linear-gradient(45deg, #B8860B, #DAA520);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.forgot-password {
  text-align: right;
  margin: 16px 0 24px;
}

.forgot-password a {
  background: linear-gradient(45deg, #B8860B, #DAA520);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
}

.forgot-password a:hover {
  background: linear-gradient(45deg, #DAA520, #B8860B);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(45deg, rgba(139, 0, 0, 0.8), rgba(74, 0, 0, 0.8));
  border: 1px solid rgba(139, 0, 0, 0.3);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  margin-top: 20px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  position: relative;
  overflow: hidden;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  border-radius: 30px;
}

.submit-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    linear-gradient(45deg, transparent 45%, rgba(139, 0, 0, 0.2) 50%, transparent 55%),
    linear-gradient(-45deg, transparent 45%, rgba(139, 0, 0, 0.2) 50%, transparent 55%);
  background-size: 20px 20px;
  opacity: 0.5;
  pointer-events: none;
}

.submit-button:hover {
  background: linear-gradient(45deg, rgba(139, 0, 0, 0.9), rgba(74, 0, 0, 0.9));
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(139, 0, 0, 0.15);
}

.submit-button:hover::before {
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .form-wrapper {
    width: 95%;
    height: auto;
    flex-direction: column;
    margin: 20px;
  }

  .panel {
    width: 100%;
    height: auto;
    min-height: 400px;
  }

  .welcome-panel {
    border-radius: 24px 24px 0 0;
    padding: 40px 0;
  }

  .form-panel {
    border-radius: 0 0 24px 24px;
    padding: 40px 0;
  }

  .logo {
    top: 20px;
    left: 20px;
  }
  
  .logo img {
    height: 40px;
  }
}
</style>