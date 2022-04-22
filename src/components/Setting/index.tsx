import { defineComponent } from 'vue'

const props = {
  title: {
    type: String,
    default: ''
  },
  value: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  onChange: {
    type: Function,
    default: () => {}
  }
}

const Setting = defineComponent({
  props: {},
  setup() {
    return () => <div class="setting">setting</div>
  }
})

export default Setting
