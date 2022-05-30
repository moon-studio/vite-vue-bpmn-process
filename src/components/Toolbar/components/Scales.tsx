import { defineComponent, ref } from 'vue'
import { NButton, NButtonGroup, NIcon, NPopover } from 'naive-ui'
import ZoomOutRound from '@vicons/material/ZoomOutRound'
import ZoomInRound from '@vicons/material/ZoomInRound'
import EventEmitter from '@/utils/EventEmitter'
import type Modeler from 'bpmn-js/lib/Modeler'
import type Canvas from 'diagram-js/lib/core/Canvas'
import { CanvasEvent } from 'diagram-js/lib/core/EventBus'

const Scales = defineComponent({
  setup() {
    const currentScale = ref(1)
    let canvas: Canvas | null = null

    EventEmitter.instance.on('modeler-init', (modeler: Modeler) => {
      canvas = modeler.get<Canvas>('canvas')
      currentScale.value = canvas.zoom()
      modeler.on('canvas.viewbox.changed', ({ viewbox }: CanvasEvent<any>) => {
        currentScale.value = viewbox.scale
      })
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

    return () => (
      <NButtonGroup>
        <NPopover
          v-slots={{
            default: () => '缩小视图',
            trigger: () => (
              <NButton onClick={() => zoomOut()}>
                <NIcon component={ZoomOutRound}></NIcon>
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
                  {currentScale.value}
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
                <NIcon component={ZoomInRound}></NIcon>
              </NButton>
            )
          }}
        ></NPopover>
      </NButtonGroup>
    )
  }
})

export default Scales
