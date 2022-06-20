import { computed } from 'vue'
import { ModuleDeclaration } from 'didi'
import { ViewerOptions } from 'diagram-js/lib/model'

import EventEmitter from '@/utils/EventEmitter'

// ** 官方流程模拟 module
// ** import simulationModeler from 'bpmn-js-token-simulation'

// camunda 官方侧边栏扩展
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  CloudElementTemplatesPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaExtensionModule from 'camunda-bpmn-moddle/lib'

// moddle 定义文件
import activitiModdleDescriptors from '@/components/ModdleExtensions/activiti.json'
import camundaModdleDescriptors from '@/components/ModdleExtensions/camunda.json'
import flowableModdleDescriptors from '@/components/ModdleExtensions/flowable.json'
import MiyueModdleDescriptors from '@/components/ModdleExtensions/miyue.json'

// 自定义 modules 扩展模块
import translate from '@/components/AddiModules/Translate'
import EnhancementPalette from '@/components/AddiModules/Palette/EnhancementPalette'
import RewritePalette from '@/components/AddiModules/Palette/RewritePalette'
import EnhancementContextPad from '@/components/AddiModules/ContextPad/EnhancementContextPad'
import RewriteContextPad from '@/components/AddiModules/ContextPad/RewriteContextPad'
import EnhancementRenderer from '@/components/AddiModules/Renderer/EnhancementRenderer'
import RewriteRenderer from '@/components/AddiModules/Renderer/RewriteRenderer'

import lintModule from 'bpmn-js-bpmnlint'
import bpmnlint from '@/components/AddiModules/Lint/bpmnlint'
import Rules from '@/components/AddiModules/Rules'

import ElementTemplateChooserModule from '@bpmn-io/element-template-chooser'
import AddExporterModule from '@bpmn-io/add-exporter'
import ConnectorsExtensionModule from 'bpmn-js-connectors-extension'

export default function (settings) {
  return computed<ViewerOptions<Element>>(() => {
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
    settings.value.rendererMode === 'rewrite' && modules.push(RewriteRenderer)

    // 配置 penal (基于 camunda)
    if (settings.value.penalMode !== 'custom') {
      modules.push(
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule,
        CamundaExtensionModule
      )
      moddle = { camunda: camundaModdleDescriptors }
      options['propertiesPanel'] = { parent: '#camunda-penal' }
      EventEmitter.instance.emit('settings', 'processEngine', 'camunda')
    }

    // 配置 翻译 与 流程模拟
    modules.push(translate)

    // 设置 lint 校验
    modules.push(lintModule)
    options['linting'] = {
      active: true,
      bpmnlint: bpmnlint
    }

    // 设置键盘事件绑定
    options['keyboard'] = {
      bindTo: document
    }

    // 设置 自定义规则
    modules.push(Rules)

    // // feature
    modules.push(
      ZeebePropertiesProviderModule,
      CloudElementTemplatesPropertiesProviderModule,
      AddExporterModule,
      ElementTemplateChooserModule,
      ConnectorsExtensionModule
    )
    options['exporter'] = {
      name: 'element-template-chooser-demo',
      version: '0.0.0'
    }
    options['connectorsExtension'] = {
      appendAnything: true
    }

    // 设置自定义属性
    moddle['miyue'] = MiyueModdleDescriptors

    return [modules, moddle, options]
  })
}
