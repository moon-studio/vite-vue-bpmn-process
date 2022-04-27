import RerenderPalette from '@/components/Moddles/RerenderPalette'
import translate from '@/components/Moddles/Translate'
import simulationModeler from 'bpmn-js-token-simulation'
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  CamundaPlatformPropertiesProviderModule
} from 'bpmn-js-properties-panel'
import CamundaExtensionModule from 'camunda-bpmn-moddle/lib'
import camundaModdleDescriptors from '@/components/Moddles/Extensions/camunda.json'

export default function (settings) {
  const { paletteMode, penalMode, processEngine } = settings
  const modules: any[] = []
  settings.value.paletteMode === 'rerender' && modules.push(RerenderPalette)
  // if ()
  settings.value.penalMode !== 'custom' &&
    modules.push(
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      CamundaPlatformPropertiesProviderModule,
      CamundaExtensionModule
    )
  modules.push(translate)
  modules.push(simulationModeler)
  console.log(settings.value)
  return modules
}
