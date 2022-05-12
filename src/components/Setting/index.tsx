import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
import { EditorSettings } from 'types/editor/settings'
import { defaultSettings } from '@/config'
import { NIcon, NForm, NFormItem, NInput, NRadioGroup, NRadio, NSwitch } from 'naive-ui'
import SettingsRound from '@vicons/material/SettingsRound'
import { Icon } from '@vicons/utils'
import EventEmitter from '@/utils/EventEmitter'

const props = {
  settings: {
    type: Object as PropType<EditorSettings>,
    default: () => defaultSettings
  }
}

const Setting = defineComponent({
  props: props,
  emits: ['update:settings'],
  setup(props) {
    const modelVisible = ref(false)

    const editorSettings = ref(props.settings)

    const changeModelVisible = (event) => {
      event.stopPropagation()
      modelVisible.value = !modelVisible.value
    }

    const settingClasses = computed(() => {
      const baseClasses = ['setting']
      modelVisible.value && baseClasses.push('setting_open')
      return baseClasses.join(' ')
    })

    EventEmitter.instance.on('settings', (key: string, value: string) => {
      editorSettings.value[key] = value
    })

    watchEffect(() => {
      if (modelVisible.value) {
        document.body.addEventListener('click', changeModelVisible)
      } else {
        document.body.removeEventListener('click', changeModelVisible)
      }
    })

    return () => (
      <div class={settingClasses.value} onClick={(e) => e.stopPropagation()}>
        <div class="toggle-button" onClick={changeModelVisible}>
          <NIcon size={40} color="#ffffff">
            <Icon>
              <SettingsRound></SettingsRound>
            </Icon>
          </NIcon>
        </div>

        <div class="setting-container">
          <div class="setting-header">偏好设置</div>
          <div class="setting-content">
            <NForm labelWidth={120} labelAlign="left">
              <NFormItem label="流程名称">
                <NInput v-model={[editorSettings.value.processName, 'value']} clearable={true}></NInput>
              </NFormItem>
              <NFormItem label="流程ID">
                <NInput v-model={[editorSettings.value.processId, 'value']} clearable={true}></NInput>
              </NFormItem>
              <NFormItem label="Toolbar">
                <NSwitch v-model={[editorSettings.value.toolbar, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label="Background">
                <NRadioGroup v-model={[editorSettings.value.bg, 'value']}>
                  <NRadio value="grid-image">网格</NRadio>
                  <NRadio value="image">图片</NRadio>
                  <NRadio value="none">空</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="Penal模式">
                <NRadioGroup v-model={[editorSettings.value.penalMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rerender">重写版</NRadio>
                  <NRadio value="custom">自定义</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="Palette模式">
                <NRadioGroup v-model={[editorSettings.value.paletteMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rerender">重写版</NRadio>
                  <NRadio value="enhancement">扩展版</NRadio>
                  <NRadio value="custom">自定义</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="流程引擎">
                <NRadioGroup v-model={[editorSettings.value.processEngine, 'value']}>
                  <NRadio value="camunda">Camunda</NRadio>
                  <NRadio value="activiti">Activiti</NRadio>
                  <NRadio value="flowable">Flowable</NRadio>
                </NRadioGroup>
              </NFormItem>
            </NForm>
            <div class="tips-message">
              <p>注：仅自定义模式可使用 activiti 或者 flowable 引擎</p>
              <p style="font-weight: bold">友情赞助</p>
              <div class="sponsorship-image wechat"></div>
              <div class="sponsorship-image alipay"></div>
            </div>
          </div>
          <div class="setting-footer"></div>
        </div>
      </div>
    )
  }
})

export default Setting
