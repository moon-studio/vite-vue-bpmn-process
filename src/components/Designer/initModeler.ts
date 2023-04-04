import { markRaw, Ref } from 'vue'
import Modeler from 'bpmn-js/lib/Modeler'
import EventEmitter from '@/utils/EventEmitter'
import modelerStore from '@/store/modeler'
import EnhancementContextmenu from '@/additional-functions/EnhancementContextmenu'

import type { BaseViewerOptions } from 'bpmn-js/lib/BaseViewer'
import type { ModulesAndModdles } from '@/components/Designer/modulesAndModdle'

export default async function (
  designer: Ref<HTMLElement | null>,
  modelerModules: ModulesAndModdles,
  emit
) {
  const store = modelerStore()

  const options: BaseViewerOptions = {
    container: designer!.value as HTMLElement,
    additionalModules: modelerModules[0] || [],
    moddleExtensions: modelerModules[1] || {},
    ...modelerModules[2]
  }

  if (store.getModeler) {
    // 清除旧 modeler
    store.getModeler.destroy()
    await store.setModeler(undefined)
  }

  const modeler: Modeler = new Modeler(options)

  await store.setModeler(markRaw(modeler))

  EventEmitter.emit('modeler-init', modeler)

  EnhancementContextmenu(modeler)

  modeler.on('commandStack.changed', async (event) => {
    try {
      const { xml } = await modeler.saveXML({ format: true })

      emit('update:xml', xml)
      emit('command-stack-changed', event)
    } catch (error) {
      console.error(error)
    }
  })
}
