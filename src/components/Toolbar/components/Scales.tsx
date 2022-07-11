import { computed, defineComponent, ref } from 'vue'
import { NButton, NButtonGroup, NPopover } from 'naive-ui'
import LucideIcon from '@/components/common/LucideIcon.vue'
import EventEmitter from '@/utils/EventEmitter'
import type Modeler from 'bpmn-js/lib/Modeler'
import type Canvas from 'diagram-js/lib/core/Canvas'
import { CanvasEvent } from 'diagram-js/lib/core/EventBus'
import editor from '@/store/editor'

const Scales = defineComponent({
  name: 'Scales',
  setup() {
    const minimapStatus = computed(() => editor().getEditorConfig.miniMap)
    const currentScale = ref(1)
    let canvas: Canvas | null = null
    let minimap: any | null = null

    EventEmitter.on('modeler-init', (modeler: Modeler) => {
      try {
        canvas = modeler.get<Canvas>('canvas')
        minimap = modeler.get('minimap')
        currentScale.value = canvas.zoom()
      } finally {
        modeler.on('canvas.viewbox.changed', ({ viewbox }: CanvasEvent<any>) => {
          currentScale.value = viewbox.scale
        })
      }
    })

    const zoomOut = (newScale?: number) => {
      currentScale.value = newScale || Math.floor(currentScale.value * 100 - 0.1 * 100) / 100
      zoomReset(currentScale.value)
    }

    const zoomIn = (newScale?: number) => {
      currentScale.value = newScale || Math.floor(currentScale.value * 100 + 0.1 * 100) / 100
      zoomReset(currentScale.value)
    }

    const zoomReset = (newScale: number | string) => {
      canvas && canvas.zoom(newScale, newScale === 'fit-viewport' ? undefined : { x: 0, y: 0 })
    }

    const minimapToggle = () => {
      minimap && minimap.toggle()
    }

    return () => (
      <NButtonGroup>
        <NPopover
          v-slots={{
            default: () => '缩小视图',
            trigger: () => (
              <NButton onClick={() => zoomOut()}>
                <LucideIcon name="ZoomOut" size={16}></LucideIcon>
              </NButton>
            )
          }}
        ></NPopover>
        <NPopover
          v-slots={{
            default: () => '重置缩放',
            trigger: () => (
              <NButton onClick={() => zoomReset('fit-viewport')}>
                <span style="text-align: center; display: inline-block; width: 40px">
                  {Math.floor(currentScale.value * 10) * 10 + '%'}
                </span>
              </NButton>
            )
          }}
        ></NPopover>
        <NPopover
          v-slots={{
            default: () => '放大视图',
            trigger: () => (
              <NButton onClick={() => zoomIn()}>
                <LucideIcon name="ZoomIn" size={16}></LucideIcon>
              </NButton>
            )
          }}
        ></NPopover>
        {minimapStatus.value && (
          <NPopover
            v-slots={{
              default: () => '展开/收起小地图',
              trigger: () => (
                <NButton onClick={() => minimapToggle()}>
                  <LucideIcon name="Map" size={16}></LucideIcon>
                </NButton>
              )
            }}
          ></NPopover>
        )}
      </NButtonGroup>
    )
  }
})

export default Scales
