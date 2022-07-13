import { defineComponent } from 'vue'
import { NButtonGroup } from 'naive-ui'
import Imports from '@/components/Toolbar/components/Imports'
import Exports from '@/components/Toolbar/components/Exports'
import Previews from '@/components/Toolbar/components/Previews'
import Aligns from '@/components/Toolbar/components/Aligns'
import Scales from '@/components/Toolbar/components/Scales'
import Commands from '@/components/Toolbar/components/Commands'
import ExternalTools from '@/components/Toolbar/components/ExternalTools'

const Toolbar = defineComponent({
  name: 'ToolBar',
  setup() {
    return () => (
      <div class="toolbar">
        <NButtonGroup>
          <Imports></Imports>
          <Exports></Exports>
          <Previews></Previews>
        </NButtonGroup>
        <Aligns></Aligns>
        <Scales></Scales>
        <Commands></Commands>
        <ExternalTools></ExternalTools>
      </div>
    )
  }
})

export default Toolbar
