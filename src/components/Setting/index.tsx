import { computed, defineComponent, PropType, ref, watchEffect } from 'vue'
import { EditorSettings } from 'types/editor/settings'
import { defaultSettings } from '@/config'
import {
  NIcon,
  NForm,
  NFormItem,
  NInput,
  NRadioGroup,
  NRadio,
  NSwitch,
  NDrawer,
  NDrawerContent
} from 'naive-ui'
import SettingsRound from '@vicons/material/SettingsRound'
import { Icon } from '@vicons/utils'
import EventEmitter from '@/utils/EventEmitter'
import editor from '@/store/editor'

const props = {
  settings: {
    type: Object as PropType<EditorSettings>,
    default: () => defaultSettings
  }
}

const Setting = defineComponent({
  name: 'Setting',
  props: props,
  emits: ['update:settings'],
  setup(props) {
    const modelVisible = ref(false)
    const editorStore = editor()

    const editorSettings = ref(props.settings)

    const changeModelVisible = (event) => {
      event.stopPropagation()
      modelVisible.value = !modelVisible.value
    }

    EventEmitter.instance.on('settings', (key: string, value: string) => {
      editorSettings.value[key] = value
    })

    watchEffect(() => {
      editorSettings.value && editorStore.updateConfiguration(editorSettings.value)
    })

    return () => (
      <div class="setting" onClick={(e) => e.stopPropagation()}>
        <div class="toggle-button" onClick={changeModelVisible}>
          <NIcon size={40} color="#ffffff">
            <Icon>
              <SettingsRound></SettingsRound>
            </Icon>
          </NIcon>
        </div>

        <NDrawer v-model={[modelVisible.value, 'show']} width={560}>
          <NDrawerContent
            title="偏好设置"
            closable={true}
            v-slots={{
              footer: () => (
                <div class="tips-message">
                  <div class="grip-tips">
                    <p>注：</p>
                    <p>1. 仅自定义模式可使用 activiti 或者 flowable 引擎</p>
                    <p>2. 扩展模式下只能扩展工具按钮，不能删除原有工具</p>
                  </div>
                  <p style="font-weight: bold">友情赞助</p>
                  <div class="sponsorship-image wechat"></div>
                  <div class="sponsorship-image alipay"></div>
                </div>
              )
            }}
          >
            <NForm labelWidth={120} labelAlign="left" size="small">
              <NFormItem label="流程名称">
                <NInput
                  v-model={[editorSettings.value.processName, 'value']}
                  clearable={true}
                ></NInput>
              </NFormItem>
              <NFormItem label="流程ID">
                <NInput
                  v-model={[editorSettings.value.processId, 'value']}
                  clearable={true}
                ></NInput>
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
                  <NRadio value="rewrite">重写版</NRadio>
                  <NRadio value="custom">自定义</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="Palette模式">
                <NRadioGroup v-model={[editorSettings.value.paletteMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rewrite">重写版</NRadio>
                  <NRadio value="enhancement">扩展版</NRadio>
                  <NRadio value="custom">自定义</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="ContextPadMode模式">
                <NRadioGroup v-model={[editorSettings.value.contextPadMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rewrite">重写版</NRadio>
                  <NRadio value="enhancement">扩展版</NRadio>
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
          </NDrawerContent>
        </NDrawer>
      </div>
    )
  }
})

export default Setting
