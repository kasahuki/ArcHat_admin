<template>
  <div class="animated-background">
    <canvas ref="canvas" class="particles"></canvas>
    <div class="gradient-overlay"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref(null);
let animationFrameId = null;
let particles = [];
let mouse = { x: 0, y: 0 };

// 将 resizeCanvas 函数移到外部
const resizeCanvas = () => {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
  }
};

const initParticles = () => {
  const ctx = canvas.value.getContext('2d');

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  resizeCanvas();

  // 创建粒子
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * canvas.value.width,
      y: Math.random() * canvas.value.height,
      size: Math.random() * 3 + 1,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
      color: `rgba(102, 152, 255, ${Math.random() * 0.5 + 0.2})`,
      originalSize: Math.random() * 3 + 1,
      pulseSpeed: Math.random() * 0.02 + 0.01,
      pulseOffset: Math.random() * Math.PI * 2
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);
    
    // 更新和绘制粒子
    particles.forEach(particle => {
      // 粒子大小脉冲效果
      particle.size = particle.originalSize + Math.sin(Date.now() * particle.pulseSpeed + particle.pulseOffset) * 0.5;

      // 更新位置
      particle.x += particle.speedX;
      particle.y += particle.speedY;

      // 边界检查
      if (particle.x < 0 || particle.x > canvas.value.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.value.height) particle.speedY *= -1;

      // 鼠标交互
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        const force = (100 - distance) / 100;
        particle.x -= Math.cos(angle) * force * 2;
        particle.y -= Math.sin(angle) * force * 2;
      }

      // 绘制粒子
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      // 绘制发光效果
      const gradient = ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, particle.size * 2
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(1, 'rgba(102, 152, 255, 0)');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // 绘制连接线
      particles.forEach(otherParticle => {
        const dx = particle.x - otherParticle.x;
        const dy = particle.y - otherParticle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const opacity = 0.2 * (1 - distance / 100);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(102, 152, 255, ${opacity})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(otherParticle.x, otherParticle.y);
          ctx.stroke();
        }
      });
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();
};

onMounted(() => {
  initParticles();
});

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  window.removeEventListener('resize', resizeCanvas);
  window.removeEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
});
</script>

<style scoped>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
  background: linear-gradient(45deg, #1a1f3c, #2a3f7c);
}

.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    rgba(9, 75, 207, 0.2),
    rgba(30, 41, 88, 0.2)
  );
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.gradient-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(102, 152, 255, 0.15),
    transparent 70%
  );
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}
</style> 