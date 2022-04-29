import { defineComponent } from 'vue'
import Imports from '@/components/Toolbar/components/Imports'
import Exports from '@/components/Toolbar/components/Exports'
import Previews from '@/components/Toolbar/components/Previews'
import Scales from '@/components/Toolbar/components/Scales'
import Commands from '@/components/Toolbar/components/Commands'

const Toolbar = defineComponent({
  setup() {
    return () => (
      <div class="toolbar">
        <Imports></Imports>
        <Exports></Exports>
        <Previews></Previews>
        <Scales></Scales>
        <Commands></Commands>
      </div>
    )
  }
})

export default Toolbar
