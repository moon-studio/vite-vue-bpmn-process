const configModel = { appendAnything: true }

customPalette.$inject = [
  'config.connectorsExtension',
  'injector',
  'create',
  'contextPad',
  'translate',
  'elementTemplatesLoader',
  'replaceMenu',
  'appendMenu',
  'createMenu',
  'palette'
]

///////////////////////////////////////////////////////////////////////////////////////////// ElementTemplatesLoader
/**
 * ## bpmn-js-properties-panel/src/provider/element-templates/ElementTemplatesLoader.js
 */
import { isFunction, isUndefined } from 'min-dash'
import { Validator } from './Validator'

/**
 * The guy responsible for template loading.
 *
 * Provide the actual templates via the `config.elementTemplates`.
 *
 * That configuration can either be an array of template
 * descriptors or a node style callback to retrieve
 * the templates asynchronously.
 *
 * @param {Array<TemplateDescriptor>|Function} loadTemplates
 * @param {EventBus} eventBus
 * @param {ElementTemplates} elementTemplates
 * @param {Moddle} moddle
 */
export default class ElementTemplatesLoader {
  constructor(loadTemplates, eventBus, elementTemplates, moddle) {
    this._loadTemplates = loadTemplates
    this._eventBus = eventBus
    this._elementTemplates = elementTemplates
    this._moddle = moddle

    eventBus.on('diagram.init', () => {
      this.reload()
    })
  }

  reload() {
    const loadTemplates = this._loadTemplates

    // no templates specified
    if (isUndefined(loadTemplates)) {
      return
    }

    // template loader function specified
    if (isFunction(loadTemplates)) {
      return loadTemplates((err, templates) => {
        if (err) {
          return this.templateErrors([err])
        }

        this.setTemplates(templates)
      })
    }

    // templates array specified
    if (loadTemplates.length) {
      return this.setTemplates(loadTemplates)
    }
  }

  setTemplates(templates) {
    const elementTemplates = this._elementTemplates,
      moddle = this._moddle

    const validator = new Validator(moddle).addAll(templates)

    const errors = validator.getErrors(),
      validTemplates = validator.getValidTemplates()

    elementTemplates.set(validTemplates)

    if (errors.length) {
      this.templateErrors(errors)
    }

    this.templatesChanged()
  }

  templatesChanged() {
    this._eventBus.fire('elementTemplates.changed')
  }

  templateErrors(errors) {
    this._eventBus.fire('elementTemplates.errors', {
      errors: errors
    })
  }
}

ElementTemplatesLoader.$inject = ['config.elementTemplates', 'eventBus', 'elementTemplates', 'moddle']

///////////////////////////////////////////////////////////////////////////////////////////// ElementTemplates
function CreateMenu(elementTemplates, elementFactory, injector, changeMenu) {
  this._elementTemplates = elementTemplates
  this._elementFactory = elementFactory
  this._injector = injector
  this._changeMenu = changeMenu
}

function ChangeMenu(injector, eventBus) {
  this._injector = injector
  this._eventBus = eventBus
  this._container = this._createContainer({})

  this._eventBus.on('diagram.destroy', function () {
    this._destroy()
  })

  this._eventBus.on('element.changed', function (e) {
    const t = this._open && this._open.element
    injector.element === t && n._refresh()
  })

  this._eventBus.on('changeMenu.open', function () {
    const t = injector.get('directEditing', !1)
    t && t.cancel()
    const n = injector.get('popupMenu', !1)
    n && n.close()
  })
}
ChangeMenu.$inject = ['injector', 'eventBus']
ChangeMenu.prototype._refresh = function () {
  var e = this,
    t = this._open,
    n = t.renderFn,
    r = t.position,
    i = t.className,
    o =
      r &&
      function (t) {
        return e._ensureVisible(t, r)
      },
    a = function (t) {
      return e.close(t)
    }
  GN(
    ZN(
      CI ||
        (CI = nN([
          '\n      <',
          '\n        onClose=',
          '\n        position=',
          '\n        className=',
          '\n      >\n        ',
          '\n      </',
          '>\n    '
        ])),
      _L,
      a,
      o,
      i,
      n(a),
      ChangeMenu
    ),
    this._container
  )
}
ChangeMenu.prototype.open = function (e) {
  var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {},
    n = t.position,
    r = t.className,
    i = t.element
  this._open && this.close()
  var o = wL(),
    a = o.promise,
    s = o.resolve
  return (
    (this._open = { renderFn: e, promise: a, resolve: s, position: n, className: r, element: i }),
    this._emit('open'),
    this._refresh(),
    this._open.promise
  )
}
ChangeMenu.prototype.close = function (e) {
  var t = this._open
  t && (this._emit('close'), this.reset(), (this._open = null), t && t.resolve(e))
}
ChangeMenu.prototype.reset = function () {
  GN(null, this._container)
}
ChangeMenu.prototype._emit = function (e, t) {
  this._eventBus.fire('changeMenu.'.concat(e), t)
}
ChangeMenu.prototype._createContainer = function (e) {
  var t = (e && e.parent) || 'body'
  'string' == typeof t && (t = document.querySelector(t))
  var n = ye('<div class="cmd-change-menu-parent"></div>')
  return t.appendChild(n), n
}
ChangeMenu.prototype._destroy = function () {
  _e(this._container)
}
ChangeMenu.prototype._ensureVisible = function (e, t) {
  var n = document.documentElement.getBoundingClientRect(),
    r = e.getBoundingClientRect(),
    i = {},
    o = t.x,
    a = t.y
  return (
    t.x + r.width > n.width && (i.x = !0),
    t.y + r.height > n.height && (i.y = !0),
    i.x && i.y
      ? ((o = t.x - r.width), (a = t.y - r.height))
      : i.x
      ? ((o = t.x - r.width), (a = t.y))
      : i.y && t.y < r.height
      ? ((o = t.x), (a = 10))
      : i.y && ((o = t.x), (a = t.y - r.height)),
    { x: o, y: a }
  )
}
