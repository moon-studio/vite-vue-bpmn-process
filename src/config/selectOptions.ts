import { ref } from 'vue'

export const scriptTypeOptions = ref<Record<string, string>[]>([
  { label: 'External Resource', value: 'external' },
  { label: 'Inline Script', value: 'inline' },
  { label: 'None', value: 'none' }
])
