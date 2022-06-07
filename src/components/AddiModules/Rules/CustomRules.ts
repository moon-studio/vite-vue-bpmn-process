import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider'
import Logger from '@/utils/Logger'

class CustomRules extends RuleProvider {
  constructor(eventBus) {
    super(eventBus)
    this.init()
  }

  init() {
    Logger.prettyInfo('init')

    this.addRule(['shape.remove'], 2000, function () {
      Logger.prettyInfo(' remove ')
      return false
    })

    this.addRule(['elements.delete'], 2000, function () {
      Logger.prettyInfo(' remove ')
      return false
    })
  }
}

// @ts-ignore
CustomRules.$inject = ['eventBus']

export default CustomRules

// import EventBus from 'diagram-js/lib/core/EventBus'
// import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider'
// import Logger from '@/utils/Logger'
// import inherits from 'inherits'
//
// function CustomRules<T extends RuleProvider>(eventBus: EventBus) {
//   RuleProvider.call(this, eventBus)
// }
//
// inherits(CustomRules, RuleProvider)
//
// // @ts-ignore
// CustomRules.$inject = ['eventBus']
//
// CustomRules.prototype.init = function () {
//   this.addRule(['shape.remove'], 2000, function () {
//     Logger.prettyInfo(' remove ')
//     return false
//   })
//
//   this.addRule(['elements.delete'], 2000, function () {
//     Logger.prettyInfo(' remove ')
//     return false
//   })
// }
//
// export default CustomRules
