<template>
  <div v-if="modelValue" class="credential-overlay" @click="handleClose">
    <section
      class="credential-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credential-title"
      @click.stop
    >
      <header class="credential-header">
        <div>
          <p class="credential-kicker">注册成功</p>
          <h2 id="credential-title" class="credential-title">请保存登录凭证</h2>
        </div>
      </header>

      <div class="credential-card" role="img" :aria-label="`登录凭证，账号 ${username}`">
        <div class="credential-card-top">
          <div>
            <p class="credential-brand">莳花</p>
            <h3 class="credential-card-title">登录凭证</h3>
          </div>
          <span class="credential-state">{{ issuedDate }}</span>
        </div>

        <div class="credential-fields">
          <div class="credential-field">
            <span class="credential-label">账号</span>
            <strong class="credential-value">{{ username }}</strong>
          </div>
          <div class="credential-field">
            <span class="credential-label">密码</span>
            <strong class="credential-value credential-password">{{ password }}</strong>
          </div>
        </div>

        <div class="credential-card-bottom">
          <span>请妥善保存</span>
          <span>后续登录使用</span>
        </div>
      </div>

      <p class="credential-note">请截图保存这张登录凭证，后续登录需要使用上方账号和密码。</p>

      <button class="credential-done-btn" type="button" @click="handleClose">已截图，去登录</button>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  username: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue', 'close'])

const issuedDate = computed(() => {
  const date = new Date()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}.${month}.${day}`
})

const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
.credential-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    radial-gradient(circle at 50% 30%, rgba(253, 242, 248, 0.22), transparent 34%),
    rgba(36, 28, 34, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.credential-modal {
  width: min(100%, 398px);
  padding: 20px 18px 18px;
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.92), rgba(255, 247, 251, 0.82)),
    rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.78);
  box-shadow:
    0 28px 80px rgba(55, 36, 46, 0.24),
    0 12px 30px rgba(190, 95, 132, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.credential-header {
  display: block;
  margin-bottom: 15px;
}

.credential-kicker {
  margin: 0 0 3px;
  color: #9a3f68;
  font-size: 12px;
  font-weight: 650;
}

.credential-title {
  margin: 0;
  color: #1d1d1f;
  font-size: 21px;
  line-height: 1.2;
  font-weight: 700;
}

.credential-card {
  position: relative;
  padding: 17px;
  overflow: hidden;
  border-radius: 24px;
  color: #1d1d1f;
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 255, 255, 0.86), transparent 34%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(255, 247, 251, 0.9)), #fffafd;
  border: 1px solid rgba(236, 72, 153, 0.1);
  box-shadow:
    0 18px 38px rgba(190, 95, 132, 0.12),
    0 6px 16px rgba(60, 60, 67, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.96);
}

.credential-card::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: 23px;
  pointer-events: none;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.72), transparent 42%),
    linear-gradient(90deg, rgba(244, 114, 182, 0.18), transparent 28%);
}

.credential-card::after {
  content: '';
  position: absolute;
  left: 18px;
  right: 18px;
  top: 0;
  height: 3px;
  border-radius: 0 0 999px 999px;
  background: linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.5), transparent);
}

.credential-card-top,
.credential-fields,
.credential-card-bottom {
  position: relative;
  z-index: 1;
}

.credential-card-top {
  min-height: 58px;
  padding-bottom: 15px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid rgba(236, 72, 153, 0.1);
}

.credential-brand {
  margin: 0 0 4px;
  color: rgba(154, 63, 104, 0.68);
  font-size: 10px;
  font-weight: 760;
}

.credential-card-title {
  margin: 0;
  color: #1d1d1f;
  font-size: 21px;
  line-height: 1.1;
  font-weight: 750;
}

.credential-state {
  height: 26px;
  padding: 0 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: rgba(154, 63, 104, 0.66);
  font-size: 11px;
  font-weight: 650;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(236, 72, 153, 0.08);
}

.credential-fields {
  margin-top: 14px;
  display: grid;
  gap: 10px;
}

.credential-field {
  min-height: 54px;
  padding: 10px 12px;
  border-radius: 16px;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(236, 72, 153, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.credential-label {
  color: rgba(154, 63, 104, 0.58);
  font-size: 12px;
  font-weight: 650;
}

.credential-value {
  min-width: 0;
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  word-break: break-all;
}

.credential-password {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 15px;
}

.credential-card-bottom {
  margin-top: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: rgba(60, 60, 67, 0.42);
  font-size: 10px;
  font-weight: 760;
}

.credential-note {
  margin: 13px 2px 14px;
  color: rgba(80, 54, 66, 0.68);
  font-size: 13px;
  line-height: 1.55;
  text-align: center;
}

.credential-done-btn {
  width: 100%;
  height: 47px;
  border: 0;
  border-radius: 16px;
  color: #8f315d;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  touch-action: manipulation;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.2) 46%),
    rgba(253, 242, 248, 0.96);
  border: 1px solid rgba(236, 72, 153, 0.16);
  box-shadow:
    0 10px 22px rgba(190, 95, 132, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.credential-done-btn:active {
  transform: scale(0.985);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.58), rgba(255, 255, 255, 0.08) 44%),
    rgba(252, 231, 243, 0.98);
}

.credential-done-btn:focus-visible {
  outline: 2px solid rgba(236, 72, 153, 0.32);
  outline-offset: 3px;
}

@media (max-width: 780px) {
  .credential-overlay {
    padding: max(16px, env(safe-area-inset-top)) 14px max(16px, env(safe-area-inset-bottom));
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  .credential-modal {
    padding: 19px 16px 16px;
    border-radius: 27px;
  }
}

@media (max-width: 360px) {
  .credential-title {
    font-size: 19px;
  }

  .credential-card {
    padding: 15px;
  }

  .credential-field {
    grid-template-columns: 38px minmax(0, 1fr);
    gap: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .credential-done-btn {
    transition: none;
  }
}
</style>
