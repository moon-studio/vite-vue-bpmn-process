import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider'
import Logger from '@/utils/Logger'

class CustomRules extends RuleProvider {
  private _customRules
  constructor(eventBus, customRules) {
    super(eventBus)
    this._customRules = customRules
  }

  protected init() {
    function preventEvent() {
      return false
    }

    this.addRule(['shape.delete'], 1234, function () {
      Logger.prettyInfo(' remove ')
      return preventEvent
    })
  }
}

export default CustomRules
