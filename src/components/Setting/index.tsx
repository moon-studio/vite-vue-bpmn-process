import { defineComponent, PropType } from 'vue'
import { EditorSettings } from '../../../types/editor/settings'
import { defaultSettings } from '@/config'
import { NIcon } from 'naive-ui'
import SettingsRound from '@vicons/material/SettingsRound'
import { Icon } from '@vicons/utils'

const props = {
  settings: {
    type: Object as PropType<EditorSettings>,
    default: () => defaultSettings
  }
}

const Setting = defineComponent({
  props: props,
  setup() {
    return () => (
      <div class="setting">
        <div class="toggle-button">
          <NIcon size={40} color="#ffffff">
            <Icon>
              <SettingsRound></SettingsRound>
            </Icon>
          </NIcon>
        </div>
      </div>
    )
  }
})

export default Setting
