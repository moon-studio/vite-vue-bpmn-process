import { computed, defineComponent } from 'vue'
import { NButton, NButtonGroup, NPopover, useDialog } from 'naive-ui'
import LucideIcon from '@/components/common/LucideIcon.vue'
import editor from '@/store/editor'
import modeler from '@/store/modeler'
import ToggleMode from 'bpmn-js-token-simulation/lib/features/toggle-mode/modeler/ToggleMode'

const ExternalTools = defineComponent({
  name: 'ExternalTools',
  setup() {
    const moduleStore = modeler()

    let minimap: any | null = null
    const minimapStatus = computed(() => editor().getEditorConfig.miniMap)
    const minimapToggle = () => {
      !minimap && (minimap = moduleStore.getModeler!.get('minimap'))
      minimap && minimap.toggle()
    }

    const mockSimulation = () => {
      modeler().getModeler!.get<ToggleMode>('toggleMode').toggleMode()
    }

    let lintModule: any | null = null
    const lintEnable = computed(() => editor().getEditorConfig.useLint)
    const lintToggle = () => {
      !lintModule && (lintModule = moduleStore.getModeler!.get('linting'))
      lintModule && lintModule.toggle()
    }

    const shortcutKeysModel = useDialog()
    const shortcutKeysEnable = computed(() => editor().getEditorConfig.otherModule)
    const templateExternal = computed(() => editor().getEditorConfig.templateChooser)
    const openShortcutKeysModel = () => {
      const renderDefault = () => (
        <div class="shortcut-keys-model">
          <p>Undo</p>
          <p>Ctrl + Z</p>
          <p>Redo</p>
          <p>Ctrl + Shift + Z / ctrl + Y</p>
          <p>Select All</p>
          <p>Ctrl + A</p>
          <p>Zoom</p>
          <p>Ctrl + Mouse Wheel</p>
          <p>Scrolling (Vertical)</p>
          <p>Mouse Wheel</p>
          <p>Scrolling (Horizontal)</p>
          <p>Shift + Mouse Wheel</p>
          <p>Direct Editing</p>
          <p>E</p>
          <p>Hand Tool</p>
          <p>H</p>
          <p>Lasso Tool</p>
          <p>L</p>
          <p>Space Tool</p>
          <p>S</p>
        </div>
      )
      const renderTemplateExternal = () => (
        <div class="shortcut-keys-model">
          <p>Replace Tool</p>
          <p>R</p>
          <p>Append anything</p>
          <p>A</p>
          <p>Create anything</p>
          <p>N</p>
        </div>
      )
      shortcutKeysModel.create({
        title: '键盘快捷键',
        showIcon: false,
        content: () => (
          <div>
            {renderDefault()}
            {templateExternal.value && renderTemplateExternal()}
          </div>
        )
      })
    }

    return () => (
      <NButtonGroup>
        <NPopover
          v-slots={{
            default: () => '开启/关闭流程模拟',
            trigger: () => (
              <NButton onClick={mockSimulation}>
                <LucideIcon name="Bot" size={16}></LucideIcon>
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
        {lintEnable.value && (
          <NPopover
            v-slots={{
              default: () => '开启/关闭流程校验',
              trigger: () => (
                <NButton onClick={() => lintToggle()}>
                  <LucideIcon name="FileCheck" size={16}></LucideIcon>
                </NButton>
              )
            }}
          ></NPopover>
        )}
        {shortcutKeysEnable.value && (
          <NPopover
            v-slots={{
              default: () => '键盘快捷键',
              trigger: () => (
                <NButton onClick={() => openShortcutKeysModel()}>
                  <LucideIcon name="Keyboard" size={16}></LucideIcon>
                </NButton>
              )
            }}
          ></NPopover>
        )}
      </NButtonGroup>
    )
  }
})

export default ExternalTools
