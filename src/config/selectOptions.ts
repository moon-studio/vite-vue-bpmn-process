import { ref } from 'vue'

export const scriptTypeOptions = ref<Record<string, string>[]>([
  { label: '外链脚本( External Resource )', value: 'external' },
  { label: '内联脚本( Inline Script )', value: 'inline' },
  { label: '无( None )', value: 'none' }
])
