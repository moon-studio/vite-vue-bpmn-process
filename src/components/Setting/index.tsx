import { defineComponent, PropType, ref, toRaw, watch } from 'vue'
import {
  NForm,
  NFormItem,
  NInput,
  NRadioGroup,
  NRadio,
  NSwitch,
  NDrawer,
  NDrawerContent,
  NColorPicker,
  NInputNumber
} from 'naive-ui'
import { EditorSettings } from 'types/editor/settings'
import { defaultSettings } from '@/config'
import editor from '@/store/editor'
import LucideIcon from '@/components/common/LucideIcon.vue'

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

    const themeColorKeys = [
      'defaultFillColor',
      'defaultStartEventColor',
      'defaultEndEventColor',
      'defaultIntermediateEventColor',
      'defaultIntermediateThrowEventColor',
      'defaultIntermediateCatchEventColor',
      'defaultTaskColor',
      'defaultLabelColor',
      'defaultGatewayColor',
      'defaultSequenceColor'
    ]
    const themeOpacityKeys = [
      'defaultStartEventOpacity',
      'defaultEndEventOpacity',
      'defaultIntermediateThrowEventOpacity',
      'defaultIntermediateCatchEventOpacity',
      'defaultTaskOpacity',
      'defaultLabelOpacity',
      'defaultGatewayOpacity',
      'defaultSequenceOpacity'
    ]
    const editorSettings = ref(props.settings)
    const changeModelVisible = (event) => {
      event.stopPropagation()
      modelVisible.value = !modelVisible.value
    }

    watch(
      () => editorSettings.value,
      () => {
        if (editorSettings.value.penalMode !== 'custom') {
          editorSettings.value.processEngine = 'camunda'
        }
        editorSettings.value && editorStore.updateConfiguration(toRaw(editorSettings.value))
      },
      { deep: true }
    )

    return () => (
      <div class="setting" onClick={(e) => e.stopPropagation()}>
        <div class="toggle-button" onClick={changeModelVisible}>
          <LucideIcon name="Settings" size={40} color="#ffffff"></LucideIcon>
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
                    <p>3. 自定义的MySql节点只能使用非默认渲染方式</p>
                    <p>4. 🚀🚀🚀付费咨询请添加微信或者关注微信公众号</p>
                  </div>
                  <p style="font-weight: bold">友情赞助</p>
                  <div class="sponsorship-image wechat"></div>
                  <div class="sponsorship-image alipay"></div>
                </div>
              )
            }}
          >
            <NForm labelWidth={120} labelAlign="right" size="small" labelPlacement="left">
              <NFormItem label="流程名称：">
                <NInput
                  v-model={[editorSettings.value.processName, 'value']}
                  clearable={true}
                ></NInput>
              </NFormItem>
              <NFormItem label="流程ID：">
                <NInput
                  v-model={[editorSettings.value.processId, 'value']}
                  clearable={true}
                ></NInput>
              </NFormItem>
              <NFormItem label="工具栏：">
                <NSwitch v-model={[editorSettings.value.toolbar, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label="小地图：">
                <NSwitch v-model={[editorSettings.value.miniMap, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label="流程校验：">
                <NSwitch v-model={[editorSettings.value.useLint, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label="模板扩展：">
                <NSwitch v-model={[editorSettings.value.templateChooser, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label="右键增强：" feedback="在'模板扩展'下有不同状态">
                <NSwitch v-model={[editorSettings.value.contextmenu, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label="自定义右键菜单：">
                <NSwitch v-model={[editorSettings.value.customContextmenu, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label="流程引擎：">
                <NRadioGroup v-model={[editorSettings.value.processEngine, 'value']}>
                  <NRadio value="camunda">Camunda</NRadio>
                  <NRadio value="activiti">Activiti</NRadio>
                  <NRadio value="flowable">Flowable</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="背景设置：">
                <NRadioGroup v-model={[editorSettings.value.bg, 'value']}>
                  <NRadio value="grid-image">自定义网格</NRadio>
                  <NRadio value="grid">默认网点</NRadio>
                  <NRadio value="image">图片</NRadio>
                  <NRadio value="none">空</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="Penal模式：">
                <NRadioGroup v-model={[editorSettings.value.penalMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rewrite" disabled={true}>
                    重写版
                  </NRadio>
                  <NRadio value="custom">自定义</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="Palette模式：">
                <NRadioGroup v-model={[editorSettings.value.paletteMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rewrite">重写版</NRadio>
                  <NRadio value="enhancement">扩展版</NRadio>
                  <NRadio value="custom">自定义</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="ContextPad模式：">
                <NRadioGroup v-model={[editorSettings.value.contextPadMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rewrite">重写版</NRadio>
                  <NRadio value="enhancement">扩展版</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="Renderer模式：">
                <NRadioGroup v-model={[editorSettings.value.rendererMode, 'value']}>
                  <NRadio value="default">默认</NRadio>
                  <NRadio value="rewrite">重写版</NRadio>
                  <NRadio value="enhancement">扩展版</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label="其他示例扩展：" feedback="AutoPlace, Rules 等">
                <NSwitch v-model={[editorSettings.value.otherModule, 'value']}></NSwitch>
              </NFormItem>
              {editorSettings.value.rendererMode === 'rewrite' && (
                <NFormItem
                  label="自定义主题："
                  class="theme-list"
                  labelAlign="left"
                  labelPlacement="top"
                >
                  {themeColorKeys.map((key) => {
                    return (
                      <div class="theme-item">
                        <div class="theme-item_label">{key}：</div>
                        <NColorPicker
                          modes={['hex']}
                          showAlpha={false}
                          v-model={[editorSettings.value.customTheme[key], 'value']}
                        ></NColorPicker>
                      </div>
                    )
                  })}
                  {themeOpacityKeys.map((key) => {
                    return (
                      <div class="theme-item">
                        <div class="theme-item_label">{key}：</div>
                        <NInputNumber
                          v-model={[editorSettings.value.customTheme[key], 'value']}
                        ></NInputNumber>
                      </div>
                    )
                  })}
                </NFormItem>
              )}
            </NForm>
          </NDrawerContent>
        </NDrawer>
      </div>
    )
  }
})

export default Setting
