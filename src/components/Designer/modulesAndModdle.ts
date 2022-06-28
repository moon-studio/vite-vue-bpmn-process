import { Ref, toRaw } from 'vue'
import { ModuleDeclaration } from 'didi'
import { EditorSettings } from 'types/editor/settings'

// ** 官方流程模拟 module
// ** import simulationModeler from 'bpmn-js-token-simulation'

// moddle 定义文件
import activitiModdleDescriptors from '@/moddle-extensions/activiti.json'
import camundaModdleDescriptors from '@/moddle-extensions/camunda.json'
import flowableModdleDescriptors from '@/moddle-extensions/flowable.json'
import MiyueModdleDescriptors from '@/moddle-extensions/miyue.json'
import ZeebeModdleDescriptors from '@/moddle-extensions/zeebe.json'

// camunda 官方侧边栏扩展
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  CloudElementTemplatesPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaExtensionModule from 'camunda-bpmn-moddle/lib'

// 官方扩展工具 元素模板选择
import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser'
import AddExporterModule from '@bpmn-io/add-exporter'
import ConnectorsExtensionModule from 'bpmn-js-connectors-extension'

// 自定义 modules 扩展模块
import translate from '@/additional-modules/Translate'
import EnhancementPalette from '@/additional-modules/Palette/EnhancementPalette'
import RewritePalette from '@/additional-modules/Palette/RewritePalette'
import EnhancementContextPad from '@/additional-modules/ContextPad/EnhancementContextPad'
import RewriteContextPad from '@/additional-modules/ContextPad/RewriteContextPad'
import EnhancementRenderer from '@/additional-modules/Renderer/EnhancementRenderer'
import RewriteRenderer from '@/additional-modules/Renderer/RewriteRenderer'
import Rules from '@/additional-modules/Rules'

import lintModule from 'bpmn-js-bpmnlint'
import bpmnlint from '@/additional-modules/Lint/bpmnlint'

export default function (settings: Ref<EditorSettings>) {
  const modules: ModuleDeclaration[] = [] // modules 扩展模块数组
  let moddle: { [key: string]: any } = {} // moddle 声明文件对象
  const options: { [key: string]: any } = {} // modeler 其他配置

  // 设置对应的 moddle 解析配置文件
  if (settings.value.processEngine === 'activiti') moddle['activiti'] = activitiModdleDescriptors
  if (settings.value.processEngine === 'camunda') moddle['camunda'] = camundaModdleDescriptors
  if (settings.value.processEngine === 'flowable') moddle['flowable'] = flowableModdleDescriptors

  // 配置 palette (可覆盖 paletteProvider 取消原生侧边栏)
  settings.value.paletteMode === 'enhancement' && modules.push(EnhancementPalette)
  settings.value.paletteMode === 'rewrite' && modules.push(RewritePalette)
  settings.value.paletteMode === 'custom' &&
    modules.push({ paletteProvider: ['type', function () {}] })

  // 配置 contextPad (可覆盖 contextPadProvider 取消原生上下文菜单)
  settings.value.contextPadMode === 'enhancement' && modules.push(EnhancementContextPad)
  settings.value.contextPadMode === 'rewrite' && modules.push(RewriteContextPad)

  // 配置 自定义渲染
  settings.value.rendererMode === 'enhancement' && modules.push(EnhancementRenderer)
  if (settings.value.rendererMode === 'rewrite') {
    modules.push(RewriteRenderer)
    options['bpmnRenderer'] = { ...toRaw(settings.value).customTheme }
  }

  // 配置模板选择弹窗（会影响默认 popupmenu）
  if (
    (settings.value.templateChooser && settings.value.processEngine === 'camunda') ||
    settings.value.penalMode !== 'custom'
  ) {
    modules.push(
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      CamundaExtensionModule
    )
    moddle = {}
    if (settings.value.penalMode !== 'custom') {
      options['propertiesPanel'] = { parent: '#camunda-penal' }
      moddle['camunda'] = camundaModdleDescriptors
    }
    if (settings.value.templateChooser) {
      modules.push(
        ZeebePropertiesProviderModule,
        CloudElementTemplatesPropertiesProviderModule,
        AddExporterModule,
        ElementTemplateChooserModule,
        ConnectorsExtensionModule
      )
      options['exporter'] = {
        name: 'element-template-chooser',
        version: '0.0.1'
      }
      options['connectorsExtension'] = {
        appendAnything: true
      }
      moddle['zeebe'] = ZeebeModdleDescriptors
    }
  }

  // 设置 lint 校验
  if (settings.value.useLint) {
    modules.push(lintModule)
    options['linting'] = {
      active: true,
      bpmnlint: bpmnlint
    }
  }

  // 配置 翻译 与 流程模拟
  modules.push(translate)

  // 设置键盘事件绑定
  options['keyboard'] = {
    bindTo: document
  }

  // 设置 自定义规则
  modules.push(Rules)

  // 设置自定义属性
  moddle['miyue'] = MiyueModdleDescriptors

  return [modules, moddle, options]
}
