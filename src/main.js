// 不再全量引入 Vant 的 CSS，改用按需引入组件样式
import './assets/main.css'
import './assets/apple-card.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// 按需引入 Vant 组件（而不是全量引入）
import {
  ActionSheet,
  Button,
  Cell,
  CellGroup,
  Checkbox,
  CheckboxGroup,
  Dialog,
  DropdownItem,
  DropdownMenu,
  Empty,
  Field,
  Form,
  Icon,
  Lazyload,
  Loading,
  Notify,
  NumberKeyboard,
  Picker,
  Popup,
  RadioGroup,
  Radio,
  Search,
  Stepper,
  Switch,
  Tab,
  Tabs,
  TimePicker,
  Toast,
  Uploader,
  showDialog,
  showNotify,
  showLoadingToast,
  showToast,
} from 'vant'
import 'vant/es/action-sheet/style'
import 'vant/es/button/style'
import 'vant/es/cell/style'
import 'vant/es/cell-group/style'
import 'vant/es/checkbox/style'
import 'vant/es/checkbox-group/style'
import 'vant/es/dialog/style'
import 'vant/es/dropdown-item/style'
import 'vant/es/dropdown-menu/style'
import 'vant/es/empty/style'
import 'vant/es/field/style'
import 'vant/es/form/style'
import 'vant/es/icon/style'
import 'vant/es/loading/style'
import 'vant/es/notify/style'
import 'vant/es/number-keyboard/style'
import 'vant/es/picker/style'
import 'vant/es/popup/style'
import 'vant/es/radio-group/style'
import 'vant/es/radio/style'
import 'vant/es/search/style'
import 'vant/es/stepper/style'
import 'vant/es/switch/style'
import 'vant/es/tab/style'
import 'vant/es/tabs/style'
import 'vant/es/time-picker/style'
import 'vant/es/toast/style'
import 'vant/es/uploader/style'

import CuteIcon from '@/components/CuteIcon.vue'

const app = createApp(App)
app.component('cute-icon', CuteIcon)
const pinia = createPinia()

app.use(pinia)

// 按需注册 Vant 组件
app.use(ActionSheet)
app.use(Button)
app.use(Cell)
app.use(CellGroup)
app.use(Checkbox)
app.use(CheckboxGroup)
app.use(DropdownItem)
app.use(DropdownMenu)
app.use(Empty)
app.use(Field)
app.use(Form)
app.use(Icon)
app.use(Loading)
app.use(NumberKeyboard)
app.use(Picker)
app.use(Popup)
app.use(RadioGroup)
app.use(Radio)
app.use(Search)
app.use(Stepper)
app.use(Switch)
app.use(Tab)
app.use(Tabs)
app.use(TimePicker)
app.use(Toast)
app.use(Uploader)

// Lazyload 指令
app.use(Lazyload)

// 挂载全局函数（方便组件中使用）
app.config.globalProperties.$showDialog = showDialog
app.config.globalProperties.$showNotify = showNotify
app.config.globalProperties.$showLoadingToast = showLoadingToast
app.config.globalProperties.$showToast = showToast

app.use(router)

app.mount('#app')
