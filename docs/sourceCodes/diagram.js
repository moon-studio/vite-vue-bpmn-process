;(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
    ? define(factory)
    : ((global = typeof globalThis !== 'undefined' ? globalThis : global || self),
      (global.DiagramJS = factory()))
})(this, function () {
  'use strict'

  var CLASS_PATTERN = /^class /

  function isClass(fn) {
    return CLASS_PATTERN.test(fn.toString())
  }

  function isArray$1(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]'
  }

  function hasOwnProp(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop)
  }

  function annotate() {
    var args = Array.prototype.slice.call(arguments)

    if (args.length === 1 && isArray$1(args[0])) {
      args = args[0]
    }

    var fn = args.pop()

    fn.$inject = args

    return fn
  }

  // Current limitations:
  // - can't put into "function arg" comments
  // function /* (no parenthesis like this) */ (){}
  // function abc( /* xx (no parenthesis like this) */ a, b) {}
  //
  // Just put the comment before function or inside:
  // /* (((this is fine))) */ function(a, b) {}
  // function abc(a) { /* (((this is fine))) */}
  //
  // - can't reliably auto-annotate constructor; we'll match the
  // first constructor(...) pattern found which may be the one
  // of a nested class, too.

  var CONSTRUCTOR_ARGS = /constructor\s*[^(]*\(\s*([^)]*)\)/m
  var FN_ARGS = /^(?:async )?(?:function\s*)?[^(]*\(\s*([^)]*)\)/m
  var FN_ARG = /\/\*([^*]*)\*\//m

  function parseAnnotations(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Cannot annotate "' + fn + '". Expected a function!')
    }

    var match = fn.toString().match(isClass(fn) ? CONSTRUCTOR_ARGS : FN_ARGS)

    // may parse class without constructor
    if (!match) {
      return []
    }

    return (
      (match[1] &&
        match[1].split(',').map(function (arg) {
          match = arg.match(FN_ARG)
          return match ? match[1].trim() : arg.trim()
        })) ||
      []
    )
  }

  function Module() {
    var providers = []

    this.factory = function (name, factory) {
      providers.push([name, 'factory', factory])
      return this
    }

    this.value = function (name, value) {
      providers.push([name, 'value', value])
      return this
    }

    this.type = function (name, type) {
      providers.push([name, 'type', type])
      return this
    }

    this.forEach = function (iterator) {
      providers.forEach(iterator)
    }
  }

  function Injector(modules, parent) {
    parent = parent || {
      get: function (name, strict) {
        currentlyResolving.push(name)

        if (strict === false) {
          return null
        } else {
          throw error('No provider for "' + name + '"!')
        }
      }
    }

    var currentlyResolving = []
    var providers = (this._providers = Object.create(parent._providers || null))
    var instances = (this._instances = Object.create(null))

    var self = (instances.injector = this)

    var error = function (msg) {
      var stack = currentlyResolving.join(' -> ')
      currentlyResolving.length = 0
      return new Error(stack ? msg + ' (Resolving: ' + stack + ')' : msg)
    }

    /**
     * Return a named service.
     *
     * @param {String} name
     * @param {Boolean} [strict=true] if false, resolve missing services to null
     *
     * @return {Object}
     */
    var get = function (name, strict) {
      if (!providers[name] && name.indexOf('.') !== -1) {
        var parts = name.split('.')
        var pivot = get(parts.shift())

        while (parts.length) {
          pivot = pivot[parts.shift()]
        }

        return pivot
      }

      if (hasOwnProp(instances, name)) {
        return instances[name]
      }

      if (hasOwnProp(providers, name)) {
        if (currentlyResolving.indexOf(name) !== -1) {
          currentlyResolving.push(name)
          throw error('Cannot resolve circular dependency!')
        }

        currentlyResolving.push(name)
        instances[name] = providers[name][0](providers[name][1])
        currentlyResolving.pop()

        return instances[name]
      }

      return parent.get(name, strict)
    }

    var fnDef = function (fn, locals) {
      if (typeof locals === 'undefined') {
        locals = {}
      }

      if (typeof fn !== 'function') {
        if (isArray$1(fn)) {
          fn = annotate(fn.slice())
        } else {
          throw new Error('Cannot invoke "' + fn + '". Expected a function!')
        }
      }

      var inject = fn.$inject || parseAnnotations(fn)
      var dependencies = inject.map(function (dep) {
        if (hasOwnProp(locals, dep)) {
          return locals[dep]
        } else {
          return get(dep)
        }
      })

      return {
        fn: fn,
        dependencies: dependencies
      }
    }

    var instantiate = function (Type) {
      var def = fnDef(Type)

      var fn = def.fn,
        dependencies = def.dependencies

      // instantiate var args constructor
      var Constructor = Function.prototype.bind.apply(fn, [null].concat(dependencies))

      return new Constructor()
    }

    var invoke = function (func, context, locals) {
      var def = fnDef(func, locals)

      var fn = def.fn,
        dependencies = def.dependencies

      return fn.apply(context, dependencies)
    }

    var createPrivateInjectorFactory = function (privateChildInjector) {
      return annotate(function (key) {
        return privateChildInjector.get(key)
      })
    }

    var createChild = function (modules, forceNewInstances) {
      if (forceNewInstances && forceNewInstances.length) {
        var fromParentModule = Object.create(null)
        var matchedScopes = Object.create(null)

        var privateInjectorsCache = []
        var privateChildInjectors = []
        var privateChildFactories = []

        var provider
        var cacheIdx
        var privateChildInjector
        var privateChildInjectorFactory
        for (var name in providers) {
          provider = providers[name]

          if (forceNewInstances.indexOf(name) !== -1) {
            if (provider[2] === 'private') {
              cacheIdx = privateInjectorsCache.indexOf(provider[3])
              if (cacheIdx === -1) {
                privateChildInjector = provider[3].createChild([], forceNewInstances)
                privateChildInjectorFactory = createPrivateInjectorFactory(privateChildInjector)
                privateInjectorsCache.push(provider[3])
                privateChildInjectors.push(privateChildInjector)
                privateChildFactories.push(privateChildInjectorFactory)
                fromParentModule[name] = [
                  privateChildInjectorFactory,
                  name,
                  'private',
                  privateChildInjector
                ]
              } else {
                fromParentModule[name] = [
                  privateChildFactories[cacheIdx],
                  name,
                  'private',
                  privateChildInjectors[cacheIdx]
                ]
              }
            } else {
              fromParentModule[name] = [provider[2], provider[1]]
            }
            matchedScopes[name] = true
          }

          if ((provider[2] === 'factory' || provider[2] === 'type') && provider[1].$scope) {
            /* jshint -W083 */
            forceNewInstances.forEach(function (scope) {
              if (provider[1].$scope.indexOf(scope) !== -1) {
                fromParentModule[name] = [provider[2], provider[1]]
                matchedScopes[scope] = true
              }
            })
          }
        }

        forceNewInstances.forEach(function (scope) {
          if (!matchedScopes[scope]) {
            throw new Error('No provider for "' + scope + '". Cannot use provider from the parent!')
          }
        })

        modules.unshift(fromParentModule)
      }

      return new Injector(modules, self)
    }

    var factoryMap = {
      factory: invoke,
      type: instantiate,
      value: function (value) {
        return value
      }
    }

    modules.forEach(function (module) {
      function arrayUnwrap(type, value) {
        if (type !== 'value' && isArray$1(value)) {
          value = annotate(value.slice())
        }

        return value
      }

      // TODO(vojta): handle wrong inputs (modules)
      if (module instanceof Module) {
        module.forEach(function (provider) {
          var name = provider[0]
          var type = provider[1]
          var value = provider[2]

          providers[name] = [factoryMap[type], arrayUnwrap(type, value), type]
        })
      } else if (typeof module === 'object') {
        if (module.__exports__) {
          var clonedModule = Object.keys(module).reduce(function (m, key) {
            if (key.substring(0, 2) !== '__') {
              m[key] = module[key]
            }
            return m
          }, Object.create(null))

          var privateInjector = new Injector(
            (module.__modules__ || []).concat([clonedModule]),
            self
          )
          var getFromPrivateInjector = annotate(function (key) {
            return privateInjector.get(key)
          })
          module.__exports__.forEach(function (key) {
            providers[key] = [getFromPrivateInjector, key, 'private', privateInjector]
          })
        } else {
          Object.keys(module).forEach(function (name) {
            if (module[name][2] === 'private') {
              providers[name] = module[name]
              return
            }

            var type = module[name][0]
            var value = module[name][1]

            providers[name] = [factoryMap[type], arrayUnwrap(type, value), type]
          })
        }
      }
    })

    // public API
    this.get = get
    this.invoke = invoke
    this.instantiate = instantiate
    this.createChild = createChild
  }

  function getDefaultExportFromCjs(x) {
    return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default')
      ? x['default']
      : x
  }

  var inherits_browser = { exports: {} }

  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    inherits_browser.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        })
      }
    }
  } else {
    // old school shim for old browsers
    inherits_browser.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor
        var TempCtor = function () {}
        TempCtor.prototype = superCtor.prototype
        ctor.prototype = new TempCtor()
        ctor.prototype.constructor = ctor
      }
    }
  }

  var DEFAULT_RENDER_PRIORITY$1 = 1000

  /**
   * The base implementation of shape and connection renderers.
   *
   * @param {EventBus} eventBus
   * @param {number} [renderPriority=1000]
   */
  function BaseRenderer(eventBus, renderPriority) {
    var self = this

    renderPriority = renderPriority || DEFAULT_RENDER_PRIORITY$1

    eventBus.on(['render.shape', 'render.connection'], renderPriority, function (evt, context) {
      var type = evt.type,
        element = context.element,
        visuals = context.gfx,
        attrs = context.attrs

      if (self.canRender(element)) {
        if (type === 'render.shape') {
          return self.drawShape(visuals, element, attrs)
        } else {
          return self.drawConnection(visuals, element, attrs)
        }
      }
    })

    eventBus.on(
      ['render.getShapePath', 'render.getConnectionPath'],
      renderPriority,
      function (evt, element) {
        if (self.canRender(element)) {
          if (evt.type === 'render.getShapePath') {
            return self.getShapePath(element)
          } else {
            return self.getConnectionPath(element)
          }
        }
      }
    )
  }

  /**
   * Should check whether *this* renderer can render
   * the element/connection.
   *
   * @param {element} element
   *
   * @returns {boolean}
   */
  BaseRenderer.prototype.canRender = function () {}

  /**
   * Provides the shape's snap svg element to be drawn on the `canvas`.
   *
   * @param {djs.Graphics} visuals
   * @param {Shape} shape
   *
   * @returns {Snap.svg} [returns a Snap.svg paper element ]
   */
  BaseRenderer.prototype.drawShape = function () {}

  /**
   * Provides the shape's snap svg element to be drawn on the `canvas`.
   *
   * @param {djs.Graphics} visuals
   * @param {Connection} connection
   *
   * @returns {Snap.svg} [returns a Snap.svg paper element ]
   */
  BaseRenderer.prototype.drawConnection = function () {}

  /**
   * Gets the SVG path of a shape that represents it's visual bounds.
   *
   * @param {Shape} shape
   *
   * @return {string} svg path
   */
  BaseRenderer.prototype.getShapePath = function () {}

  /**
   * Gets the SVG path of a connection that represents it's visual bounds.
   *
   * @param {Connection} connection
   *
   * @return {string} svg path
   */
  BaseRenderer.prototype.getConnectionPath = function () {}

  function ensureImported(element, target) {
    if (element.ownerDocument !== target.ownerDocument) {
      try {
        // may fail on webkit
        return target.ownerDocument.importNode(element, true)
      } catch (e) {
        // ignore
      }
    }

    return element
  }

  /**
   * appendTo utility
   */

  /**
   * Append a node to a target element and return the appended node.
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} target
   *
   * @return {SVGElement} the appended node
   */
  function appendTo(element, target) {
    return target.appendChild(ensureImported(element, target))
  }

  /**
   * append utility
   */

  /**
   * Append a node to an element
   *
   * @param  {SVGElement} element
   * @param  {SVGElement} node
   *
   * @return {SVGElement} the element
   */
  function append(target, node) {
    appendTo(node, target)
    return target
  }

  /**
   * attribute accessor utility
   */

  var LENGTH_ATTR = 2

  var CSS_PROPERTIES = {
    'alignment-baseline': 1,
    'baseline-shift': 1,
    clip: 1,
    'clip-path': 1,
    'clip-rule': 1,
    color: 1,
    'color-interpolation': 1,
    'color-interpolation-filters': 1,
    'color-profile': 1,
    'color-rendering': 1,
    cursor: 1,
    direction: 1,
    display: 1,
    'dominant-baseline': 1,
    'enable-background': 1,
    fill: 1,
    'fill-opacity': 1,
    'fill-rule': 1,
    filter: 1,
    'flood-color': 1,
    'flood-opacity': 1,
    font: 1,
    'font-family': 1,
    'font-size': LENGTH_ATTR,
    'font-size-adjust': 1,
    'font-stretch': 1,
    'font-style': 1,
    'font-variant': 1,
    'font-weight': 1,
    'glyph-orientation-horizontal': 1,
    'glyph-orientation-vertical': 1,
    'image-rendering': 1,
    kerning: 1,
    'letter-spacing': 1,
    'lighting-color': 1,
    marker: 1,
    'marker-end': 1,
    'marker-mid': 1,
    'marker-start': 1,
    mask: 1,
    opacity: 1,
    overflow: 1,
    'pointer-events': 1,
    'shape-rendering': 1,
    'stop-color': 1,
    'stop-opacity': 1,
    stroke: 1,
    'stroke-dasharray': 1,
    'stroke-dashoffset': 1,
    'stroke-linecap': 1,
    'stroke-linejoin': 1,
    'stroke-miterlimit': 1,
    'stroke-opacity': 1,
    'stroke-width': LENGTH_ATTR,
    'text-anchor': 1,
    'text-decoration': 1,
    'text-rendering': 1,
    'unicode-bidi': 1,
    visibility: 1,
    'word-spacing': 1,
    'writing-mode': 1
  }

  function getAttribute(node, name) {
    if (CSS_PROPERTIES[name]) {
      return node.style[name]
    } else {
      return node.getAttributeNS(null, name)
    }
  }

  function setAttribute(node, name, value) {
    var hyphenated = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

    var type = CSS_PROPERTIES[hyphenated]

    if (type) {
      // append pixel unit, unless present
      if (type === LENGTH_ATTR && typeof value === 'number') {
        value = String(value) + 'px'
      }

      node.style[hyphenated] = value
    } else {
      node.setAttributeNS(null, name, value)
    }
  }

  function setAttributes(node, attrs) {
    var names = Object.keys(attrs),
      i,
      name

    for (i = 0, name; (name = names[i]); i++) {
      setAttribute(node, name, attrs[name])
    }
  }

  /**
   * Gets or sets raw attributes on a node.
   *
   * @param  {SVGElement} node
   * @param  {Object} [attrs]
   * @param  {String} [name]
   * @param  {String} [value]
   *
   * @return {String}
   */
  function attr(node, name, value) {
    if (typeof name === 'string') {
      if (value !== undefined) {
        setAttribute(node, name, value)
      } else {
        return getAttribute(node, name)
      }
    } else {
      setAttributes(node, name)
    }

    return node
  }

  /**
   * Clear utility
   */
  function index(arr, obj) {
    if (arr.indexOf) {
      return arr.indexOf(obj)
    }

    for (var i = 0; i < arr.length; ++i) {
      if (arr[i] === obj) {
        return i
      }
    }

    return -1
  }

  var re = /\s+/

  var toString = Object.prototype.toString

  function defined(o) {
    return typeof o !== 'undefined'
  }

  /**
   * Wrap `el` in a `ClassList`.
   *
   * @param {Element} el
   * @return {ClassList}
   * @api public
   */

  function classes(el) {
    return new ClassList(el)
  }

  function ClassList(el) {
    if (!el || !el.nodeType) {
      throw new Error('A DOM element reference is required')
    }
    this.el = el
    this.list = el.classList
  }

  /**
   * Add class `name` if not already present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.add = function (name) {
    // classList
    if (this.list) {
      this.list.add(name)
      return this
    }

    // fallback
    var arr = this.array()
    var i = index(arr, name)
    if (!~i) {
      arr.push(name)
    }

    if (defined(this.el.className.baseVal)) {
      this.el.className.baseVal = arr.join(' ')
    } else {
      this.el.className = arr.join(' ')
    }

    return this
  }

  /**
   * Remove class `name` when present, or
   * pass a regular expression to remove
   * any which match.
   *
   * @param {String|RegExp} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.remove = function (name) {
    if ('[object RegExp]' === toString.call(name)) {
      return this.removeMatching(name)
    }

    // classList
    if (this.list) {
      this.list.remove(name)
      return this
    }

    // fallback
    var arr = this.array()
    var i = index(arr, name)
    if (~i) {
      arr.splice(i, 1)
    }
    this.el.className.baseVal = arr.join(' ')
    return this
  }

  /**
   * Remove all classes matching `re`.
   *
   * @param {RegExp} re
   * @return {ClassList}
   * @api private
   */

  ClassList.prototype.removeMatching = function (re) {
    var arr = this.array()
    for (var i = 0; i < arr.length; i++) {
      if (re.test(arr[i])) {
        this.remove(arr[i])
      }
    }
    return this
  }

  /**
   * Toggle class `name`, can force state via `force`.
   *
   * For browsers that support classList, but do not support `force` yet,
   * the mistake will be detected and corrected.
   *
   * @param {String} name
   * @param {Boolean} force
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.toggle = function (name, force) {
    // classList
    if (this.list) {
      if (defined(force)) {
        if (force !== this.list.toggle(name, force)) {
          this.list.toggle(name) // toggle again to correct
        }
      } else {
        this.list.toggle(name)
      }
      return this
    }

    // fallback
    if (defined(force)) {
      if (!force) {
        this.remove(name)
      } else {
        this.add(name)
      }
    } else {
      if (this.has(name)) {
        this.remove(name)
      } else {
        this.add(name)
      }
    }

    return this
  }

  /**
   * Return an array of classes.
   *
   * @return {Array}
   * @api public
   */

  ClassList.prototype.array = function () {
    var className = this.el.getAttribute('class') || ''
    var str = className.replace(/^\s+|\s+$/g, '')
    var arr = str.split(re)
    if ('' === arr[0]) {
      arr.shift()
    }
    return arr
  }

  /**
   * Check if class `name` is present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */

  ClassList.prototype.has = ClassList.prototype.contains = function (name) {
    return this.list ? this.list.contains(name) : !!~index(this.array(), name)
  }

  function remove$1(element) {
    var parent = element.parentNode

    if (parent) {
      parent.removeChild(element)
    }

    return element
  }

  var ns = {
    svg: 'http://www.w3.org/2000/svg'
  }

  /**
   * DOM parsing utility
   */

  var SVG_START = '<svg xmlns="' + ns.svg + '"'

  function parse(svg) {
    var unwrap = false

    // ensure we import a valid svg document
    if (svg.substring(0, 4) === '<svg') {
      if (svg.indexOf(ns.svg) === -1) {
        svg = SVG_START + svg.substring(4)
      }
    } else {
      // namespace svg
      svg = SVG_START + '>' + svg + '</svg>'
      unwrap = true
    }

    var parsed = parseDocument(svg)

    if (!unwrap) {
      return parsed
    }

    var fragment = document.createDocumentFragment()

    var parent = parsed.firstChild

    while (parent.firstChild) {
      fragment.appendChild(parent.firstChild)
    }

    return fragment
  }

  function parseDocument(svg) {
    var parser

    // parse
    parser = new DOMParser()
    parser.async = false

    return parser.parseFromString(svg, 'text/xml')
  }

  /**
   * Create utility for SVG elements
   */

  /**
   * Create a specific type from name or SVG markup.
   *
   * @param {String} name the name or markup of the element
   * @param {Object} [attrs] attributes to set on the element
   *
   * @returns {SVGElement}
   */
  function create$1(name, attrs) {
    var element

    if (name.charAt(0) === '<') {
      element = parse(name).firstChild
      element = document.importNode(element, true)
    } else {
      element = document.createElementNS(ns.svg, name)
    }

    if (attrs) {
      attr(element, attrs)
    }

    return element
  }

  /**
   * Geometry helpers
   */

  // fake node used to instantiate svg geometry elements
  var node = create$1('svg')

  function extend$1(object, props) {
    var i,
      k,
      keys = Object.keys(props)

    for (i = 0; (k = keys[i]); i++) {
      object[k] = props[k]
    }

    return object
  }

  /**
   * Create matrix via args.
   *
   * @example
   *
   * createMatrix({ a: 1, b: 1 });
   * createMatrix();
   * createMatrix(1, 2, 0, 0, 30, 20);
   *
   * @return {SVGMatrix}
   */
  function createMatrix(a, b, c, d, e, f) {
    var matrix = node.createSVGMatrix()

    switch (arguments.length) {
      case 0:
        return matrix
      case 1:
        return extend$1(matrix, a)
      case 6:
        return extend$1(matrix, {
          a: a,
          b: b,
          c: c,
          d: d,
          e: e,
          f: f
        })
    }
  }

  function createTransform(matrix) {
    if (matrix) {
      return node.createSVGTransformFromMatrix(matrix)
    } else {
      return node.createSVGTransform()
    }
  }

  /**
   * transform accessor utility
   */

  function wrapMatrix(transformList, transform) {
    if (transform instanceof SVGMatrix) {
      return transformList.createSVGTransformFromMatrix(transform)
    }

    return transform
  }

  function setTransforms(transformList, transforms) {
    var i, t

    transformList.clear()

    for (i = 0; (t = transforms[i]); i++) {
      transformList.appendItem(wrapMatrix(transformList, t))
    }
  }

  /**
   * Get or set the transforms on the given node.
   *
   * @param {SVGElement} node
   * @param  {SVGTransform|SVGMatrix|Array<SVGTransform|SVGMatrix>} [transforms]
   *
   * @return {SVGTransform} the consolidated transform
   */
  function transform(node, transforms) {
    var transformList = node.transform.baseVal

    if (transforms) {
      if (!Array.isArray(transforms)) {
        transforms = [transforms]
      }

      setTransforms(transformList, transforms)
    }

    return transformList.consolidate()
  }

  function componentsToPath(elements) {
    return elements.join(',').replace(/,?([A-z]),?/g, '$1')
  }

  function toSVGPoints(points) {
    var result = ''

    for (var i = 0, p; (p = points[i]); i++) {
      result += p.x + ',' + p.y + ' '
    }

    return result
  }

  function createLine(points, attrs) {
    var line = create$1('polyline')
    attr(line, { points: toSVGPoints(points) })

    if (attrs) {
      attr(line, attrs)
    }

    return line
  }

  /**
   * Flatten array, one level deep.
   *
   * @param {Array<?>} arr
   *
   * @return {Array<?>}
   */

  var nativeToString = Object.prototype.toString
  var nativeHasOwnProperty = Object.prototype.hasOwnProperty
  function isUndefined(obj) {
    return obj === undefined
  }
  function isDefined(obj) {
    return obj !== undefined
  }
  function isArray(obj) {
    return nativeToString.call(obj) === '[object Array]'
  }
  function isNumber(obj) {
    return nativeToString.call(obj) === '[object Number]'
  }
  function isFunction(obj) {
    var tag = nativeToString.call(obj)
    return (
      tag === '[object Function]' ||
      tag === '[object AsyncFunction]' ||
      tag === '[object GeneratorFunction]' ||
      tag === '[object AsyncGeneratorFunction]' ||
      tag === '[object Proxy]'
    )
  }
  /**
   * Return true, if target owns a property with the given key.
   *
   * @param {Object} target
   * @param {String} key
   *
   * @return {Boolean}
   */

  function has(target, key) {
    return nativeHasOwnProperty.call(target, key)
  }

  /**
   * Find element in collection.
   *
   * @param  {Array|Object} collection
   * @param  {Function|Object} matcher
   *
   * @return {Object}
   */

  function find(collection, matcher) {
    matcher = toMatcher(matcher)
    var match
    forEach(collection, function (val, key) {
      if (matcher(val, key)) {
        match = val
        return false
      }
    })
    return match
  }
  /**
   * Iterate over collection; returning something
   * (non-undefined) will stop iteration.
   *
   * @param  {Array|Object} collection
   * @param  {Function} iterator
   *
   * @return {Object} return result that stopped the iteration
   */

  function forEach(collection, iterator) {
    var val, result

    if (isUndefined(collection)) {
      return
    }

    var convertKey = isArray(collection) ? toNum : identity

    for (var key in collection) {
      if (has(collection, key)) {
        val = collection[key]
        result = iterator(val, convertKey(key))

        if (result === false) {
          return val
        }
      }
    }
  }
  /**
   * Reduce collection, returning a single result.
   *
   * @param  {Object|Array} collection
   * @param  {Function} iterator
   * @param  {Any} result
   *
   * @return {Any} result returned from last iterator
   */

  function reduce(collection, iterator, result) {
    forEach(collection, function (value, idx) {
      result = iterator(result, value, idx)
    })
    return result
  }
  /**
   * Return true if every element in the collection
   * matches the criteria.
   *
   * @param  {Object|Array} collection
   * @param  {Function} matcher
   *
   * @return {Boolean}
   */

  function every(collection, matcher) {
    return !!reduce(
      collection,
      function (matches, val, key) {
        return matches && matcher(val, key)
      },
      true
    )
  }

  function toMatcher(matcher) {
    return isFunction(matcher)
      ? matcher
      : function (e) {
          return e === matcher
        }
  }

  function identity(arg) {
    return arg
  }

  function toNum(arg) {
    return Number(arg)
  }

  /**
   * Debounce fn, calling it only once if the given time
   * elapsed between calls.
   *
   * Lodash-style the function exposes methods to `#clear`
   * and `#flush` to control internal behavior.
   *
   * @param  {Function} fn
   * @param  {Number} timeout
   *
   * @return {Function} debounced function
   */
  function debounce(fn, timeout) {
    var timer
    var lastArgs
    var lastThis
    var lastNow

    function fire(force) {
      var now = Date.now()
      var scheduledDiff = force ? 0 : lastNow + timeout - now

      if (scheduledDiff > 0) {
        return schedule(scheduledDiff)
      }

      fn.apply(lastThis, lastArgs)
      clear()
    }

    function schedule(timeout) {
      timer = setTimeout(fire, timeout)
    }

    function clear() {
      if (timer) {
        clearTimeout(timer)
      }

      timer = lastNow = lastArgs = lastThis = undefined
    }

    function flush() {
      if (timer) {
        fire(true)
      }

      clear()
    }

    function callback() {
      lastNow = Date.now()

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key]
      }

      lastArgs = args
      lastThis = this // ensure an execution is scheduled

      if (!timer) {
        schedule(timeout)
      }
    }

    callback.flush = flush
    callback.cancel = clear
    return callback
  }
  /**
   * Bind function against target <this>.
   *
   * @param  {Function} fn
   * @param  {Object}   target
   *
   * @return {Function} bound function
   */

  function bind(fn, target) {
    return fn.bind(target)
  }

  function _extends() {
    _extends =
      Object.assign ||
      function (target) {
        for (var i = 1; i < arguments.length; i++) {
          var source = arguments[i]

          for (var key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
              target[key] = source[key]
            }
          }
        }

        return target
      }

    return _extends.apply(this, arguments)
  }

  /**
   * Convenience wrapper for `Object.assign`.
   *
   * @param {Object} target
   * @param {...Object} others
   *
   * @return {Object} the target
   */

  function assign(target) {
    for (
      var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1;
      _key < _len;
      _key++
    ) {
      others[_key - 1] = arguments[_key]
    }

    return _extends.apply(void 0, [target].concat(others))
  }

  /**
   * Returns the surrounding bbox for all elements in
   * the array or the element primitive.
   *
   * @param {Array<djs.model.Shape>|djs.model.Shape} elements
   * @param {boolean} stopRecursion
   */
  function getBBox(elements, stopRecursion) {
    stopRecursion = !!stopRecursion
    if (!isArray(elements)) {
      elements = [elements]
    }

    var minX, minY, maxX, maxY

    forEach(elements, function (element) {
      // If element is a connection the bbox must be computed first
      var bbox = element
      if (element.waypoints && !stopRecursion) {
        bbox = getBBox(element.waypoints, true)
      }

      var x = bbox.x,
        y = bbox.y,
        height = bbox.height || 0,
        width = bbox.width || 0

      if (x < minX || minX === undefined) {
        minX = x
      }
      if (y < minY || minY === undefined) {
        minY = y
      }

      if (x + width > maxX || maxX === undefined) {
        maxX = x + width
      }
      if (y + height > maxY || maxY === undefined) {
        maxY = y + height
      }
    })

    return {
      x: minX,
      y: minY,
      height: maxY - minY,
      width: maxX - minX
    }
  }

  function getType(element) {
    if ('waypoints' in element) {
      return 'connection'
    }

    if ('x' in element) {
      return 'shape'
    }

    return 'root'
  }

  function isFrameElement(element) {
    return !!(element && element.isFrame)
  }

  // apply default renderer with lowest possible priority
  // so that it only kicks in if noone else could render
  var DEFAULT_RENDER_PRIORITY = 1

  /**
   * The default renderer used for shapes and connections.
   *
   * @param {EventBus} eventBus
   * @param {Styles} styles
   */
  function DefaultRenderer(eventBus, styles) {
    //
    BaseRenderer.call(this, eventBus, DEFAULT_RENDER_PRIORITY)

    this.CONNECTION_STYLE = styles.style(['no-fill'], { strokeWidth: 5, stroke: 'fuchsia' })
    this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 })
    this.FRAME_STYLE = styles.style(['no-fill'], {
      stroke: 'fuchsia',
      strokeDasharray: 4,
      strokeWidth: 2
    })
  }

  inherits_browser.exports(DefaultRenderer, BaseRenderer)

  DefaultRenderer.prototype.canRender = function () {
    return true
  }

  DefaultRenderer.prototype.drawShape = function drawShape(visuals, element, attrs) {
    var rect = create$1('rect')

    attr(rect, {
      x: 0,
      y: 0,
      width: element.width || 0,
      height: element.height || 0
    })

    if (isFrameElement(element)) {
      attr(rect, assign({}, this.FRAME_STYLE, attrs || {}))
    } else {
      attr(rect, assign({}, this.SHAPE_STYLE, attrs || {}))
    }

    append(visuals, rect)

    return rect
  }

  DefaultRenderer.prototype.drawConnection = function drawConnection(visuals, connection, attrs) {
    var line = createLine(connection.waypoints, assign({}, this.CONNECTION_STYLE, attrs || {}))
    append(visuals, line)

    return line
  }

  DefaultRenderer.prototype.getShapePath = function getShapePath(shape) {
    var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height

    var shapePath = [['M', x, y], ['l', width, 0], ['l', 0, height], ['l', -width, 0], ['z']]

    return componentsToPath(shapePath)
  }

  DefaultRenderer.prototype.getConnectionPath = function getConnectionPath(connection) {
    var waypoints = connection.waypoints

    var idx,
      point,
      connectionPath = []

    for (idx = 0; (point = waypoints[idx]); idx++) {
      // take invisible docking into account
      // when creating the path
      point = point.original || point

      connectionPath.push([idx === 0 ? 'M' : 'L', point.x, point.y])
    }

    return componentsToPath(connectionPath)
  }

  DefaultRenderer.$inject = ['eventBus', 'styles']

  /**
   * A component that manages shape styles
   */
  function Styles() {
    var defaultTraits = {
      'no-fill': {
        fill: 'none'
      },
      'no-border': {
        strokeOpacity: 0.0
      },
      'no-events': {
        pointerEvents: 'none'
      }
    }

    var self = this

    /**
     * Builds a style definition from a className, a list of traits and an object of additional attributes.
     *
     * @param  {string} className
     * @param  {Array<string>} traits
     * @param  {Object} additionalAttrs
     *
     * @return {Object} the style defintion
     */
    this.cls = function (className, traits, additionalAttrs) {
      var attrs = this.style(traits, additionalAttrs)

      return assign(attrs, { class: className })
    }

    /**
     * Builds a style definition from a list of traits and an object of additional attributes.
     *
     * @param  {Array<string>} traits
     * @param  {Object} additionalAttrs
     *
     * @return {Object} the style defintion
     */
    this.style = function (traits, additionalAttrs) {
      if (!isArray(traits) && !additionalAttrs) {
        additionalAttrs = traits
        traits = []
      }

      var attrs = reduce(
        traits,
        function (attrs, t) {
          return assign(attrs, defaultTraits[t] || {})
        },
        {}
      )

      return additionalAttrs ? assign(attrs, additionalAttrs) : attrs
    }

    this.computeStyle = function (custom, traits, defaultStyles) {
      if (!isArray(traits)) {
        defaultStyles = traits
        traits = []
      }

      return self.style(traits || [], assign({}, defaultStyles, custom || {}))
    }
  }

  var DrawModule = {
    __init__: ['defaultRenderer'],
    defaultRenderer: ['type', DefaultRenderer],
    styles: ['type', Styles]
  }

  /**
   * Failsafe remove an element from a collection
   *
   * @param  {Array<Object>} [collection]
   * @param  {Object} [element]
   *
   * @return {number} the previous index of the element
   */
  function remove(collection, element) {
    if (!collection || !element) {
      return -1
    }

    var idx = collection.indexOf(element)

    if (idx !== -1) {
      collection.splice(idx, 1)
    }

    return idx
  }

  /**
   * Fail save add an element to the given connection, ensuring
   * it does not yet exist.
   *
   * @param {Array<Object>} collection
   * @param {Object} element
   * @param {number} idx
   */
  function add(collection, element, idx) {
    if (!collection || !element) {
      return
    }

    if (typeof idx !== 'number') {
      idx = -1
    }

    var currentIdx = collection.indexOf(element)

    if (currentIdx !== -1) {
      if (currentIdx === idx) {
        // nothing to do, position has not changed
        return
      } else {
        if (idx !== -1) {
          // remove from current position
          collection.splice(currentIdx, 1)
        } else {
          // already exists in collection
          return
        }
      }
    }

    if (idx !== -1) {
      // insert at specified position
      collection.splice(idx, 0, element)
    } else {
      // push to end
      collection.push(element)
    }
  }

  /**
   * Convert the given bounds to a { top, left, bottom, right } descriptor.
   *
   * @param {Bounds|Point} bounds
   *
   * @return {Object}
   */
  function asTRBL(bounds) {
    return {
      top: bounds.y,
      right: bounds.x + (bounds.width || 0),
      bottom: bounds.y + (bounds.height || 0),
      left: bounds.x
    }
  }

  function round(number, resolution) {
    return Math.round(number * resolution) / resolution
  }

  function ensurePx(number) {
    return isNumber(number) ? number + 'px' : number
  }

  function findRoot(element) {
    while (element.parent) {
      element = element.parent
    }

    return element
  }

  /**
   * Creates a HTML container element for a SVG element with
   * the given configuration
   *
   * @param  {Object} options
   * @return {HTMLElement} the container element
   */
  function createContainer(options) {
    options = assign({}, { width: '100%', height: '100%' }, options)

    var container = options.container || document.body

    // create a <div> around the svg element with the respective size
    // this way we can always get the correct container size
    // (this is impossible for <svg> elements at the moment)
    var parent = document.createElement('div')
    parent.setAttribute('class', 'djs-container')

    assign(parent.style, {
      position: 'relative',
      overflow: 'hidden',
      width: ensurePx(options.width),
      height: ensurePx(options.height)
    })

    container.appendChild(parent)

    return parent
  }

  function createGroup(parent, cls, childIndex) {
    var group = create$1('g')
    classes(group).add(cls)

    var index = childIndex !== undefined ? childIndex : parent.childNodes.length - 1

    // must ensure second argument is node or _null_
    // cf. https://developer.mozilla.org/en-US/docs/Web/API/Node/insertBefore
    parent.insertBefore(group, parent.childNodes[index] || null)

    return group
  }

  var BASE_LAYER = 'base'

  // render plane contents behind utility layers
  var PLANE_LAYER_INDEX = 0
  var UTILITY_LAYER_INDEX = 1

  var REQUIRED_MODEL_ATTRS = {
    shape: ['x', 'y', 'width', 'height'],
    connection: ['waypoints']
  }

  /**
   * The main drawing canvas.
   *
   * @class
   * @constructor
   *
   * @emits Canvas#canvas.init
   *
   * @param {Object} config
   * @param {EventBus} eventBus
   * @param {GraphicsFactory} graphicsFactory
   * @param {ElementRegistry} elementRegistry
   */
  function Canvas(config, eventBus, graphicsFactory, elementRegistry) {
    this._eventBus = eventBus
    this._elementRegistry = elementRegistry
    this._graphicsFactory = graphicsFactory

    this._rootsIdx = 0

    this._layers = {}
    this._planes = []
    this._rootElement = null

    this._init(config || {})
  }

  Canvas.$inject = ['config.canvas', 'eventBus', 'graphicsFactory', 'elementRegistry']

  /**
   * Creates a <svg> element that is wrapped into a <div>.
   * This way we are always able to correctly figure out the size of the svg element
   * by querying the parent node.

   * (It is not possible to get the size of a svg element cross browser @ 2014-04-01)

   * <div class="djs-container" style="width: {desired-width}, height: {desired-height}">
   *   <svg width="100%" height="100%">
   *    ...
   *   </svg>
   * </div>
   */
  Canvas.prototype._init = function (config) {
    var eventBus = this._eventBus

    // html container
    var container = (this._container = createContainer(config))

    var svg = (this._svg = create$1('svg'))
    attr(svg, { width: '100%', height: '100%' })

    append(container, svg)

    var viewport = (this._viewport = createGroup(svg, 'viewport'))

    // debounce canvas.viewbox.changed events
    // for smoother diagram interaction
    if (config.deferUpdate !== false) {
      this._viewboxChanged = debounce(bind(this._viewboxChanged, this), 300)
    }

    eventBus.on(
      'diagram.init',
      function () {
        /**
         * An event indicating that the canvas is ready to be drawn on.
         *
         * @memberOf Canvas
         *
         * @event canvas.init
         *
         * @type {Object}
         * @property {SVGElement} svg the created svg element
         * @property {SVGElement} viewport the direct parent of diagram elements and shapes
         */
        eventBus.fire('canvas.init', {
          svg: svg,
          viewport: viewport
        })
      },
      this
    )

    // reset viewbox on shape changes to
    // recompute the viewbox
    eventBus.on(
      [
        'shape.added',
        'connection.added',
        'shape.removed',
        'connection.removed',
        'elements.changed',
        'root.set'
      ],
      function () {
        delete this._cachedViewbox
      },
      this
    )

    eventBus.on('diagram.destroy', 500, this._destroy, this)
    eventBus.on('diagram.clear', 500, this._clear, this)
  }

  Canvas.prototype._destroy = function (emit) {
    this._eventBus.fire('canvas.destroy', {
      svg: this._svg,
      viewport: this._viewport
    })

    var parent = this._container.parentNode

    if (parent) {
      parent.removeChild(this._container)
    }

    delete this._svg
    delete this._container
    delete this._layers
    delete this._planes
    delete this._rootElement
    delete this._viewport
  }

  Canvas.prototype._clear = function () {
    var self = this

    var allElements = this._elementRegistry.getAll()

    // remove all elements
    allElements.forEach(function (element) {
      var type = getType(element)

      if (type === 'root') {
        self.removeRootElement(element)
      } else {
        self._removeElement(element, type)
      }
    })

    // remove all planes
    this._planes = []
    this._rootElement = null

    // force recomputation of view box
    delete this._cachedViewbox
  }

  /**
   * Returns the default layer on which
   * all elements are drawn.
   *
   * @returns {SVGElement}
   */
  Canvas.prototype.getDefaultLayer = function () {
    return this.getLayer(BASE_LAYER, PLANE_LAYER_INDEX)
  }

  /**
   * Returns a layer that is used to draw elements
   * or annotations on it.
   *
   * Non-existing layers retrieved through this method
   * will be created. During creation, the optional index
   * may be used to create layers below or above existing layers.
   * A layer with a certain index is always created above all
   * existing layers with the same index.
   *
   * @param {string} name
   * @param {number} index
   *
   * @returns {SVGElement}
   */
  Canvas.prototype.getLayer = function (name, index) {
    if (!name) {
      throw new Error('must specify a name')
    }

    var layer = this._layers[name]

    if (!layer) {
      layer = this._layers[name] = this._createLayer(name, index)
    }

    // throw an error if layer creation / retrival is
    // requested on different index
    if (typeof index !== 'undefined' && layer.index !== index) {
      throw new Error('layer <' + name + '> already created at index <' + index + '>')
    }

    return layer.group
  }

  /**
   * For a given index, return the number of layers that have a higher index and
   * are visible.
   *
   * This is used to determine the node a layer should be inserted at.
   *
   * @param {Number} index
   * @returns {Number}
   */
  Canvas.prototype._getChildIndex = function (index) {
    return reduce(
      this._layers,
      function (childIndex, layer) {
        if (layer.visible && index >= layer.index) {
          childIndex++
        }

        return childIndex
      },
      0
    )
  }

  /**
   * Creates a given layer and returns it.
   *
   * @param {string} name
   * @param {number} [index=0]
   *
   * @return {Object} layer descriptor with { index, group: SVGGroup }
   */
  Canvas.prototype._createLayer = function (name, index) {
    if (typeof index === 'undefined') {
      index = UTILITY_LAYER_INDEX
    }

    var childIndex = this._getChildIndex(index)

    return {
      group: createGroup(this._viewport, 'layer-' + name, childIndex),
      index: index,
      visible: true
    }
  }

  /**
   * Shows a given layer.
   *
   * @param {String} layer
   * @returns {SVGElement}
   */
  Canvas.prototype.showLayer = function (name) {
    if (!name) {
      throw new Error('must specify a name')
    }

    var layer = this._layers[name]

    if (!layer) {
      throw new Error('layer <' + name + '> does not exist')
    }

    var viewport = this._viewport
    var group = layer.group
    var index = layer.index

    if (layer.visible) {
      return group
    }

    var childIndex = this._getChildIndex(index)

    viewport.insertBefore(group, viewport.childNodes[childIndex] || null)

    layer.visible = true

    return group
  }

  /**
   * Hides a given layer.
   *
   * @param {String} layer
   * @returns {SVGElement}
   */
  Canvas.prototype.hideLayer = function (name) {
    if (!name) {
      throw new Error('must specify a name')
    }

    var layer = this._layers[name]

    if (!layer) {
      throw new Error('layer <' + name + '> does not exist')
    }

    var group = layer.group

    if (!layer.visible) {
      return group
    }

    remove$1(group)

    layer.visible = false

    return group
  }

  Canvas.prototype._removeLayer = function (name) {
    var layer = this._layers[name]

    if (layer) {
      delete this._layers[name]

      remove$1(layer.group)
    }
  }

  /**
   * Returns the currently active layer. Can be null.
   *
   * @returns {SVGElement|null}
   */
  Canvas.prototype.getActiveLayer = function () {
    var plane = this._findPlaneForRoot(this.getRootElement())

    if (!plane) {
      return null
    }

    return plane.layer
  }

  /**
   * Returns the plane which contains the given element.
   *
   * @param {string|djs.model.Base} element
   *
   * @return {djs.model.Base} root for element
   */
  Canvas.prototype.findRoot = function (element) {
    if (typeof element === 'string') {
      element = this._elementRegistry.get(element)
    }

    if (!element) {
      return
    }

    var plane = this._findPlaneForRoot(findRoot(element)) || {}

    return plane.rootElement
  }

  /**
   * Return a list of all root elements on the diagram.
   *
   * @return {djs.model.Root[]}
   */
  Canvas.prototype.getRootElements = function () {
    return this._planes.map(function (plane) {
      return plane.rootElement
    })
  }

  Canvas.prototype._findPlaneForRoot = function (rootElement) {
    return find(this._planes, function (plane) {
      return plane.rootElement === rootElement
    })
  }

  /**
   * Returns the html element that encloses the
   * drawing canvas.
   *
   * @return {DOMNode}
   */
  Canvas.prototype.getContainer = function () {
    return this._container
  }

  // markers //////////////////////

  Canvas.prototype._updateMarker = function (element, marker, add) {
    var container

    if (!element.id) {
      element = this._elementRegistry.get(element)
    }

    // we need to access all
    container = this._elementRegistry._elements[element.id]

    if (!container) {
      return
    }

    forEach([container.gfx, container.secondaryGfx], function (gfx) {
      if (gfx) {
        // invoke either addClass or removeClass based on mode
        if (add) {
          classes(gfx).add(marker)
        } else {
          classes(gfx).remove(marker)
        }
      }
    })

    /**
     * An event indicating that a marker has been updated for an element
     *
     * @event element.marker.update
     * @type {Object}
     * @property {djs.model.Element} element the shape
     * @property {Object} gfx the graphical representation of the shape
     * @property {string} marker
     * @property {boolean} add true if the marker was added, false if it got removed
     */
    this._eventBus.fire('element.marker.update', {
      element: element,
      gfx: container.gfx,
      marker: marker,
      add: !!add
    })
  }

  /**
   * Adds a marker to an element (basically a css class).
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @example
   * canvas.addMarker('foo', 'some-marker');
   *
   * var fooGfx = canvas.getGraphics('foo');
   *
   * fooGfx; // <g class="... some-marker"> ... </g>
   *
   * @param {string|djs.model.Base} element
   * @param {string} marker
   */
  Canvas.prototype.addMarker = function (element, marker) {
    this._updateMarker(element, marker, true)
  }

  /**
   * Remove a marker from an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param  {string|djs.model.Base} element
   * @param  {string} marker
   */
  Canvas.prototype.removeMarker = function (element, marker) {
    this._updateMarker(element, marker, false)
  }

  /**
   * Check the existence of a marker on element.
   *
   * @param  {string|djs.model.Base} element
   * @param  {string} marker
   */
  Canvas.prototype.hasMarker = function (element, marker) {
    if (!element.id) {
      element = this._elementRegistry.get(element)
    }

    var gfx = this.getGraphics(element)

    return classes(gfx).has(marker)
  }

  /**
   * Toggles a marker on an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param  {string|djs.model.Base} element
   * @param  {string} marker
   */
  Canvas.prototype.toggleMarker = function (element, marker) {
    if (this.hasMarker(element, marker)) {
      this.removeMarker(element, marker)
    } else {
      this.addMarker(element, marker)
    }
  }

  /**
   * Returns the current root element.
   *
   * Supports two different modes for handling root elements:
   *
   * 1. if no root element has been added before, an implicit root will be added
   * and returned. This is used in applications that don't require explicit
   * root elements.
   *
   * 2. when root elements have been added before calling `getRootElement`,
   * root elements can be null. This is used for applications that want to manage
   * root elements themselves.
   *
   * @returns {Object|djs.model.Root|null} rootElement.
   */
  Canvas.prototype.getRootElement = function () {
    var rootElement = this._rootElement

    // can return null if root elements are present but none was set yet
    if (rootElement || this._planes.length) {
      return rootElement
    }

    return this.setRootElement(this.addRootElement(null))
  }

  /**
   * Adds a given root element and returns it.
   *
   * @param {Object|djs.model.Root} rootElement
   *
   * @return {Object|djs.model.Root} rootElement
   */

  Canvas.prototype.addRootElement = function (rootElement) {
    var idx = this._rootsIdx++

    if (!rootElement) {
      rootElement = {
        id: '__implicitroot_' + idx,
        children: [],
        isImplicit: true
      }
    }

    var layerName = (rootElement.layer = 'root-' + idx)

    this._ensureValid('root', rootElement)

    var layer = this.getLayer(layerName, PLANE_LAYER_INDEX)

    this.hideLayer(layerName)

    this._addRoot(rootElement, layer)

    this._planes.push({
      rootElement: rootElement,
      layer: layer
    })

    return rootElement
  }

  /**
   * Removes a given rootElement and returns it.
   *
   * @param {djs.model.Root|String} rootElement
   *
   * @return {Object|djs.model.Root} rootElement
   */
  Canvas.prototype.removeRootElement = function (rootElement) {
    if (typeof rootElement === 'string') {
      rootElement = this._elementRegistry.get(rootElement)
    }

    var plane = this._findPlaneForRoot(rootElement)

    if (!plane) {
      return
    }

    // hook up life-cycle events
    this._removeRoot(rootElement)

    // clean up layer
    this._removeLayer(rootElement.layer)

    // clean up plane
    this._planes = this._planes.filter(function (plane) {
      return plane.rootElement !== rootElement
    })

    // clean up active root
    if (this._rootElement === rootElement) {
      this._rootElement = null
    }

    return rootElement
  }

  // root element handling //////////////////////

  /**
   * Sets a given element as the new root element for the canvas
   * and returns the new root element.
   *
   * @param {Object|djs.model.Root} rootElement
   *
   * @return {Object|djs.model.Root} new root element
   */
  Canvas.prototype.setRootElement = function (rootElement, override) {
    if (isDefined(override)) {
      throw new Error('override not supported')
    }

    if (rootElement === this._rootElement) {
      return
    }

    var plane

    if (!rootElement) {
      throw new Error('rootElement required')
    }

    plane = this._findPlaneForRoot(rootElement)

    // give set add semantics for backwards compatibility
    if (!plane) {
      rootElement = this.addRootElement(rootElement)
    }

    this._setRoot(rootElement)

    return rootElement
  }

  Canvas.prototype._removeRoot = function (element) {
    var elementRegistry = this._elementRegistry,
      eventBus = this._eventBus

    // simulate element remove event sequence
    eventBus.fire('root.remove', { element: element })
    eventBus.fire('root.removed', { element: element })

    elementRegistry.remove(element)
  }

  Canvas.prototype._addRoot = function (element, gfx) {
    var elementRegistry = this._elementRegistry,
      eventBus = this._eventBus

    // resemble element add event sequence
    eventBus.fire('root.add', { element: element })

    elementRegistry.add(element, gfx)

    eventBus.fire('root.added', { element: element, gfx: gfx })
  }

  Canvas.prototype._setRoot = function (rootElement, layer) {
    var currentRoot = this._rootElement

    if (currentRoot) {
      // un-associate previous root element <svg>
      this._elementRegistry.updateGraphics(currentRoot, null, true)

      // hide previous layer
      this.hideLayer(currentRoot.layer)
    }

    if (rootElement) {
      if (!layer) {
        layer = this._findPlaneForRoot(rootElement).layer
      }

      // associate element with <svg>
      this._elementRegistry.updateGraphics(rootElement, this._svg, true)

      // show root layer
      this.showLayer(rootElement.layer)
    }

    this._rootElement = rootElement

    this._eventBus.fire('root.set', { element: rootElement })
  }

  // add functionality //////////////////////

  Canvas.prototype._ensureValid = function (type, element) {
    if (!element.id) {
      throw new Error('element must have an id')
    }

    if (this._elementRegistry.get(element.id)) {
      throw new Error('element <' + element.id + '> already exists')
    }

    var requiredAttrs = REQUIRED_MODEL_ATTRS[type]

    var valid = every(requiredAttrs, function (attr) {
      return typeof element[attr] !== 'undefined'
    })

    if (!valid) {
      throw new Error('must supply { ' + requiredAttrs.join(', ') + ' } with ' + type)
    }
  }

  Canvas.prototype._setParent = function (element, parent, parentIndex) {
    add(parent.children, element, parentIndex)
    element.parent = parent
  }

  /**
   * Adds an element to the canvas.
   *
   * This wires the parent <-> child relationship between the element and
   * a explicitly specified parent or an implicit root element.
   *
   * During add it emits the events
   *
   *  * <{type}.add> (element, parent)
   *  * <{type}.added> (element, gfx)
   *
   * Extensions may hook into these events to perform their magic.
   *
   * @param {string} type
   * @param {Object|djs.model.Base} element
   * @param {Object|djs.model.Base} [parent]
   * @param {number} [parentIndex]
   *
   * @return {Object|djs.model.Base} the added element
   */
  Canvas.prototype._addElement = function (type, element, parent, parentIndex) {
    parent = parent || this.getRootElement()

    var eventBus = this._eventBus,
      graphicsFactory = this._graphicsFactory

    this._ensureValid(type, element)

    eventBus.fire(type + '.add', { element: element, parent: parent })

    this._setParent(element, parent, parentIndex)

    // create graphics
    var gfx = graphicsFactory.create(type, element, parentIndex)

    this._elementRegistry.add(element, gfx)

    // update its visual
    graphicsFactory.update(type, element, gfx)

    eventBus.fire(type + '.added', { element: element, gfx: gfx })

    return element
  }

  /**
   * Adds a shape to the canvas
   *
   * @param {Object|djs.model.Shape} shape to add to the diagram
   * @param {djs.model.Base} [parent]
   * @param {number} [parentIndex]
   *
   * @return {djs.model.Shape} the added shape
   */
  Canvas.prototype.addShape = function (shape, parent, parentIndex) {
    return this._addElement('shape', shape, parent, parentIndex)
  }

  /**
   * Adds a connection to the canvas
   *
   * @param {Object|djs.model.Connection} connection to add to the diagram
   * @param {djs.model.Base} [parent]
   * @param {number} [parentIndex]
   *
   * @return {djs.model.Connection} the added connection
   */
  Canvas.prototype.addConnection = function (connection, parent, parentIndex) {
    return this._addElement('connection', connection, parent, parentIndex)
  }

  /**
   * Internal remove element
   */
  Canvas.prototype._removeElement = function (element, type) {
    var elementRegistry = this._elementRegistry,
      graphicsFactory = this._graphicsFactory,
      eventBus = this._eventBus

    element = elementRegistry.get(element.id || element)

    if (!element) {
      // element was removed already
      return
    }

    eventBus.fire(type + '.remove', { element: element })

    graphicsFactory.remove(element)

    // unset parent <-> child relationship
    remove(element.parent && element.parent.children, element)
    element.parent = null

    eventBus.fire(type + '.removed', { element: element })

    elementRegistry.remove(element)

    return element
  }

  /**
   * Removes a shape from the canvas
   *
   * @param {string|djs.model.Shape} shape or shape id to be removed
   *
   * @return {djs.model.Shape} the removed shape
   */
  Canvas.prototype.removeShape = function (shape) {
    /**
     * An event indicating that a shape is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.remove
     * @type {Object}
     * @property {djs.model.Shape} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */

    /**
     * An event indicating that a shape has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event shape.removed
     * @type {Object}
     * @property {djs.model.Shape} element the shape descriptor
     * @property {Object} gfx the graphical representation of the shape
     */
    return this._removeElement(shape, 'shape')
  }

  /**
   * Removes a connection from the canvas
   *
   * @param {string|djs.model.Connection} connection or connection id to be removed
   *
   * @return {djs.model.Connection} the removed connection
   */
  Canvas.prototype.removeConnection = function (connection) {
    /**
     * An event indicating that a connection is about to be removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event connection.remove
     * @type {Object}
     * @property {djs.model.Connection} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */

    /**
     * An event indicating that a connection has been removed from the canvas.
     *
     * @memberOf Canvas
     *
     * @event connection.removed
     * @type {Object}
     * @property {djs.model.Connection} element the connection descriptor
     * @property {Object} gfx the graphical representation of the connection
     */
    return this._removeElement(connection, 'connection')
  }

  /**
   * Return the graphical object underlaying a certain diagram element
   *
   * @param {string|djs.model.Base} element descriptor of the element
   * @param {boolean} [secondary=false] whether to return the secondary connected element
   *
   * @return {SVGElement}
   */
  Canvas.prototype.getGraphics = function (element, secondary) {
    return this._elementRegistry.getGraphics(element, secondary)
  }

  /**
   * Perform a viewbox update via a given change function.
   *
   * @param {Function} changeFn
   */
  Canvas.prototype._changeViewbox = function (changeFn) {
    // notify others of the upcoming viewbox change
    this._eventBus.fire('canvas.viewbox.changing')

    // perform actual change
    changeFn.apply(this)

    // reset the cached viewbox so that
    // a new get operation on viewbox or zoom
    // triggers a viewbox re-computation
    this._cachedViewbox = null

    // notify others of the change; this step
    // may or may not be debounced
    this._viewboxChanged()
  }

  Canvas.prototype._viewboxChanged = function () {
    this._eventBus.fire('canvas.viewbox.changed', { viewbox: this.viewbox() })
  }

  /**
   * Gets or sets the view box of the canvas, i.e. the
   * area that is currently displayed.
   *
   * The getter may return a cached viewbox (if it is currently
   * changing). To force a recomputation, pass `false` as the first argument.
   *
   * @example
   *
   * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
   *
   * // sets the visible area of the diagram to (100|100) -> (600|100)
   * // and and scales it according to the diagram width
   *
   * var viewbox = canvas.viewbox(); // pass `false` to force recomputing the box.
   *
   * console.log(viewbox);
   * // {
   * //   inner: Dimensions,
   * //   outer: Dimensions,
   * //   scale,
   * //   x, y,
   * //   width, height
   * // }
   *
   * // if the current diagram is zoomed and scrolled, you may reset it to the
   * // default zoom via this method, too:
   *
   * var zoomedAndScrolledViewbox = canvas.viewbox();
   *
   * canvas.viewbox({
   *   x: 0,
   *   y: 0,
   *   width: zoomedAndScrolledViewbox.outer.width,
   *   height: zoomedAndScrolledViewbox.outer.height
   * });
   *
   * @param  {Object} [box] the new view box to set
   * @param  {number} box.x the top left X coordinate of the canvas visible in view box
   * @param  {number} box.y the top left Y coordinate of the canvas visible in view box
   * @param  {number} box.width the visible width
   * @param  {number} box.height
   *
   * @return {Object} the current view box
   */
  Canvas.prototype.viewbox = function (box) {
    if (box === undefined && this._cachedViewbox) {
      return this._cachedViewbox
    }

    var viewport = this._viewport,
      innerBox,
      outerBox = this.getSize(),
      matrix,
      activeLayer,
      transform$1,
      scale,
      x,
      y

    if (!box) {
      // compute the inner box based on the
      // diagrams active layer. This allows us to exclude
      // external components, such as overlays

      activeLayer = this._rootElement ? this.getActiveLayer() : null
      innerBox = (activeLayer && activeLayer.getBBox()) || {}

      transform$1 = transform(viewport)
      matrix = transform$1 ? transform$1.matrix : createMatrix()
      scale = round(matrix.a, 1000)

      x = round(-matrix.e || 0, 1000)
      y = round(-matrix.f || 0, 1000)

      box = this._cachedViewbox = {
        x: x ? x / scale : 0,
        y: y ? y / scale : 0,
        width: outerBox.width / scale,
        height: outerBox.height / scale,
        scale: scale,
        inner: {
          width: innerBox.width || 0,
          height: innerBox.height || 0,
          x: innerBox.x || 0,
          y: innerBox.y || 0
        },
        outer: outerBox
      }

      return box
    } else {
      this._changeViewbox(function () {
        scale = Math.min(outerBox.width / box.width, outerBox.height / box.height)

        var matrix = this._svg.createSVGMatrix().scale(scale).translate(-box.x, -box.y)

        transform(viewport, matrix)
      })
    }

    return box
  }

  /**
   * Gets or sets the scroll of the canvas.
   *
   * @param {Object} [delta] the new scroll to apply.
   *
   * @param {number} [delta.dx]
   * @param {number} [delta.dy]
   */
  Canvas.prototype.scroll = function (delta) {
    var node = this._viewport
    var matrix = node.getCTM()

    if (delta) {
      this._changeViewbox(function () {
        delta = assign({ dx: 0, dy: 0 }, delta || {})

        matrix = this._svg.createSVGMatrix().translate(delta.dx, delta.dy).multiply(matrix)

        setCTM(node, matrix)
      })
    }

    return { x: matrix.e, y: matrix.f }
  }

  /**
   * Scrolls the viewbox to contain the given element.
   * Optionally specify a padding to be applied to the edges.
   *
   * @param {Object|String} [element] the element to scroll to.
   * @param {Object|Number} [padding=100] the padding to be applied. Can also specify top, bottom, left and right.
   *
   */
  Canvas.prototype.scrollToElement = function (element, padding) {
    var defaultPadding = 100

    if (typeof element === 'string') {
      element = this._elementRegistry.get(element)
    }

    // set to correct rootElement
    var rootElement = this.findRoot(element)

    if (rootElement !== this.getRootElement()) {
      this.setRootElement(rootElement)
    }

    if (!padding) {
      padding = {}
    }
    if (typeof padding === 'number') {
      defaultPadding = padding
    }

    padding = {
      top: padding.top || defaultPadding,
      right: padding.right || defaultPadding,
      bottom: padding.bottom || defaultPadding,
      left: padding.left || defaultPadding
    }

    var elementBounds = getBBox(element),
      elementTrbl = asTRBL(elementBounds),
      viewboxBounds = this.viewbox(),
      zoom = this.zoom(),
      dx,
      dy

    // shrink viewboxBounds with padding
    viewboxBounds.y += padding.top / zoom
    viewboxBounds.x += padding.left / zoom
    viewboxBounds.width -= (padding.right + padding.left) / zoom
    viewboxBounds.height -= (padding.bottom + padding.top) / zoom

    var viewboxTrbl = asTRBL(viewboxBounds)

    var canFit =
      elementBounds.width < viewboxBounds.width && elementBounds.height < viewboxBounds.height

    if (!canFit) {
      // top-left when element can't fit
      dx = elementBounds.x - viewboxBounds.x
      dy = elementBounds.y - viewboxBounds.y
    } else {
      var dRight = Math.max(0, elementTrbl.right - viewboxTrbl.right),
        dLeft = Math.min(0, elementTrbl.left - viewboxTrbl.left),
        dBottom = Math.max(0, elementTrbl.bottom - viewboxTrbl.bottom),
        dTop = Math.min(0, elementTrbl.top - viewboxTrbl.top)

      dx = dRight || dLeft
      dy = dBottom || dTop
    }

    this.scroll({ dx: -dx * zoom, dy: -dy * zoom })
  }

  /**
   * Gets or sets the current zoom of the canvas, optionally zooming
   * to the specified position.
   *
   * The getter may return a cached zoom level. Call it with `false` as
   * the first argument to force recomputation of the current level.
   *
   * @param {string|number} [newScale] the new zoom level, either a number, i.e. 0.9,
   *                                   or `fit-viewport` to adjust the size to fit the current viewport
   * @param {string|Point} [center] the reference point { x: .., y: ..} to zoom to, 'auto' to zoom into mid or null
   *
   * @return {number} the current scale
   */
  Canvas.prototype.zoom = function (newScale, center) {
    if (!newScale) {
      return this.viewbox(newScale).scale
    }

    if (newScale === 'fit-viewport') {
      return this._fitViewport(center)
    }

    var outer, matrix

    this._changeViewbox(function () {
      if (typeof center !== 'object') {
        outer = this.viewbox().outer

        center = {
          x: outer.width / 2,
          y: outer.height / 2
        }
      }

      matrix = this._setZoom(newScale, center)
    })

    return round(matrix.a, 1000)
  }

  function setCTM(node, m) {
    var mstr = 'matrix(' + m.a + ',' + m.b + ',' + m.c + ',' + m.d + ',' + m.e + ',' + m.f + ')'
    node.setAttribute('transform', mstr)
  }

  Canvas.prototype._fitViewport = function (center) {
    var vbox = this.viewbox(),
      outer = vbox.outer,
      inner = vbox.inner,
      newScale,
      newViewbox

    // display the complete diagram without zooming in.
    // instead of relying on internal zoom, we perform a
    // hard reset on the canvas viewbox to realize this
    //
    // if diagram does not need to be zoomed in, we focus it around
    // the diagram origin instead

    if (
      inner.x >= 0 &&
      inner.y >= 0 &&
      inner.x + inner.width <= outer.width &&
      inner.y + inner.height <= outer.height &&
      !center
    ) {
      newViewbox = {
        x: 0,
        y: 0,
        width: Math.max(inner.width + inner.x, outer.width),
        height: Math.max(inner.height + inner.y, outer.height)
      }
    } else {
      newScale = Math.min(1, outer.width / inner.width, outer.height / inner.height)
      newViewbox = {
        x: inner.x + (center ? inner.width / 2 - outer.width / newScale / 2 : 0),
        y: inner.y + (center ? inner.height / 2 - outer.height / newScale / 2 : 0),
        width: outer.width / newScale,
        height: outer.height / newScale
      }
    }

    this.viewbox(newViewbox)

    return this.viewbox(false).scale
  }

  Canvas.prototype._setZoom = function (scale, center) {
    var svg = this._svg,
      viewport = this._viewport

    var matrix = svg.createSVGMatrix()
    var point = svg.createSVGPoint()

    var centerPoint, originalPoint, currentMatrix, scaleMatrix, newMatrix

    currentMatrix = viewport.getCTM()

    var currentScale = currentMatrix.a

    if (center) {
      centerPoint = assign(point, center)

      // revert applied viewport transformations
      originalPoint = centerPoint.matrixTransform(currentMatrix.inverse())

      // create scale matrix
      scaleMatrix = matrix
        .translate(originalPoint.x, originalPoint.y)
        .scale((1 / currentScale) * scale)
        .translate(-originalPoint.x, -originalPoint.y)

      newMatrix = currentMatrix.multiply(scaleMatrix)
    } else {
      newMatrix = matrix.scale(scale)
    }

    setCTM(this._viewport, newMatrix)

    return newMatrix
  }

  /**
   * Returns the size of the canvas
   *
   * @return {Dimensions}
   */
  Canvas.prototype.getSize = function () {
    return {
      width: this._container.clientWidth,
      height: this._container.clientHeight
    }
  }

  /**
   * Return the absolute bounding box for the given element
   *
   * The absolute bounding box may be used to display overlays in the
   * callers (browser) coordinate system rather than the zoomed in/out
   * canvas coordinates.
   *
   * @param  {ElementDescriptor} element
   * @return {Bounds} the absolute bounding box
   */
  Canvas.prototype.getAbsoluteBBox = function (element) {
    var vbox = this.viewbox()
    var bbox

    // connection
    // use svg bbox
    if (element.waypoints) {
      var gfx = this.getGraphics(element)

      bbox = gfx.getBBox()
    }

    // shapes
    // use data
    else {
      bbox = element
    }

    var x = bbox.x * vbox.scale - vbox.x * vbox.scale
    var y = bbox.y * vbox.scale - vbox.y * vbox.scale

    var width = bbox.width * vbox.scale
    var height = bbox.height * vbox.scale

    return {
      x: x,
      y: y,
      width: width,
      height: height
    }
  }

  /**
   * Fires an event in order other modules can react to the
   * canvas resizing
   */
  Canvas.prototype.resized = function () {
    // force recomputation of view box
    delete this._cachedViewbox

    this._eventBus.fire('canvas.resized')
  }

  var ELEMENT_ID = 'data-element-id'

  /**
   * @class
   *
   * A registry that keeps track of all shapes in the diagram.
   */
  function ElementRegistry(eventBus) {
    this._elements = {}

    this._eventBus = eventBus
  }

  ElementRegistry.$inject = ['eventBus']

  /**
   * Register a pair of (element, gfx, (secondaryGfx)).
   *
   * @param {djs.model.Base} element
   * @param {SVGElement} gfx
   * @param {SVGElement} [secondaryGfx] optional other element to register, too
   */
  ElementRegistry.prototype.add = function (element, gfx, secondaryGfx) {
    var id = element.id

    this._validateId(id)

    // associate dom node with element
    attr(gfx, ELEMENT_ID, id)

    if (secondaryGfx) {
      attr(secondaryGfx, ELEMENT_ID, id)
    }

    this._elements[id] = { element: element, gfx: gfx, secondaryGfx: secondaryGfx }
  }

  /**
   * Removes an element from the registry.
   *
   * @param {djs.model.Base} element
   */
  ElementRegistry.prototype.remove = function (element) {
    var elements = this._elements,
      id = element.id || element,
      container = id && elements[id]

    if (container) {
      // unset element id on gfx
      attr(container.gfx, ELEMENT_ID, '')

      if (container.secondaryGfx) {
        attr(container.secondaryGfx, ELEMENT_ID, '')
      }

      delete elements[id]
    }
  }

  /**
   * Update the id of an element
   *
   * @param {djs.model.Base} element
   * @param {string} newId
   */
  ElementRegistry.prototype.updateId = function (element, newId) {
    this._validateId(newId)

    if (typeof element === 'string') {
      element = this.get(element)
    }

    this._eventBus.fire('element.updateId', {
      element: element,
      newId: newId
    })

    var gfx = this.getGraphics(element),
      secondaryGfx = this.getGraphics(element, true)

    this.remove(element)

    element.id = newId

    this.add(element, gfx, secondaryGfx)
  }

  /**
   * Update the graphics of an element
   *
   * @param {djs.model.Base} element
   * @param {SVGElement} gfx
   * @param {boolean} [secondary=false] whether to update the secondary connected element
   */
  ElementRegistry.prototype.updateGraphics = function (filter, gfx, secondary) {
    var id = filter.id || filter

    var container = this._elements[id]

    if (secondary) {
      container.secondaryGfx = gfx
    } else {
      container.gfx = gfx
    }

    if (gfx) {
      attr(gfx, ELEMENT_ID, id)
    }

    return gfx
  }

  /**
   * Return the model element for a given id or graphics.
   *
   * @example
   *
   * elementRegistry.get('SomeElementId_1');
   * elementRegistry.get(gfx);
   *
   *
   * @param {string|SVGElement} filter for selecting the element
   *
   * @return {djs.model.Base}
   */
  ElementRegistry.prototype.get = function (filter) {
    var id

    if (typeof filter === 'string') {
      id = filter
    } else {
      id = filter && attr(filter, ELEMENT_ID)
    }

    var container = this._elements[id]
    return container && container.element
  }

  /**
   * Return all elements that match a given filter function.
   *
   * @param {Function} fn
   *
   * @return {Array<djs.model.Base>}
   */
  ElementRegistry.prototype.filter = function (fn) {
    var filtered = []

    this.forEach(function (element, gfx) {
      if (fn(element, gfx)) {
        filtered.push(element)
      }
    })

    return filtered
  }

  /**
   * Return the first element that satisfies the provided testing function.
   *
   * @param {Function} fn
   *
   * @return {djs.model.Base}
   */
  ElementRegistry.prototype.find = function (fn) {
    var map = this._elements,
      keys = Object.keys(map)

    for (var i = 0; i < keys.length; i++) {
      var id = keys[i],
        container = map[id],
        element = container.element,
        gfx = container.gfx

      if (fn(element, gfx)) {
        return element
      }
    }
  }

  /**
   * Return all rendered model elements.
   *
   * @return {Array<djs.model.Base>}
   */
  ElementRegistry.prototype.getAll = function () {
    return this.filter(function (e) {
      return e
    })
  }

  /**
   * Iterate over all diagram elements.
   *
   * @param {Function} fn
   */
  ElementRegistry.prototype.forEach = function (fn) {
    var map = this._elements

    Object.keys(map).forEach(function (id) {
      var container = map[id],
        element = container.element,
        gfx = container.gfx

      return fn(element, gfx)
    })
  }

  /**
   * Return the graphical representation of an element or its id.
   *
   * @example
   * elementRegistry.getGraphics('SomeElementId_1');
   * elementRegistry.getGraphics(rootElement); // <g ...>
   *
   * elementRegistry.getGraphics(rootElement, true); // <svg ...>
   *
   *
   * @param {string|djs.model.Base} filter
   * @param {boolean} [secondary=false] whether to return the secondary connected element
   *
   * @return {SVGElement}
   */
  ElementRegistry.prototype.getGraphics = function (filter, secondary) {
    var id = filter.id || filter

    var container = this._elements[id]
    return container && (secondary ? container.secondaryGfx : container.gfx)
  }

  /**
   * Validate the suitability of the given id and signals a problem
   * with an exception.
   *
   * @param {string} id
   *
   * @throws {Error} if id is empty or already assigned
   */
  ElementRegistry.prototype._validateId = function (id) {
    if (!id) {
      throw new Error('element must have an id')
    }

    if (this._elements[id]) {
      throw new Error('element with id ' + id + ' already added')
    }
  }

  var objectRefs = { exports: {} }

  var collection = {}

  /**
   * An empty collection stub. Use {@link RefsCollection.extend} to extend a
   * collection with ref semantics.
   *
   * @class RefsCollection
   */

  /**
   * Extends a collection with {@link Refs} aware methods
   *
   * @memberof RefsCollection
   * @static
   *
   * @param  {Array<Object>} collection
   * @param  {Refs} refs instance
   * @param  {Object} property represented by the collection
   * @param  {Object} target object the collection is attached to
   *
   * @return {RefsCollection<Object>} the extended array
   */
  function extend(collection, refs, property, target) {
    var inverseProperty = property.inverse

    /**
     * Removes the given element from the array and returns it.
     *
     * @method RefsCollection#remove
     *
     * @param {Object} element the element to remove
     */
    Object.defineProperty(collection, 'remove', {
      value: function (element) {
        var idx = this.indexOf(element)
        if (idx !== -1) {
          this.splice(idx, 1)

          // unset inverse
          refs.unset(element, inverseProperty, target)
        }

        return element
      }
    })

    /**
     * Returns true if the collection contains the given element
     *
     * @method RefsCollection#contains
     *
     * @param {Object} element the element to check for
     */
    Object.defineProperty(collection, 'contains', {
      value: function (element) {
        return this.indexOf(element) !== -1
      }
    })

    /**
     * Adds an element to the array, unless it exists already (set semantics).
     *
     * @method RefsCollection#add
     *
     * @param {Object} element the element to add
     * @param {Number} optional index to add element to
     *                 (possibly moving other elements around)
     */
    Object.defineProperty(collection, 'add', {
      value: function (element, idx) {
        var currentIdx = this.indexOf(element)

        if (typeof idx === 'undefined') {
          if (currentIdx !== -1) {
            // element already in collection (!)
            return
          }

          // add to end of array, as no idx is specified
          idx = this.length
        }

        // handle already in collection
        if (currentIdx !== -1) {
          // remove element from currentIdx
          this.splice(currentIdx, 1)
        }

        // add element at idx
        this.splice(idx, 0, element)

        if (currentIdx === -1) {
          // set inverse, unless element was
          // in collection already
          refs.set(element, inverseProperty, target)
        }
      }
    })

    // a simple marker, identifying this element
    // as being a refs collection
    Object.defineProperty(collection, '__refs_collection', {
      value: true
    })

    return collection
  }

  function isExtended(collection) {
    return collection.__refs_collection === true
  }

  collection.extend = extend

  collection.isExtended = isExtended

  var Collection = collection

  function hasOwnProperty(e, property) {
    return Object.prototype.hasOwnProperty.call(e, property.name || property)
  }

  function defineCollectionProperty(ref, property, target) {
    var collection = Collection.extend(target[property.name] || [], ref, property, target)

    Object.defineProperty(target, property.name, {
      enumerable: property.enumerable,
      value: collection
    })

    if (collection.length) {
      collection.forEach(function (o) {
        ref.set(o, property.inverse, target)
      })
    }
  }

  function defineProperty(ref, property, target) {
    var inverseProperty = property.inverse

    var _value = target[property.name]

    Object.defineProperty(target, property.name, {
      configurable: property.configurable,
      enumerable: property.enumerable,

      get: function () {
        return _value
      },

      set: function (value) {
        // return if we already performed all changes
        if (value === _value) {
          return
        }

        var old = _value

        // temporary set null
        _value = null

        if (old) {
          ref.unset(old, inverseProperty, target)
        }

        // set new value
        _value = value

        // set inverse value
        ref.set(_value, inverseProperty, target)
      }
    })
  }

  /**
   * Creates a new references object defining two inversly related
   * attribute descriptors a and b.
   *
   * <p>
   *   When bound to an object using {@link Refs#bind} the references
   *   get activated and ensure that add and remove operations are applied
   *   reversely, too.
   * </p>
   *
   * <p>
   *   For attributes represented as collections {@link Refs} provides the
   *   {@link RefsCollection#add}, {@link RefsCollection#remove} and {@link RefsCollection#contains} extensions
   *   that must be used to properly hook into the inverse change mechanism.
   * </p>
   *
   * @class Refs
   *
   * @classdesc A bi-directional reference between two attributes.
   *
   * @param {Refs.AttributeDescriptor} a property descriptor
   * @param {Refs.AttributeDescriptor} b property descriptor
   *
   * @example
   *
   * var refs = Refs({ name: 'wheels', collection: true, enumerable: true }, { name: 'car' });
   *
   * var car = { name: 'toyota' };
   * var wheels = [{ pos: 'front-left' }, { pos: 'front-right' }];
   *
   * refs.bind(car, 'wheels');
   *
   * car.wheels // []
   * car.wheels.add(wheels[0]);
   * car.wheels.add(wheels[1]);
   *
   * car.wheels // [{ pos: 'front-left' }, { pos: 'front-right' }]
   *
   * wheels[0].car // { name: 'toyota' };
   * car.wheels.remove(wheels[0]);
   *
   * wheels[0].car // undefined
   */
  function Refs$1(a, b) {
    if (!(this instanceof Refs$1)) {
      return new Refs$1(a, b)
    }

    // link
    a.inverse = b
    b.inverse = a

    this.props = {}
    this.props[a.name] = a
    this.props[b.name] = b
  }

  /**
   * Binds one side of a bi-directional reference to a
   * target object.
   *
   * @memberOf Refs
   *
   * @param  {Object} target
   * @param  {String} property
   */
  Refs$1.prototype.bind = function (target, property) {
    if (typeof property === 'string') {
      if (!this.props[property]) {
        throw new Error('no property <' + property + '> in ref')
      }
      property = this.props[property]
    }

    if (property.collection) {
      defineCollectionProperty(this, property, target)
    } else {
      defineProperty(this, property, target)
    }
  }

  Refs$1.prototype.ensureRefsCollection = function (target, property) {
    var collection = target[property.name]

    if (!Collection.isExtended(collection)) {
      defineCollectionProperty(this, property, target)
    }

    return collection
  }

  Refs$1.prototype.ensureBound = function (target, property) {
    if (!hasOwnProperty(target, property)) {
      this.bind(target, property)
    }
  }

  Refs$1.prototype.unset = function (target, property, value) {
    if (target) {
      this.ensureBound(target, property)

      if (property.collection) {
        this.ensureRefsCollection(target, property).remove(value)
      } else {
        target[property.name] = undefined
      }
    }
  }

  Refs$1.prototype.set = function (target, property, value) {
    if (target) {
      this.ensureBound(target, property)

      if (property.collection) {
        this.ensureRefsCollection(target, property).add(value)
      } else {
        target[property.name] = value
      }
    }
  }

  var refs = Refs$1

  ;(function (module) {
    module.exports = refs

    module.exports.Collection = collection
  })(objectRefs)

  var Refs = /*@__PURE__*/ getDefaultExportFromCjs(objectRefs.exports)

  var parentRefs = new Refs(
      { name: 'children', enumerable: true, collection: true },
      { name: 'parent' }
    ),
    labelRefs = new Refs(
      { name: 'labels', enumerable: true, collection: true },
      { name: 'labelTarget' }
    ),
    attacherRefs = new Refs({ name: 'attachers', collection: true }, { name: 'host' }),
    outgoingRefs = new Refs({ name: 'outgoing', collection: true }, { name: 'source' }),
    incomingRefs = new Refs({ name: 'incoming', collection: true }, { name: 'target' })

  /**
   * @namespace djs.model
   */

  /**
   * @memberOf djs.model
   */

  /**
   * The basic graphical representation
   *
   * @class
   *
   * @abstract
   */
  function Base() {
    /**
     * The object that backs up the shape
     *
     * @name Base#businessObject
     * @type Object
     */
    Object.defineProperty(this, 'businessObject', {
      writable: true
    })

    /**
     * Single label support, will mapped to multi label array
     *
     * @name Base#label
     * @type Object
     */
    Object.defineProperty(this, 'label', {
      get: function () {
        return this.labels[0]
      },
      set: function (newLabel) {
        var label = this.label,
          labels = this.labels

        if (!newLabel && label) {
          labels.remove(label)
        } else {
          labels.add(newLabel, 0)
        }
      }
    })

    /**
     * The parent shape
     *
     * @name Base#parent
     * @type Shape
     */
    parentRefs.bind(this, 'parent')

    /**
     * The list of labels
     *
     * @name Base#labels
     * @type Label
     */
    labelRefs.bind(this, 'labels')

    /**
     * The list of outgoing connections
     *
     * @name Base#outgoing
     * @type Array<Connection>
     */
    outgoingRefs.bind(this, 'outgoing')

    /**
     * The list of incoming connections
     *
     * @name Base#incoming
     * @type Array<Connection>
     */
    incomingRefs.bind(this, 'incoming')
  }

  /**
   * A graphical object
   *
   * @class
   * @constructor
   *
   * @extends Base
   */
  function Shape() {
    Base.call(this)

    /**
     * Indicates frame shapes
     *
     * @name Shape#isFrame
     * @type boolean
     */

    /**
     * The list of children
     *
     * @name Shape#children
     * @type Array<Base>
     */
    parentRefs.bind(this, 'children')

    /**
     * @name Shape#host
     * @type Shape
     */
    attacherRefs.bind(this, 'host')

    /**
     * @name Shape#attachers
     * @type Shape
     */
    attacherRefs.bind(this, 'attachers')
  }

  inherits_browser.exports(Shape, Base)

  /**
   * A root graphical object
   *
   * @class
   * @constructor
   *
   * @extends Shape
   */
  function Root() {
    Shape.call(this)
  }

  inherits_browser.exports(Root, Shape)

  /**
   * A label for an element
   *
   * @class
   * @constructor
   *
   * @extends Shape
   */
  function Label() {
    Shape.call(this)

    /**
     * The labeled element
     *
     * @name Label#labelTarget
     * @type Base
     */
    labelRefs.bind(this, 'labelTarget')
  }

  inherits_browser.exports(Label, Shape)

  /**
   * A connection between two elements
   *
   * @class
   * @constructor
   *
   * @extends Base
   */
  function Connection() {
    Base.call(this)

    /**
     * The element this connection originates from
     *
     * @name Connection#source
     * @type Base
     */
    outgoingRefs.bind(this, 'source')

    /**
     * The element this connection points to
     *
     * @name Connection#target
     * @type Base
     */
    incomingRefs.bind(this, 'target')
  }

  inherits_browser.exports(Connection, Base)

  var types = {
    connection: Connection,
    shape: Shape,
    label: Label,
    root: Root
  }

  /**
   * Creates a new model element of the specified type
   *
   * @method create
   *
   * @example
   *
   * var shape1 = Model.create('shape', { x: 10, y: 10, width: 100, height: 100 });
   * var shape2 = Model.create('shape', { x: 210, y: 210, width: 100, height: 100 });
   *
   * var connection = Model.create('connection', { waypoints: [ { x: 110, y: 55 }, {x: 210, y: 55 } ] });
   *
   * @param  {string} type lower-cased model name
   * @param  {Object} attrs attributes to initialize the new model instance with
   *
   * @return {Base} the new model instance
   */
  function create(type, attrs) {
    var Type = types[type]
    if (!Type) {
      throw new Error('unknown type: <' + type + '>')
    }
    return assign(new Type(), attrs)
  }

  /**
   * A factory for diagram-js shapes
   */
  function ElementFactory() {
    this._uid = 12
  }

  ElementFactory.prototype.createRoot = function (attrs) {
    return this.create('root', attrs)
  }

  ElementFactory.prototype.createLabel = function (attrs) {
    return this.create('label', attrs)
  }

  ElementFactory.prototype.createShape = function (attrs) {
    return this.create('shape', attrs)
  }

  ElementFactory.prototype.createConnection = function (attrs) {
    return this.create('connection', attrs)
  }

  /**
   * Create a model element with the given type and
   * a number of pre-set attributes.
   *
   * @param  {string} type
   * @param  {Object} attrs
   * @return {djs.model.Base} the newly created model instance
   */
  ElementFactory.prototype.create = function (type, attrs) {
    attrs = assign({}, attrs || {})

    if (!attrs.id) {
      attrs.id = type + '_' + this._uid++
    }

    return create(type, attrs)
  }

  var FN_REF = '__fn'

  var DEFAULT_PRIORITY = 1000

  var slice = Array.prototype.slice

  /**
   * A general purpose event bus.
   *
   * This component is used to communicate across a diagram instance.
   * Other parts of a diagram can use it to listen to and broadcast events.
   *
   *
   * ## Registering for Events
   *
   * The event bus provides the {@link EventBus#on} and {@link EventBus#once}
   * methods to register for events. {@link EventBus#off} can be used to
   * remove event registrations. Listeners receive an instance of {@link Event}
   * as the first argument. It allows them to hook into the event execution.
   *
   * ```javascript
   *
   * // listen for event
   * eventBus.on('foo', function(event) {
   *
   *   // access event type
   *   event.type; // 'foo'
   *
   *   // stop propagation to other listeners
   *   event.stopPropagation();
   *
   *   // prevent event default
   *   event.preventDefault();
   * });
   *
   * // listen for event with custom payload
   * eventBus.on('bar', function(event, payload) {
   *   console.log(payload);
   * });
   *
   * // listen for event returning value
   * eventBus.on('foobar', function(event) {
   *
   *   // stop event propagation + prevent default
   *   return false;
   *
   *   // stop event propagation + return custom result
   *   return {
   *     complex: 'listening result'
   *   };
   * });
   *
   *
   * // listen with custom priority (default=1000, higher is better)
   * eventBus.on('priorityfoo', 1500, function(event) {
   *   console.log('invoked first!');
   * });
   *
   *
   * // listen for event and pass the context (`this`)
   * eventBus.on('foobar', function(event) {
   *   this.foo();
   * }, this);
   * ```
   *
   *
   * ## Emitting Events
   *
   * Events can be emitted via the event bus using {@link EventBus#fire}.
   *
   * ```javascript
   *
   * // false indicates that the default action
   * // was prevented by listeners
   * if (eventBus.fire('foo') === false) {
   *   console.log('default has been prevented!');
   * };
   *
   *
   * // custom args + return value listener
   * eventBus.on('sum', function(event, a, b) {
   *   return a + b;
   * });
   *
   * // you can pass custom arguments + retrieve result values.
   * var sum = eventBus.fire('sum', 1, 2);
   * console.log(sum); // 3
   * ```
   */
  function EventBus() {
    this._listeners = {}

    // cleanup on destroy on lowest priority to allow
    // message passing until the bitter end
    this.on('diagram.destroy', 1, this._destroy, this)
  }

  /**
   * Register an event listener for events with the given name.
   *
   * The callback will be invoked with `event, ...additionalArguments`
   * that have been passed to {@link EventBus#fire}.
   *
   * Returning false from a listener will prevent the events default action
   * (if any is specified). To stop an event from being processed further in
   * other listeners execute {@link Event#stopPropagation}.
   *
   * Returning anything but `undefined` from a listener will stop the listener propagation.
   *
   * @param {string|Array<string>} events
   * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
   * @param {Function} callback
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  EventBus.prototype.on = function (events, priority, callback, that) {
    events = isArray(events) ? events : [events]

    if (isFunction(priority)) {
      that = callback
      callback = priority
      priority = DEFAULT_PRIORITY
    }

    if (!isNumber(priority)) {
      throw new Error('priority must be a number')
    }

    var actualCallback = callback

    if (that) {
      actualCallback = bind(callback, that)

      // make sure we remember and are able to remove
      // bound callbacks via {@link #off} using the original
      // callback
      actualCallback[FN_REF] = callback[FN_REF] || callback
    }

    var self = this

    events.forEach(function (e) {
      self._addListener(e, {
        priority: priority,
        callback: actualCallback,
        next: null
      })
    })
  }

  /**
   * Register an event listener that is executed only once.
   *
   * @param {string} event the event name to register for
   * @param {number} [priority=1000] the priority in which this listener is called, larger is higher
   * @param {Function} callback the callback to execute
   * @param {Object} [that] Pass context (`this`) to the callback
   */
  EventBus.prototype.once = function (event, priority, callback, that) {
    var self = this

    if (isFunction(priority)) {
      that = callback
      callback = priority
      priority = DEFAULT_PRIORITY
    }

    if (!isNumber(priority)) {
      throw new Error('priority must be a number')
    }

    function wrappedCallback() {
      wrappedCallback.__isTomb = true

      var result = callback.apply(that, arguments)

      self.off(event, wrappedCallback)

      return result
    }

    // make sure we remember and are able to remove
    // bound callbacks via {@link #off} using the original
    // callback
    wrappedCallback[FN_REF] = callback

    this.on(event, priority, wrappedCallback)
  }

  /**
   * Removes event listeners by event and callback.
   *
   * If no callback is given, all listeners for a given event name are being removed.
   *
   * @param {string|Array<string>} events
   * @param {Function} [callback]
   */
  EventBus.prototype.off = function (events, callback) {
    events = isArray(events) ? events : [events]

    var self = this

    events.forEach(function (event) {
      self._removeListener(event, callback)
    })
  }

  /**
   * Create an EventBus event.
   *
   * @param {Object} data
   *
   * @return {Object} event, recognized by the eventBus
   */
  EventBus.prototype.createEvent = function (data) {
    var event = new InternalEvent()

    event.init(data)

    return event
  }

  /**
   * Fires a named event.
   *
   * @example
   *
   * // fire event by name
   * events.fire('foo');
   *
   * // fire event object with nested type
   * var event = { type: 'foo' };
   * events.fire(event);
   *
   * // fire event with explicit type
   * var event = { x: 10, y: 20 };
   * events.fire('element.moved', event);
   *
   * // pass additional arguments to the event
   * events.on('foo', function(event, bar) {
   *   alert(bar);
   * });
   *
   * events.fire({ type: 'foo' }, 'I am bar!');
   *
   * @param {string} [name] the optional event name
   * @param {Object} [event] the event object
   * @param {...Object} additional arguments to be passed to the callback functions
   *
   * @return {boolean} the events return value, if specified or false if the
   *                   default action was prevented by listeners
   */
  EventBus.prototype.fire = function (type, data) {
    var event, firstListener, returnValue, args

    args = slice.call(arguments)

    if (typeof type === 'object') {
      data = type
      type = data.type
    }

    if (!type) {
      throw new Error('no event type specified')
    }

    firstListener = this._listeners[type]

    if (!firstListener) {
      return
    }

    // we make sure we fire instances of our home made
    // events here. We wrap them only once, though
    if (data instanceof InternalEvent) {
      // we are fine, we alread have an event
      event = data
    } else {
      event = this.createEvent(data)
    }

    // ensure we pass the event as the first parameter
    args[0] = event

    // original event type (in case we delegate)
    var originalType = event.type

    // update event type before delegation
    if (type !== originalType) {
      event.type = type
    }

    try {
      returnValue = this._invokeListeners(event, args, firstListener)
    } finally {
      // reset event type after delegation
      if (type !== originalType) {
        event.type = originalType
      }
    }

    // set the return value to false if the event default
    // got prevented and no other return value exists
    if (returnValue === undefined && event.defaultPrevented) {
      returnValue = false
    }

    return returnValue
  }

  EventBus.prototype.handleError = function (error) {
    return this.fire('error', { error: error }) === false
  }

  EventBus.prototype._destroy = function () {
    this._listeners = {}
  }

  EventBus.prototype._invokeListeners = function (event, args, listener) {
    var returnValue

    while (listener) {
      // handle stopped propagation
      if (event.cancelBubble) {
        break
      }

      returnValue = this._invokeListener(event, args, listener)

      listener = listener.next
    }

    return returnValue
  }

  EventBus.prototype._invokeListener = function (event, args, listener) {
    var returnValue

    if (listener.callback.__isTomb) {
      return returnValue
    }

    try {
      // returning false prevents the default action
      returnValue = invokeFunction(listener.callback, args)

      // stop propagation on return value
      if (returnValue !== undefined) {
        event.returnValue = returnValue
        event.stopPropagation()
      }

      // prevent default on return false
      if (returnValue === false) {
        event.preventDefault()
      }
    } catch (error) {
      if (!this.handleError(error)) {
        console.error('unhandled error in event listener', error)

        throw error
      }
    }

    return returnValue
  }

  /*
   * Add new listener with a certain priority to the list
   * of listeners (for the given event).
   *
   * The semantics of listener registration / listener execution are
   * first register, first serve: New listeners will always be inserted
   * after existing listeners with the same priority.
   *
   * Example: Inserting two listeners with priority 1000 and 1300
   *
   *    * before: [ 1500, 1500, 1000, 1000 ]
   *    * after: [ 1500, 1500, (new=1300), 1000, 1000, (new=1000) ]
   *
   * @param {string} event
   * @param {Object} listener { priority, callback }
   */
  EventBus.prototype._addListener = function (event, newListener) {
    var listener = this._getListeners(event),
      previousListener

    // no prior listeners
    if (!listener) {
      this._setListeners(event, newListener)

      return
    }

    // ensure we order listeners by priority from
    // 0 (high) to n > 0 (low)
    while (listener) {
      if (listener.priority < newListener.priority) {
        newListener.next = listener

        if (previousListener) {
          previousListener.next = newListener
        } else {
          this._setListeners(event, newListener)
        }

        return
      }

      previousListener = listener
      listener = listener.next
    }

    // add new listener to back
    previousListener.next = newListener
  }

  EventBus.prototype._getListeners = function (name) {
    return this._listeners[name]
  }

  EventBus.prototype._setListeners = function (name, listener) {
    this._listeners[name] = listener
  }

  EventBus.prototype._removeListener = function (event, callback) {
    var listener = this._getListeners(event),
      nextListener,
      previousListener,
      listenerCallback

    if (!callback) {
      // clear listeners
      this._setListeners(event, null)

      return
    }

    while (listener) {
      nextListener = listener.next

      listenerCallback = listener.callback

      if (listenerCallback === callback || listenerCallback[FN_REF] === callback) {
        if (previousListener) {
          previousListener.next = nextListener
        } else {
          // new first listener
          this._setListeners(event, nextListener)
        }
      }

      previousListener = listener
      listener = nextListener
    }
  }

  /**
   * A event that is emitted via the event bus.
   */
  function InternalEvent() {}

  InternalEvent.prototype.stopPropagation = function () {
    this.cancelBubble = true
  }

  InternalEvent.prototype.preventDefault = function () {
    this.defaultPrevented = true
  }

  InternalEvent.prototype.init = function (data) {
    assign(this, data || {})
  }

  /**
   * Invoke function. Be fast...
   *
   * @param {Function} fn
   * @param {Array<Object>} args
   *
   * @return {Any}
   */
  function invokeFunction(fn, args) {
    return fn.apply(null, args)
  }

  /**
   * SVGs for elements are generated by the {@link GraphicsFactory}.
   *
   * This utility gives quick access to the important semantic
   * parts of an element.
   */

  /**
   * Returns the visual part of a diagram element
   *
   * @param {Snap<SVGElement>} gfx
   *
   * @return {Snap<SVGElement>}
   */
  function getVisual(gfx) {
    return gfx.childNodes[0]
  }

  /**
   * Returns the children for a given diagram element.
   *
   * @param {Snap<SVGElement>} gfx
   * @return {Snap<SVGElement>}
   */
  function getChildren(gfx) {
    return gfx.parentNode.childNodes[1]
  }

  /**
   * @param {SVGElement} element
   * @param {number} x
   * @param {number} y
   */
  function translate(gfx, x, y) {
    var translate = createTransform()
    translate.setTranslate(x, y)

    transform(gfx, translate)
  }

  /**
   * Set attribute `name` to `val`, or get attr `name`.
   *
   * @param {Element} el
   * @param {String} name
   * @param {String} [val]
   * @api public
   */

  /**
   * Remove all children from the given element.
   */
  function clear(el) {
    var c

    while (el.childNodes.length) {
      c = el.childNodes[0]
      el.removeChild(c)
    }

    return el
  }

  var proto = typeof Element !== 'undefined' ? Element.prototype : {}
  proto.matches ||
    proto.matchesSelector ||
    proto.webkitMatchesSelector ||
    proto.mozMatchesSelector ||
    proto.msMatchesSelector ||
    proto.oMatchesSelector
  var bugTestDiv
  if (typeof document !== 'undefined') {
    bugTestDiv = document.createElement('div')
    // Setup
    bugTestDiv.innerHTML = '  <link/><table></table><a href="/a">a</a><input type="checkbox"/>'
    // Make sure that link elements get serialized correctly by innerHTML
    // This requires a wrapper element in IE
    !bugTestDiv.getElementsByTagName('link').length
    bugTestDiv = undefined
  }

  /**
   * A factory that creates graphical elements
   *
   * @param {EventBus} eventBus
   * @param {ElementRegistry} elementRegistry
   */
  function GraphicsFactory(eventBus, elementRegistry) {
    this._eventBus = eventBus
    this._elementRegistry = elementRegistry
  }

  GraphicsFactory.$inject = ['eventBus', 'elementRegistry']

  GraphicsFactory.prototype._getChildrenContainer = function (element) {
    var gfx = this._elementRegistry.getGraphics(element)

    var childrenGfx

    // root element
    if (!element.parent) {
      childrenGfx = gfx
    } else {
      childrenGfx = getChildren(gfx)
      if (!childrenGfx) {
        childrenGfx = create$1('g')
        classes(childrenGfx).add('djs-children')

        append(gfx.parentNode, childrenGfx)
      }
    }

    return childrenGfx
  }

  /**
   * Clears the graphical representation of the element and returns the
   * cleared visual (the <g class="djs-visual" /> element).
   */
  GraphicsFactory.prototype._clear = function (gfx) {
    var visual = getVisual(gfx)

    clear(visual)

    return visual
  }

  /**
   * Creates a gfx container for shapes and connections
   *
   * The layout is as follows:
   *
   * <g class="djs-group">
   *
   *   <!-- the gfx -->
   *   <g class="djs-element djs-(shape|connection|frame)">
   *     <g class="djs-visual">
   *       <!-- the renderer draws in here -->
   *     </g>
   *
   *     <!-- extensions (overlays, click box, ...) goes here
   *   </g>
   *
   *   <!-- the gfx child nodes -->
   *   <g class="djs-children"></g>
   * </g>
   *
   * @param {string} type the type of the element, i.e. shape | connection
   * @param {SVGElement} [childrenGfx]
   * @param {number} [parentIndex] position to create container in parent
   * @param {boolean} [isFrame] is frame element
   *
   * @return {SVGElement}
   */
  GraphicsFactory.prototype._createContainer = function (type, childrenGfx, parentIndex, isFrame) {
    var outerGfx = create$1('g')
    classes(outerGfx).add('djs-group')

    // insert node at position
    if (typeof parentIndex !== 'undefined') {
      prependTo(outerGfx, childrenGfx, childrenGfx.childNodes[parentIndex])
    } else {
      append(childrenGfx, outerGfx)
    }

    var gfx = create$1('g')
    classes(gfx).add('djs-element')
    classes(gfx).add('djs-' + type)

    if (isFrame) {
      classes(gfx).add('djs-frame')
    }

    append(outerGfx, gfx)

    // create visual
    var visual = create$1('g')
    classes(visual).add('djs-visual')

    append(gfx, visual)

    return gfx
  }

  GraphicsFactory.prototype.create = function (type, element, parentIndex) {
    var childrenGfx = this._getChildrenContainer(element.parent)
    return this._createContainer(type, childrenGfx, parentIndex, isFrameElement(element))
  }

  GraphicsFactory.prototype.updateContainments = function (elements) {
    var self = this,
      elementRegistry = this._elementRegistry,
      parents

    parents = reduce(
      elements,
      function (map, e) {
        if (e.parent) {
          map[e.parent.id] = e.parent
        }

        return map
      },
      {}
    )

    // update all parents of changed and reorganized their children
    // in the correct order (as indicated in our model)
    forEach(parents, function (parent) {
      var children = parent.children

      if (!children) {
        return
      }

      var childrenGfx = self._getChildrenContainer(parent)

      forEach(children.slice().reverse(), function (child) {
        var childGfx = elementRegistry.getGraphics(child)

        prependTo(childGfx.parentNode, childrenGfx)
      })
    })
  }

  GraphicsFactory.prototype.drawShape = function (visual, element) {
    var eventBus = this._eventBus

    return eventBus.fire('render.shape', { gfx: visual, element: element })
  }

  GraphicsFactory.prototype.getShapePath = function (element) {
    var eventBus = this._eventBus

    return eventBus.fire('render.getShapePath', element)
  }

  GraphicsFactory.prototype.drawConnection = function (visual, element) {
    var eventBus = this._eventBus

    return eventBus.fire('render.connection', { gfx: visual, element: element })
  }

  GraphicsFactory.prototype.getConnectionPath = function (waypoints) {
    var eventBus = this._eventBus

    return eventBus.fire('render.getConnectionPath', waypoints)
  }

  GraphicsFactory.prototype.update = function (type, element, gfx) {
    // do NOT update root element
    if (!element.parent) {
      return
    }

    var visual = this._clear(gfx)

    // redraw
    if (type === 'shape') {
      this.drawShape(visual, element)

      // update positioning
      translate(gfx, element.x, element.y)
    } else if (type === 'connection') {
      this.drawConnection(visual, element)
    } else {
      throw new Error('unknown type: ' + type)
    }

    if (element.hidden) {
      attr(gfx, 'display', 'none')
    } else {
      attr(gfx, 'display', 'block')
    }
  }

  GraphicsFactory.prototype.remove = function (element) {
    var gfx = this._elementRegistry.getGraphics(element)

    // remove
    remove$1(gfx.parentNode)
  }

  // helpers //////////

  function prependTo(newNode, parentNode, siblingNode) {
    var node = siblingNode || parentNode.firstChild

    // do not prepend node to itself to prevent IE from crashing
    // https://github.com/bpmn-io/bpmn-js/issues/746
    if (newNode === node) {
      return
    }

    parentNode.insertBefore(newNode, node)
  }

  var CoreModule = {
    __depends__: [DrawModule],
    __init__: ['canvas'],
    canvas: ['type', Canvas],
    elementRegistry: ['type', ElementRegistry],
    elementFactory: ['type', ElementFactory],
    eventBus: ['type', EventBus],
    graphicsFactory: ['type', GraphicsFactory]
  }

  /**
   * Bootstrap an injector from a list of modules, instantiating a number of default components
   *
   * @ignore
   * @param {Array<didi.Module>} bootstrapModules
   *
   * @return {didi.Injector} a injector to use to access the components
   */
  function bootstrap(bootstrapModules) {
    var modules = [],
      components = []

    function hasModule(m) {
      return modules.indexOf(m) >= 0
    }

    function addModule(m) {
      modules.push(m)
    }

    function visit(m) {
      if (hasModule(m)) {
        return
      }

      ;(m.__depends__ || []).forEach(visit)

      if (hasModule(m)) {
        return
      }

      addModule(m)

      ;(m.__init__ || []).forEach(function (c) {
        components.push(c)
      })
    }

    bootstrapModules.forEach(visit)

    var injector = new Injector(modules)

    components.forEach(function (c) {
      try {
        // eagerly resolve component (fn or string)
        injector[typeof c === 'string' ? 'get' : 'invoke'](c)
      } catch (e) {
        console.error('Failed to instantiate component')
        console.error(e.stack)

        throw e
      }
    })

    return injector
  }

  /**
   * Creates an injector from passed options.
   *
   * @ignore
   * @param  {Object} options
   * @return {didi.Injector}
   */
  function createInjector(options) {
    options = options || {}

    var configModule = {
      config: ['value', options]
    }

    var modules = [configModule, CoreModule].concat(options.modules || [])

    return bootstrap(modules)
  }

  /**
   * The main diagram-js entry point that bootstraps the diagram with the given
   * configuration.
   *
   * To register extensions with the diagram, pass them as Array<didi.Module> to the constructor.
   *
   * @class djs.Diagram
   * @memberOf djs
   * @constructor
   *
   * @example
   *
   * <caption>Creating a plug-in that logs whenever a shape is added to the canvas.</caption>
   *
   * // plug-in implemenentation
   * function MyLoggingPlugin(eventBus) {
   *   eventBus.on('shape.added', function(event) {
   *     console.log('shape ', event.shape, ' was added to the diagram');
   *   });
   * }
   *
   * // export as module
   * export default {
   *   __init__: [ 'myLoggingPlugin' ],
   *     myLoggingPlugin: [ 'type', MyLoggingPlugin ]
   * };
   *
   *
   * // instantiate the diagram with the new plug-in
   *
   * import MyLoggingModule from 'path-to-my-logging-plugin';
   *
   * var diagram = new Diagram({
   *   modules: [
   *     MyLoggingModule
   *   ]
   * });
   *
   * diagram.invoke([ 'canvas', function(canvas) {
   *   // add shape to drawing canvas
   *   canvas.addShape({ x: 10, y: 10 });
   * });
   *
   * // 'shape ... was added to the diagram' logged to console
   *
   * @param {Object} options
   * @param {Array<didi.Module>} [options.modules] external modules to instantiate with the diagram
   * @param {didi.Injector} [injector] an (optional) injector to bootstrap the diagram with
   */
  function Diagram(options, injector) {
    // create injector unless explicitly specified
    this.injector = injector = injector || createInjector(options)

    // API

    /**
     * Resolves a diagram service
     *
     * @method Diagram#get
     *
     * @param {string} name the name of the diagram service to be retrieved
     * @param {boolean} [strict=true] if false, resolve missing services to null
     */
    this.get = injector.get

    /**
     * Executes a function into which diagram services are injected
     *
     * @method Diagram#invoke
     *
     * @param {Function|Object[]} fn the function to resolve
     * @param {Object} locals a number of locals to use to resolve certain dependencies
     */
    this.invoke = injector.invoke

    // init

    // indicate via event

    /**
     * An event indicating that all plug-ins are loaded.
     *
     * Use this event to fire other events to interested plug-ins
     *
     * @memberOf Diagram
     *
     * @event diagram.init
     *
     * @example
     *
     * eventBus.on('diagram.init', function() {
     *   eventBus.fire('my-custom-event', { foo: 'BAR' });
     * });
     *
     * @type {Object}
     */
    this.get('eventBus').fire('diagram.init')
  }

  /**
   * Destroys the diagram
   *
   * @method  Diagram#destroy
   */
  Diagram.prototype.destroy = function () {
    this.get('eventBus').fire('diagram.destroy')
  }

  /**
   * Clear the diagram, removing all contents.
   */
  Diagram.prototype.clear = function () {
    this.get('eventBus').fire('diagram.clear')
  }

  return Diagram
})
