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

import { useI18n } from 'vue-i18n'

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
    const { t, locale } = useI18n()

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
        locale.value = editorSettings.value.language
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
            title={t('configForm.preferences')}
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
            <NForm labelAlign="right" size="small" labelPlacement="left">
              <NFormItem label={t('configForm.language')}>
                <NRadioGroup v-model={[editorSettings.value.language, 'value']}>
                  <NRadio value="zh_CN">简体中文</NRadio>
                  <NRadio value="en_US">English</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label={t('configForm.processName')}>
                <NInput
                  v-model={[editorSettings.value.processName, 'value']}
                  clearable={true}
                ></NInput>
              </NFormItem>
              <NFormItem label={t('configForm.processId')}>
                <NInput
                  v-model={[editorSettings.value.processId, 'value']}
                  clearable={true}
                ></NInput>
              </NFormItem>
              <NFormItem label={t('configForm.toolbar')}>
                <NSwitch v-model={[editorSettings.value.toolbar, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label={t('configForm.miniMap')}>
                <NSwitch v-model={[editorSettings.value.miniMap, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label={t('configForm.useLint')}>
                <NSwitch v-model={[editorSettings.value.useLint, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label={t('configForm.templateChooser')}>
                <NSwitch v-model={[editorSettings.value.templateChooser, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem
                label={t('configForm.contextmenu')}
                feedback={t('configForm.there_are_different_states_under_TemplateChooser')}
              >
                <NSwitch v-model={[editorSettings.value.contextmenu, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label={t('configForm.customContextmenu')}>
                <NSwitch v-model={[editorSettings.value.customContextmenu, 'value']}></NSwitch>
              </NFormItem>
              <NFormItem label={t('configForm.processEngine')}>
                <NRadioGroup v-model={[editorSettings.value.processEngine, 'value']}>
                  <NRadio value="camunda">{t('Camunda')}</NRadio>
                  <NRadio value="activiti">{t('Activeti')}</NRadio>
                  <NRadio value="flowable">{t('Flowable')}</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label={t('configForm.background')}>
                <NRadioGroup v-model={[editorSettings.value.bg, 'value']}>
                  <NRadio value="grid-image">{t('configForm.gridImage')}</NRadio>
                  <NRadio value="grid">{t('configForm.grid')}</NRadio>
                  <NRadio value="image">{t('configForm.image')}</NRadio>
                  <NRadio value="none">{t('configForm.none')}</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label={t('configForm.penalMode')}>
                <NRadioGroup v-model={[editorSettings.value.penalMode, 'value']}>
                  <NRadio value="default">{t('configForm.default')}</NRadio>
                  <NRadio value="rewrite" disabled={true}>
                    {t('configForm.rewrite')}
                  </NRadio>
                  <NRadio value="custom">{t('configForm.custom')}</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label={t('configForm.paletteMode')}>
                <NRadioGroup v-model={[editorSettings.value.paletteMode, 'value']}>
                  <NRadio value="default">{t('configForm.default')}</NRadio>
                  <NRadio value="rewrite">{t('configForm.rewrite')}</NRadio>
                  <NRadio value="enhancement">{t('configForm.enhancement')}</NRadio>
                  <NRadio value="custom">{t('configForm.custom')}</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label={t('configForm.contextPadMode')}>
                <NRadioGroup v-model={[editorSettings.value.contextPadMode, 'value']}>
                  <NRadio value="default">{t('configForm.default')}</NRadio>
                  <NRadio value="rewrite">{t('configForm.rewrite')}</NRadio>
                  <NRadio value="enhancement">{t('configForm.enhancement')}</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label={t('configForm.rendererMode')}>
                <NRadioGroup v-model={[editorSettings.value.rendererMode, 'value']}>
                  <NRadio value="default">{t('configForm.default')}</NRadio>
                  <NRadio value="rewrite">{t('configForm.rewrite')}</NRadio>
                  <NRadio value="enhancement">{t('configForm.enhancement')}</NRadio>
                </NRadioGroup>
              </NFormItem>
              <NFormItem label={t('configForm.otherModule')} feedback="AutoPlace, Rules ...">
                <NSwitch v-model={[editorSettings.value.otherModule, 'value']}></NSwitch>
              </NFormItem>
              {editorSettings.value.rendererMode === 'rewrite' && (
                <NFormItem
                  label={t('configForm.customTheme')}
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
