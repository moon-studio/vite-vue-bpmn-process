import { defineComponent, ref } from 'vue'
import EventEmitter from '@/utils/EventEmitter'
import { Base, Connection, Label, ModdleElement, Shape } from 'diagram-js/lib/model'
import { NCard } from 'naive-ui'

const props = {}

const Penal = defineComponent({
  setup() {
    const penal = ref<HTMLDivElement | null>(null)

    const currentElement = ref<Shape | Base | Connection | Label | null>(null)
    const currentElementId = ref<string | undefined>(undefined)
    const currentElementType = ref<string | undefined>(undefined)
    const currentElementBO = ref<ModdleElement | null>(null)

    EventEmitter.instance.on('modeler-init', (modeler) => {
      modeler.on('element.click', (element) => {
        console.log(element)
        currentElement.value = element
      })
    })

    return () => (
      <div ref={penal} class="penal">
        <NCard
          title="属性配置"
          segmented={{ content: true, footer: 'soft' }}
          v-slots={{
            default: () => <div>卡片内容</div>
          }}
        ></NCard>
      </div>
    )
  }
})

export default Penal
