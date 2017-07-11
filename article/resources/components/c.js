var frontend =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 30);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_styletron_preact__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_styletron_preact___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_styletron_preact__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_preact__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_preact___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_preact__);


function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

/* eslint-disable camelcase */

// bespoke wrapper around preact's `h` that passes any CSS data
// on `attributes.style` to styletron, then hands off to `preact#h`




/* harmony default export */ __webpack_exports__["a"] = (function (nodeName, attributes) {
    for (var _len = arguments.length, children = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        children[_key - 2] = arguments[_key];
    }

    var _ref = attributes || {},
        style = _ref.style,
        otherAttributes = _objectWithoutProperties(_ref, ['style']);

    return __WEBPACK_IMPORTED_MODULE_2_preact__["h"](__WEBPACK_IMPORTED_MODULE_1_styletron_preact__["styled"](nodeName, style), otherAttributes, children);
});

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// returns a style object with a single concated prefixed value string

exports.default = function (property, value) {
  var replacer = arguments.length <= 2 || arguments[2] === undefined ? function (prefix, value) {
    return prefix + value;
  } : arguments[2];
  return _defineProperty({}, property, ['-webkit-', '-moz-', ''].map(function (prefix) {
    return replacer(prefix, value);
  }));
};

module.exports = exports['default'];

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

!function() {
    'use strict';
    function VNode() {}
    function h(nodeName, attributes) {
        var lastSimple, child, simple, i, children = EMPTY_CHILDREN;
        for (i = arguments.length; i-- > 2; ) stack.push(arguments[i]);
        if (attributes && null != attributes.children) {
            if (!stack.length) stack.push(attributes.children);
            delete attributes.children;
        }
        while (stack.length) if ((child = stack.pop()) && void 0 !== child.pop) for (i = child.length; i--; ) stack.push(child[i]); else {
            if (child === !0 || child === !1) child = null;
            if (simple = 'function' != typeof nodeName) if (null == child) child = ''; else if ('number' == typeof child) child = String(child); else if ('string' != typeof child) simple = !1;
            if (simple && lastSimple) children[children.length - 1] += child; else if (children === EMPTY_CHILDREN) children = [ child ]; else children.push(child);
            lastSimple = simple;
        }
        var p = new VNode();
        p.nodeName = nodeName;
        p.children = children;
        p.attributes = null == attributes ? void 0 : attributes;
        p.key = null == attributes ? void 0 : attributes.key;
        if (void 0 !== options.vnode) options.vnode(p);
        return p;
    }
    function extend(obj, props) {
        for (var i in props) obj[i] = props[i];
        return obj;
    }
    function cloneElement(vnode, props) {
        return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
    }
    function enqueueRender(component) {
        if (!component.__d && (component.__d = !0) && 1 == items.push(component)) (options.debounceRendering || setTimeout)(rerender);
    }
    function rerender() {
        var p, list = items;
        items = [];
        while (p = list.pop()) if (p.__d) renderComponent(p);
    }
    function isSameNodeType(node, vnode, hydrating) {
        if ('string' == typeof vnode || 'number' == typeof vnode) return void 0 !== node.splitText;
        if ('string' == typeof vnode.nodeName) return !node._componentConstructor && isNamedNode(node, vnode.nodeName); else return hydrating || node._componentConstructor === vnode.nodeName;
    }
    function isNamedNode(node, nodeName) {
        return node.__n === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
    }
    function getNodeProps(vnode) {
        var props = extend({}, vnode.attributes);
        props.children = vnode.children;
        var defaultProps = vnode.nodeName.defaultProps;
        if (void 0 !== defaultProps) for (var i in defaultProps) if (void 0 === props[i]) props[i] = defaultProps[i];
        return props;
    }
    function createNode(nodeName, isSvg) {
        var node = isSvg ? document.createElementNS('http://www.w3.org/2000/svg', nodeName) : document.createElement(nodeName);
        node.__n = nodeName;
        return node;
    }
    function removeNode(node) {
        if (node.parentNode) node.parentNode.removeChild(node);
    }
    function setAccessor(node, name, old, value, isSvg) {
        if ('className' === name) name = 'class';
        if ('key' === name) ; else if ('ref' === name) {
            if (old) old(null);
            if (value) value(node);
        } else if ('class' === name && !isSvg) node.className = value || ''; else if ('style' === name) {
            if (!value || 'string' == typeof value || 'string' == typeof old) node.style.cssText = value || '';
            if (value && 'object' == typeof value) {
                if ('string' != typeof old) for (var i in old) if (!(i in value)) node.style[i] = '';
                for (var i in value) node.style[i] = 'number' == typeof value[i] && IS_NON_DIMENSIONAL.test(i) === !1 ? value[i] + 'px' : value[i];
            }
        } else if ('dangerouslySetInnerHTML' === name) {
            if (value) node.innerHTML = value.__html || '';
        } else if ('o' == name[0] && 'n' == name[1]) {
            var useCapture = name !== (name = name.replace(/Capture$/, ''));
            name = name.toLowerCase().substring(2);
            if (value) {
                if (!old) node.addEventListener(name, eventProxy, useCapture);
            } else node.removeEventListener(name, eventProxy, useCapture);
            (node.__l || (node.__l = {}))[name] = value;
        } else if ('list' !== name && 'type' !== name && !isSvg && name in node) {
            setProperty(node, name, null == value ? '' : value);
            if (null == value || value === !1) node.removeAttribute(name);
        } else {
            var ns = isSvg && name !== (name = name.replace(/^xlink\:?/, ''));
            if (null == value || value === !1) if (ns) node.removeAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase()); else node.removeAttribute(name); else if ('function' != typeof value) if (ns) node.setAttributeNS('http://www.w3.org/1999/xlink', name.toLowerCase(), value); else node.setAttribute(name, value);
        }
    }
    function setProperty(node, name, value) {
        try {
            node[name] = value;
        } catch (e) {}
    }
    function eventProxy(e) {
        return this.__l[e.type](options.event && options.event(e) || e);
    }
    function flushMounts() {
        var c;
        while (c = mounts.pop()) {
            if (options.afterMount) options.afterMount(c);
            if (c.componentDidMount) c.componentDidMount();
        }
    }
    function diff(dom, vnode, context, mountAll, parent, componentRoot) {
        if (!diffLevel++) {
            isSvgMode = null != parent && void 0 !== parent.ownerSVGElement;
            hydrating = null != dom && !('__preactattr_' in dom);
        }
        var ret = idiff(dom, vnode, context, mountAll, componentRoot);
        if (parent && ret.parentNode !== parent) parent.appendChild(ret);
        if (!--diffLevel) {
            hydrating = !1;
            if (!componentRoot) flushMounts();
        }
        return ret;
    }
    function idiff(dom, vnode, context, mountAll, componentRoot) {
        var out = dom, prevSvgMode = isSvgMode;
        if (null == vnode) vnode = '';
        if ('string' == typeof vnode) {
            if (dom && void 0 !== dom.splitText && dom.parentNode && (!dom._component || componentRoot)) {
                if (dom.nodeValue != vnode) dom.nodeValue = vnode;
            } else {
                out = document.createTextNode(vnode);
                if (dom) {
                    if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                    recollectNodeTree(dom, !0);
                }
            }
            out.__preactattr_ = !0;
            return out;
        }
        if ('function' == typeof vnode.nodeName) return buildComponentFromVNode(dom, vnode, context, mountAll);
        isSvgMode = 'svg' === vnode.nodeName ? !0 : 'foreignObject' === vnode.nodeName ? !1 : isSvgMode;
        if (!dom || !isNamedNode(dom, String(vnode.nodeName))) {
            out = createNode(String(vnode.nodeName), isSvgMode);
            if (dom) {
                while (dom.firstChild) out.appendChild(dom.firstChild);
                if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
                recollectNodeTree(dom, !0);
            }
        }
        var fc = out.firstChild, props = out.__preactattr_ || (out.__preactattr_ = {}), vchildren = vnode.children;
        if (!hydrating && vchildren && 1 === vchildren.length && 'string' == typeof vchildren[0] && null != fc && void 0 !== fc.splitText && null == fc.nextSibling) {
            if (fc.nodeValue != vchildren[0]) fc.nodeValue = vchildren[0];
        } else if (vchildren && vchildren.length || null != fc) innerDiffNode(out, vchildren, context, mountAll, hydrating || null != props.dangerouslySetInnerHTML);
        diffAttributes(out, vnode.attributes, props);
        isSvgMode = prevSvgMode;
        return out;
    }
    function innerDiffNode(dom, vchildren, context, mountAll, isHydrating) {
        var j, c, vchild, child, originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0;
        if (0 !== len) for (var i = 0; i < len; i++) {
            var _child = originalChildren[i], props = _child.__preactattr_, key = vlen && props ? _child._component ? _child._component.__k : props.key : null;
            if (null != key) {
                keyedLen++;
                keyed[key] = _child;
            } else if (props || (void 0 !== _child.splitText ? isHydrating ? _child.nodeValue.trim() : !0 : isHydrating)) children[childrenLen++] = _child;
        }
        if (0 !== vlen) for (var i = 0; i < vlen; i++) {
            vchild = vchildren[i];
            child = null;
            var key = vchild.key;
            if (null != key) {
                if (keyedLen && void 0 !== keyed[key]) {
                    child = keyed[key];
                    keyed[key] = void 0;
                    keyedLen--;
                }
            } else if (!child && min < childrenLen) for (j = min; j < childrenLen; j++) if (void 0 !== children[j] && isSameNodeType(c = children[j], vchild, isHydrating)) {
                child = c;
                children[j] = void 0;
                if (j === childrenLen - 1) childrenLen--;
                if (j === min) min++;
                break;
            }
            child = idiff(child, vchild, context, mountAll);
            if (child && child !== dom) if (i >= len) dom.appendChild(child); else if (child !== originalChildren[i]) if (child === originalChildren[i + 1]) removeNode(originalChildren[i]); else dom.insertBefore(child, originalChildren[i] || null);
        }
        if (keyedLen) for (var i in keyed) if (void 0 !== keyed[i]) recollectNodeTree(keyed[i], !1);
        while (min <= childrenLen) if (void 0 !== (child = children[childrenLen--])) recollectNodeTree(child, !1);
    }
    function recollectNodeTree(node, unmountOnly) {
        var component = node._component;
        if (component) unmountComponent(component); else {
            if (null != node.__preactattr_ && node.__preactattr_.ref) node.__preactattr_.ref(null);
            if (unmountOnly === !1 || null == node.__preactattr_) removeNode(node);
            removeChildren(node);
        }
    }
    function removeChildren(node) {
        node = node.lastChild;
        while (node) {
            var next = node.previousSibling;
            recollectNodeTree(node, !0);
            node = next;
        }
    }
    function diffAttributes(dom, attrs, old) {
        var name;
        for (name in old) if ((!attrs || null == attrs[name]) && null != old[name]) setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode);
        for (name in attrs) if (!('children' === name || 'innerHTML' === name || name in old && attrs[name] === ('value' === name || 'checked' === name ? dom[name] : old[name]))) setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
    }
    function collectComponent(component) {
        var name = component.constructor.name;
        (components[name] || (components[name] = [])).push(component);
    }
    function createComponent(Ctor, props, context) {
        var inst, list = components[Ctor.name];
        if (Ctor.prototype && Ctor.prototype.render) {
            inst = new Ctor(props, context);
            Component.call(inst, props, context);
        } else {
            inst = new Component(props, context);
            inst.constructor = Ctor;
            inst.render = doRender;
        }
        if (list) for (var i = list.length; i--; ) if (list[i].constructor === Ctor) {
            inst.__b = list[i].__b;
            list.splice(i, 1);
            break;
        }
        return inst;
    }
    function doRender(props, state, context) {
        return this.constructor(props, context);
    }
    function setComponentProps(component, props, opts, context, mountAll) {
        if (!component.__x) {
            component.__x = !0;
            if (component.__r = props.ref) delete props.ref;
            if (component.__k = props.key) delete props.key;
            if (!component.base || mountAll) {
                if (component.componentWillMount) component.componentWillMount();
            } else if (component.componentWillReceiveProps) component.componentWillReceiveProps(props, context);
            if (context && context !== component.context) {
                if (!component.__c) component.__c = component.context;
                component.context = context;
            }
            if (!component.__p) component.__p = component.props;
            component.props = props;
            component.__x = !1;
            if (0 !== opts) if (1 === opts || options.syncComponentUpdates !== !1 || !component.base) renderComponent(component, 1, mountAll); else enqueueRender(component);
            if (component.__r) component.__r(component);
        }
    }
    function renderComponent(component, opts, mountAll, isChild) {
        if (!component.__x) {
            var rendered, inst, cbase, props = component.props, state = component.state, context = component.context, previousProps = component.__p || props, previousState = component.__s || state, previousContext = component.__c || context, isUpdate = component.base, nextBase = component.__b, initialBase = isUpdate || nextBase, initialChildComponent = component._component, skip = !1;
            if (isUpdate) {
                component.props = previousProps;
                component.state = previousState;
                component.context = previousContext;
                if (2 !== opts && component.shouldComponentUpdate && component.shouldComponentUpdate(props, state, context) === !1) skip = !0; else if (component.componentWillUpdate) component.componentWillUpdate(props, state, context);
                component.props = props;
                component.state = state;
                component.context = context;
            }
            component.__p = component.__s = component.__c = component.__b = null;
            component.__d = !1;
            if (!skip) {
                rendered = component.render(props, state, context);
                if (component.getChildContext) context = extend(extend({}, context), component.getChildContext());
                var toUnmount, base, childComponent = rendered && rendered.nodeName;
                if ('function' == typeof childComponent) {
                    var childProps = getNodeProps(rendered);
                    inst = initialChildComponent;
                    if (inst && inst.constructor === childComponent && childProps.key == inst.__k) setComponentProps(inst, childProps, 1, context, !1); else {
                        toUnmount = inst;
                        component._component = inst = createComponent(childComponent, childProps, context);
                        inst.__b = inst.__b || nextBase;
                        inst.__u = component;
                        setComponentProps(inst, childProps, 0, context, !1);
                        renderComponent(inst, 1, mountAll, !0);
                    }
                    base = inst.base;
                } else {
                    cbase = initialBase;
                    toUnmount = initialChildComponent;
                    if (toUnmount) cbase = component._component = null;
                    if (initialBase || 1 === opts) {
                        if (cbase) cbase._component = null;
                        base = diff(cbase, rendered, context, mountAll || !isUpdate, initialBase && initialBase.parentNode, !0);
                    }
                }
                if (initialBase && base !== initialBase && inst !== initialChildComponent) {
                    var baseParent = initialBase.parentNode;
                    if (baseParent && base !== baseParent) {
                        baseParent.replaceChild(base, initialBase);
                        if (!toUnmount) {
                            initialBase._component = null;
                            recollectNodeTree(initialBase, !1);
                        }
                    }
                }
                if (toUnmount) unmountComponent(toUnmount);
                component.base = base;
                if (base && !isChild) {
                    var componentRef = component, t = component;
                    while (t = t.__u) (componentRef = t).base = base;
                    base._component = componentRef;
                    base._componentConstructor = componentRef.constructor;
                }
            }
            if (!isUpdate || mountAll) mounts.unshift(component); else if (!skip) {
                flushMounts();
                if (component.componentDidUpdate) component.componentDidUpdate(previousProps, previousState, previousContext);
                if (options.afterUpdate) options.afterUpdate(component);
            }
            if (null != component.__h) while (component.__h.length) component.__h.pop().call(component);
            if (!diffLevel && !isChild) flushMounts();
        }
    }
    function buildComponentFromVNode(dom, vnode, context, mountAll) {
        var c = dom && dom._component, originalComponent = c, oldDom = dom, isDirectOwner = c && dom._componentConstructor === vnode.nodeName, isOwner = isDirectOwner, props = getNodeProps(vnode);
        while (c && !isOwner && (c = c.__u)) isOwner = c.constructor === vnode.nodeName;
        if (c && isOwner && (!mountAll || c._component)) {
            setComponentProps(c, props, 3, context, mountAll);
            dom = c.base;
        } else {
            if (originalComponent && !isDirectOwner) {
                unmountComponent(originalComponent);
                dom = oldDom = null;
            }
            c = createComponent(vnode.nodeName, props, context);
            if (dom && !c.__b) {
                c.__b = dom;
                oldDom = null;
            }
            setComponentProps(c, props, 1, context, mountAll);
            dom = c.base;
            if (oldDom && dom !== oldDom) {
                oldDom._component = null;
                recollectNodeTree(oldDom, !1);
            }
        }
        return dom;
    }
    function unmountComponent(component) {
        if (options.beforeUnmount) options.beforeUnmount(component);
        var base = component.base;
        component.__x = !0;
        if (component.componentWillUnmount) component.componentWillUnmount();
        component.base = null;
        var inner = component._component;
        if (inner) unmountComponent(inner); else if (base) {
            if (base.__preactattr_ && base.__preactattr_.ref) base.__preactattr_.ref(null);
            component.__b = base;
            removeNode(base);
            collectComponent(component);
            removeChildren(base);
        }
        if (component.__r) component.__r(null);
    }
    function Component(props, context) {
        this.__d = !0;
        this.context = context;
        this.props = props;
        this.state = this.state || {};
    }
    function render(vnode, parent, merge) {
        return diff(merge, vnode, {}, !1, parent, !1);
    }
    var options = {};
    var stack = [];
    var EMPTY_CHILDREN = [];
    var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;
    var items = [];
    var mounts = [];
    var diffLevel = 0;
    var isSvgMode = !1;
    var hydrating = !1;
    var components = {};
    extend(Component.prototype, {
        setState: function(state, callback) {
            var s = this.state;
            if (!this.__s) this.__s = extend({}, s);
            extend(s, 'function' == typeof state ? state(s, this.props) : state);
            if (callback) (this.__h = this.__h || []).push(callback);
            enqueueRender(this);
        },
        forceUpdate: function(callback) {
            if (callback) (this.__h = this.__h || []).push(callback);
            renderComponent(this, 2);
        },
        render: function() {}
    });
    var preact = {
        h: h,
        createElement: h,
        cloneElement: cloneElement,
        Component: Component,
        render: render,
        rerender: rerender,
        options: options
    };
    if (true) module.exports = preact; else self.preact = preact;
}();
//# sourceMappingURL=preact.js.map

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (value) {
  if (Array.isArray(value)) value = value.join(',');

  return value.match(/-webkit-|-moz-|-ms-/) !== null;
};

module.exports = exports['default'];

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  StyletronProvider: __webpack_require__(8),
  styled: __webpack_require__(9)
};


/***/ }),
/* 5 */
/***/ (function(module, exports) {

var uppercasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
var cache = {};

module.exports = hyphenateStyleName;

function hyphenateStyleName(prop) {
  return prop in cache
    ? cache[prop]
    : cache[prop] = prop
      .replace(uppercasePattern, '-$&')
      .toLowerCase()
      .replace(msPattern, '-ms-');
}


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = { "Webkit": { "transform": true, "transformOrigin": true, "transformOriginX": true, "transformOriginY": true, "backfaceVisibility": true, "perspective": true, "perspectiveOrigin": true, "transformStyle": true, "transformOriginZ": true, "animation": true, "animationDelay": true, "animationDirection": true, "animationFillMode": true, "animationDuration": true, "animationIterationCount": true, "animationName": true, "animationPlayState": true, "animationTimingFunction": true, "appearance": true, "userSelect": true, "fontKerning": true, "textEmphasisPosition": true, "textEmphasis": true, "textEmphasisStyle": true, "textEmphasisColor": true, "boxDecorationBreak": true, "clipPath": true, "maskImage": true, "maskMode": true, "maskRepeat": true, "maskPosition": true, "maskClip": true, "maskOrigin": true, "maskSize": true, "maskComposite": true, "mask": true, "maskBorderSource": true, "maskBorderMode": true, "maskBorderSlice": true, "maskBorderWidth": true, "maskBorderOutset": true, "maskBorderRepeat": true, "maskBorder": true, "maskType": true, "textDecorationStyle": true, "textDecorationSkip": true, "textDecorationLine": true, "textDecorationColor": true, "filter": true, "fontFeatureSettings": true, "breakAfter": true, "breakBefore": true, "breakInside": true, "columnCount": true, "columnFill": true, "columnGap": true, "columnRule": true, "columnRuleColor": true, "columnRuleStyle": true, "columnRuleWidth": true, "columns": true, "columnSpan": true, "columnWidth": true, "flex": true, "flexBasis": true, "flexDirection": true, "flexGrow": true, "flexFlow": true, "flexShrink": true, "flexWrap": true, "alignContent": true, "alignItems": true, "alignSelf": true, "justifyContent": true, "order": true, "transition": true, "transitionDelay": true, "transitionDuration": true, "transitionProperty": true, "transitionTimingFunction": true, "backdropFilter": true, "scrollSnapType": true, "scrollSnapPointsX": true, "scrollSnapPointsY": true, "scrollSnapDestination": true, "scrollSnapCoordinate": true, "shapeImageThreshold": true, "shapeImageMargin": true, "shapeImageOutside": true, "hyphens": true, "flowInto": true, "flowFrom": true, "regionFragment": true, "textSizeAdjust": true }, "Moz": { "appearance": true, "userSelect": true, "boxSizing": true, "textAlignLast": true, "textDecorationStyle": true, "textDecorationSkip": true, "textDecorationLine": true, "textDecorationColor": true, "tabSize": true, "hyphens": true, "fontFeatureSettings": true, "breakAfter": true, "breakBefore": true, "breakInside": true, "columnCount": true, "columnFill": true, "columnGap": true, "columnRule": true, "columnRuleColor": true, "columnRuleStyle": true, "columnRuleWidth": true, "columns": true, "columnSpan": true, "columnWidth": true }, "ms": { "flex": true, "flexBasis": false, "flexDirection": true, "flexGrow": false, "flexFlow": true, "flexShrink": false, "flexWrap": true, "alignContent": false, "alignItems": false, "alignSelf": false, "justifyContent": false, "order": false, "transform": true, "transformOrigin": true, "transformOriginX": true, "transformOriginY": true, "userSelect": true, "wrapFlow": true, "wrapThrough": true, "wrapMargin": true, "scrollSnapType": true, "scrollSnapPointsX": true, "scrollSnapPointsY": true, "scrollSnapDestination": true, "scrollSnapCoordinate": true, "touchAction": true, "hyphens": true, "flowInto": true, "flowFrom": true, "breakBefore": true, "breakAfter": true, "breakInside": true, "regionFragment": true, "gridTemplateColumns": true, "gridTemplateRows": true, "gridTemplateAreas": true, "gridTemplate": true, "gridAutoColumns": true, "gridAutoRows": true, "gridAutoFlow": true, "grid": true, "gridRowStart": true, "gridColumnStart": true, "gridRowEnd": true, "gridRow": true, "gridColumn": true, "gridColumnEnd": true, "gridColumnGap": true, "gridRowGap": true, "gridArea": true, "gridGap": true, "textSizeAdjust": true } };
module.exports = exports["default"];

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
// helper to capitalize strings

exports.default = function (str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

module.exports = exports["default"];

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var Preact = __webpack_require__(2);

/**
 * @class StyletronProvider
 * @packagename styletron-preact
 * @description Provides a Styletron instance to descendant styled components via context
 * @example
 * const Styletron = require('styletron');
 * const renderToString = require('preact-render-to-string');
 *
 * function render() {
 *   return renderToString(
 *     <StyletronProvider styletron={new Styletron()}>
 *       <App/>
 *     </StyletronProvider>
 *   );
 * }
 *
 * @property {object} styletron - Styletron instance
 * @property {PreactElement} children - children
 * @extends PreactClass
 */
var StyletronProvider = (function (superclass) {
  function StyletronProvider(props, context) {
    superclass.call(this, props, context);
    this.styletron = props.styletron;
  }

  if ( superclass ) StyletronProvider.__proto__ = superclass;
  StyletronProvider.prototype = Object.create( superclass && superclass.prototype );
  StyletronProvider.prototype.constructor = StyletronProvider;
  StyletronProvider.prototype.getChildContext = function getChildContext () {
    return {styletron: this.styletron};
  };

  StyletronProvider.prototype.render = function render () {
    return this.props.children[0];
  };

  return StyletronProvider;
}(Preact.Component));

module.exports = StyletronProvider;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

var Preact = __webpack_require__(2);
var utils = __webpack_require__(10);

var STYLETRON_KEY = '__STYLETRON';

module.exports = styled;

/**
 * Helper function to create styled element components
 * @packagename styletron-preact
 * @param  {String|function} base     Tag name or styled element component
 * @param  {function|object} styleFn  Style object or function that returns a style object
 * @return {function}                 Styled element component
 * @example
 * import {styled} from 'styletron-preact';
 *
 * const Panel = styled('div', {
 *   backgroundColor: 'lightblue',
 *   fontSize: '12px'
 * });
 *
 * <Panel>Hello World</Panel>
 * @example
 * import {styled} from 'styletron-preact';
 *
 * const Panel = styled('div', (props) => ({
 *   backgroundColor: props.alert ? 'orange' : 'lightblue',
 *   fontSize: '12px'
 * }));
 *
 * <Panel alert>Danger!</Panel>
 * @example
 * import {styled} from 'styletron-preact';
 *
 * const DeluxePanel = styled(Panel, (props) => ({
 *   backgroundColor: props.alert ? 'firebrick' : 'rebeccapurple',
 *   color: 'white',
 *   boxShadow: '3px 3px 3px darkgray'
 * }));
 *
 * <DeluxePanel>Bonjour Monde</DeluxePanel>
 */
function styled(base, styleArg) {
  if (typeof base === 'function' && base[STYLETRON_KEY]) {
    var ref = base[STYLETRON_KEY];
    var tag = ref.tag;
    var styles = ref.styles;
    // Styled component
    return createStyledElementComponent(tag, styles.concat(styleArg));
  }
  if (typeof base === 'string' || typeof base === 'function') {
    // Tag name or non-styled component
    return createStyledElementComponent(base, [styleArg]);
  }
  throw new Error('`styled` takes either a DOM element name or a component');
}

function createStyledElementComponent(tagName, stylesArray) {
  var StyledElement = function (props, context) {
    var restProps = assign({}, props);
    delete restProps.innerRef;

    var resolvedStyle = {};
    StyledElement[STYLETRON_KEY].styles.forEach(function (style) {
      if (typeof style === 'function') {
        assign(resolvedStyle, style(restProps, context));
      } else if (typeof style === 'object') {
        assign(resolvedStyle, style);
      }
    });

    var styletronClassName = utils.injectStylePrefixed(
      context.styletron,
      resolvedStyle
    );

    restProps.className = restProps.className
      ? ((restProps.className) + " " + styletronClassName)
      : styletronClassName;

    if (props.innerRef) {
      restProps.ref = props.innerRef;
    }

    return Preact.h(
      StyledElement[STYLETRON_KEY].tag,
      restProps
    );
  };
  StyledElement[STYLETRON_KEY] = {
    tag: tagName,
    styles: stylesArray
  };

  return StyledElement;
}

function assign(target, source) {
  for (var key in source) {
    target[key] = source[key];
  }
  return target;
}


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = {
  injectStyle: __webpack_require__(11),
  injectStylePrefixed: __webpack_require__(12)
};


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var hyphenate = __webpack_require__(5);

module.exports = injectStyle;

function injectStyle(styletron, styles, media, pseudo) {
  var classString = '';
  for (var key in styles) {
    var val = styles[key];
    var valType = typeof val;
    if (valType === 'string' || valType === 'number') {
      classString += ' ' + styletron.injectDeclaration({prop: hyphenate(key), val: val, media: media, pseudo: pseudo});
      continue;
    }
    if (Array.isArray(val)) {
      for (var i = 0; i < val.length; i++) {
        var hyphenated = hyphenate(key);
        classString += ' ' + styletron.injectDeclaration({prop: hyphenated, val: val[i], media: media, pseudo: pseudo});
      }
      continue;
    }
    if (valType === 'object') {
      if (key[0] === ':') {
        classString += ' ' + injectStyle(styletron, val, media, key);
        continue;
      }
      if (key.substring(0, 6) === '@media') {
        classString += ' ' + injectStyle(styletron, val, key.substr(7), pseudo);
        continue;
      }
    }
  }
  // remove leading space on way out
  return classString.slice(1);
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var prefixProperties = __webpack_require__(6);
var capitalizeString = __webpack_require__(7);
var prefixPropertiesArray = Object.keys(prefixProperties);

var calc = __webpack_require__(13);
var cursor = __webpack_require__(14);
var flex = __webpack_require__(15);
var sizing = __webpack_require__(16);
var gradient = __webpack_require__(17);
var transition = __webpack_require__(18);
// special flexbox specifications
var flexboxIE = __webpack_require__(20);
var flexboxOld = __webpack_require__(21);

var plugins = [
  calc,
  cursor,
  sizing,
  gradient,
  transition,
  flexboxIE,
  flexboxOld,
  flex
];

var hyphenate = __webpack_require__(5);

module.exports = injectStyle;

function injectStyle(styletron, styles, media, pseudo) {
  var classString = '';
  for (var key in styles) {
    var val = styles[key];
    var valType = typeof val;
    if (valType === 'string' || valType === 'number') {
      // handle vendor prefixed properties
      for (var i = 0; i < prefixPropertiesArray.length; i++) {
        var prefix = prefixPropertiesArray[i];
        var properties = prefixProperties[prefix];
        if (properties[key]) {
          var prefixedPropName = prefix + capitalizeString(key);
          classString += ' ' + injectWithPlugins(styletron, prefixedPropName, val, media, pseudo);
        }
      }
      // handle un-prefixed
      classString += ' ' + injectWithPlugins(styletron, key, val, media, pseudo);
      continue;
    }
    if (Array.isArray(val)) {
      for (var i$1 = 0; i$1 < val.length; i$1++) {
        classString += ' ' + injectWithPlugins(styletron, key, val[i$1], media, pseudo);
      }
      continue;
    }
    if (valType === 'object') {
      if (key[0] === ':') {
        classString += ' ' + injectStyle(styletron, val, media, key);
        continue;
      }
      if (key.substring(0, 6) === '@media') {
        classString += ' ' + injectStyle(styletron, val, key.substr(7), pseudo);
        continue;
      }
    }
  }
  // remove leading space on way out
  return classString.slice(1);
}

function injectWithPlugins(styletron, prop, val, media, pseudo) {
  var classString = '';
  var baseHyphenated = hyphenate(prop);
  for (var i = 0; i < plugins.length; i++) {
    var plugin = plugins[i];
    var res = plugin(prop, val);
    if (res) {
      for (var key in res) {
        var resVal = res[key];
        var hyphenated = hyphenate(key);
        var propIsDifferent = hyphenated !== baseHyphenated;
        if (Array.isArray(resVal)) {
          for (var j = 0; j < resVal.length; j++) {
            if (propIsDifferent || resVal[j] !== val) {
              classString += ' ' + styletron.injectDeclaration({prop: hyphenated, val: resVal[j], media: media, pseudo: pseudo});
            }
          }
        } else if (propIsDifferent || resVal !== val) {
          classString += ' ' + styletron.injectDeclaration({prop: hyphenated, val: resVal, media: media, pseudo: pseudo});
        }
      }
    }
  }
  // inject original last
  classString += ' ' + styletron.injectDeclaration({prop: baseHyphenated, val: val, media: media, pseudo: pseudo});
  // remove leading space on way out
  return classString.slice(1);
}


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = calc;

var _joinPrefixedValue = __webpack_require__(1);

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

var _isPrefixedValue = __webpack_require__(3);

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function calc(property, value) {
  if (typeof value === 'string' && !(0, _isPrefixedValue2.default)(value) && value.indexOf('calc(') > -1) {
    return (0, _joinPrefixedValue2.default)(property, value, function (prefix, value) {
      return value.replace(/calc\(/g, prefix + 'calc(');
    });
  }
}
module.exports = exports['default'];

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = cursor;

var _joinPrefixedValue = __webpack_require__(1);

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var values = {
  'zoom-in': true,
  'zoom-out': true,
  grab: true,
  grabbing: true
};

function cursor(property, value) {
  if (property === 'cursor' && values[value]) {
    return (0, _joinPrefixedValue2.default)(property, value);
  }
}
module.exports = exports['default'];

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flex;
var values = { flex: true, 'inline-flex': true };

function flex(property, value) {
  if (property === 'display' && values[value]) {
    return {
      display: ['-webkit-box', '-moz-box', '-ms-' + value + 'box', '-webkit-' + value, value]
    };
  }
}
module.exports = exports['default'];

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = sizing;

var _joinPrefixedValue = __webpack_require__(1);

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var properties = {
  maxHeight: true,
  maxWidth: true,
  width: true,
  height: true,
  columnWidth: true,
  minWidth: true,
  minHeight: true
};
var values = {
  'min-content': true,
  'max-content': true,
  'fill-available': true,
  'fit-content': true,
  'contain-floats': true
};

function sizing(property, value) {
  if (properties[property] && values[value]) {
    return (0, _joinPrefixedValue2.default)(property, value);
  }
}
module.exports = exports['default'];

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = gradient;

var _joinPrefixedValue = __webpack_require__(1);

var _joinPrefixedValue2 = _interopRequireDefault(_joinPrefixedValue);

var _isPrefixedValue = __webpack_require__(3);

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var values = /linear-gradient|radial-gradient|repeating-linear-gradient|repeating-radial-gradient/;

function gradient(property, value) {
  if (typeof value === 'string' && !(0, _isPrefixedValue2.default)(value) && value.match(values) !== null) {
    return (0, _joinPrefixedValue2.default)(property, value);
  }
}
module.exports = exports['default'];

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = transition;

var _hyphenateStyleName = __webpack_require__(19);

var _hyphenateStyleName2 = _interopRequireDefault(_hyphenateStyleName);

var _capitalizeString = __webpack_require__(7);

var _capitalizeString2 = _interopRequireDefault(_capitalizeString);

var _isPrefixedValue = __webpack_require__(3);

var _isPrefixedValue2 = _interopRequireDefault(_isPrefixedValue);

var _prefixProps = __webpack_require__(6);

var _prefixProps2 = _interopRequireDefault(_prefixProps);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var properties = {
  transition: true,
  transitionProperty: true,
  WebkitTransition: true,
  WebkitTransitionProperty: true
};

function transition(property, value) {
  // also check for already prefixed transitions
  if (typeof value === 'string' && properties[property]) {
    var _ref2;

    var outputValue = prefixValue(value);
    var webkitOutput = outputValue.split(/,(?![^()]*(?:\([^()]*\))?\))/g).filter(function (value) {
      return value.match(/-moz-|-ms-/) === null;
    }).join(',');

    // if the property is already prefixed
    if (property.indexOf('Webkit') > -1) {
      return _defineProperty({}, property, webkitOutput);
    }

    return _ref2 = {}, _defineProperty(_ref2, 'Webkit' + (0, _capitalizeString2.default)(property), webkitOutput), _defineProperty(_ref2, property, outputValue), _ref2;
  }
}

function prefixValue(value) {
  if ((0, _isPrefixedValue2.default)(value)) {
    return value;
  }

  // only split multi values, not cubic beziers
  var multipleValues = value.split(/,(?![^()]*(?:\([^()]*\))?\))/g);

  // iterate each single value and check for transitioned properties
  // that need to be prefixed as well
  multipleValues.forEach(function (val, index) {
    multipleValues[index] = Object.keys(_prefixProps2.default).reduce(function (out, prefix) {
      var dashCasePrefix = '-' + prefix.toLowerCase() + '-';

      Object.keys(_prefixProps2.default[prefix]).forEach(function (prop) {
        var dashCaseProperty = (0, _hyphenateStyleName2.default)(prop);

        if (val.indexOf(dashCaseProperty) > -1 && dashCaseProperty !== 'order') {
          // join all prefixes and create a new value
          out = val.replace(dashCaseProperty, dashCasePrefix + dashCaseProperty) + ',' + out;
        }
      });
      return out;
    }, val);
  });

  return multipleValues.join(',');
}
module.exports = exports['default'];

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var uppercasePattern = /[A-Z]/g;
var msPattern = /^ms-/;
var cache = {};

function hyphenateStyleName(string) {
    return string in cache
    ? cache[string]
    : cache[string] = string
      .replace(uppercasePattern, '-$&')
      .toLowerCase()
      .replace(msPattern, '-ms-');
}

module.exports = hyphenateStyleName;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flexboxIE;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var alternativeValues = {
  'space-around': 'distribute',
  'space-between': 'justify',
  'flex-start': 'start',
  'flex-end': 'end'
};
var alternativeProps = {
  alignContent: 'msFlexLinePack',
  alignSelf: 'msFlexItemAlign',
  alignItems: 'msFlexAlign',
  justifyContent: 'msFlexPack',
  order: 'msFlexOrder',
  flexGrow: 'msFlexPositive',
  flexShrink: 'msFlexNegative',
  flexBasis: 'msPreferredSize'
};

function flexboxIE(property, value) {
  if (alternativeProps[property]) {
    return _defineProperty({}, alternativeProps[property], alternativeValues[value] || value);
  }
}
module.exports = exports['default'];

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flexboxOld;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var alternativeValues = {
  'space-around': 'justify',
  'space-between': 'justify',
  'flex-start': 'start',
  'flex-end': 'end',
  'wrap-reverse': 'multiple',
  wrap: 'multiple'
};

var alternativeProps = {
  alignItems: 'WebkitBoxAlign',
  justifyContent: 'WebkitBoxPack',
  flexWrap: 'WebkitBoxLines'
};

function flexboxOld(property, value) {
  if (property === 'flexDirection' && typeof value === 'string') {
    return {
      WebkitBoxOrient: value.indexOf('column') > -1 ? 'vertical' : 'horizontal',
      WebkitBoxDirection: value.indexOf('reverse') > -1 ? 'reverse' : 'normal'
    };
  }
  if (alternativeProps[property]) {
    return _defineProperty({}, alternativeProps[property], alternativeValues[value] || value);
  }
}
module.exports = exports['default'];

/***/ }),
/* 22 */
/***/ (function(module, exports) {

/**
 * The core styletron module
 * @packagename styletron-core
 */
var StyletronCore = function StyletronCore(ref) {
  if ( ref === void 0 ) ref = {};
  var prefix = ref.prefix; if ( prefix === void 0 ) prefix = '';

  this.cache = {
    media: {},
    pseudo: {}
  };
  this.prefix = prefix === '' ? false : prefix;
  this.uniqueCount = 0;
  this.offset = 10; // skip 0-9
  this.msb = 35;
  this.power = 1;
};

StyletronCore.assignDecl = function assignDecl (target, decl, className) {
  var prop = decl.prop;
    var val = decl.val;
    var media = decl.media;
    var pseudo = decl.pseudo;
  var targetEntry;
  if (media) {
    if (!target.media[media]) {
      target.media[media] = {pseudo: {}};
    }
    targetEntry = target.media[media];
  } else {
    targetEntry = target;
  }
  if (pseudo) {
    if (!targetEntry.pseudo[pseudo]) {
      targetEntry.pseudo[pseudo] = {};
    }
    targetEntry = targetEntry.pseudo[pseudo];
  }
  if (!targetEntry[prop]) {
    targetEntry[prop] = {};
  }
  targetEntry[prop][val] = className;
};

/**
 * Injects a declaration (if not already injected) and returns a class name
 * @param{object} decl        The CSS declaration object
 * @param{string} decl.prop   The property name
 * @param{string} decl.val    The property value
 * @param{string} [decl.media]The media query
 * @param{string} [decl.pseudo] The pseudo selector
 * @return {string|undefined}   The class name for the declaration
 */
StyletronCore.prototype.injectDeclaration = function injectDeclaration (decl) {
  var cached = this.getCachedDeclaration(decl);
  if (cached) {
    return cached;
  }
  var virtualCount = this.incrementVirtualCount();
  var hash = virtualCount.toString(36);
  var className = this.prefix ? this.prefix + hash : hash;
  StyletronCore.assignDecl(this.cache, decl, className);
  return className;
};

/**
 * Get the next virtual class number, while setting
 * the uniqueCount, offset, and msb counters appropriately.
 * @return {number} The virtual class count
 * @private
 */
StyletronCore.prototype.incrementVirtualCount = function incrementVirtualCount () {
  var virtualCount = this.uniqueCount + this.offset;
  if (virtualCount === this.msb) {
    this.offset += (this.msb + 1) * 9;
    this.msb = Math.pow(36, ++this.power) - 1;
  }
  this.uniqueCount++;
  return virtualCount;
};

/**
 * Gets the class name for an already injected declaration
 * @param{object} decl        The CSS declaration object
 * @param{string} decl.prop   The property name
 * @param{string} decl.val    The property value
 * @param{string} [decl.media]The media query
 * @param{string} [decl.pseudo] The pseudo selector
 * @return {string|undefined}   The class name for the declaration
 * @private
 */
StyletronCore.prototype.getCachedDeclaration = function getCachedDeclaration (ref) {
    var prop = ref.prop;
    var val = ref.val;
    var media = ref.media;
    var pseudo = ref.pseudo;

  var entry;
  if (media) {
    entry = this.cache.media[media];
    if (!entry) {
      return false;
    }
  } else {
    entry = this.cache;
  }
  if (pseudo) {
    entry = entry.pseudo[pseudo];
    if (!entry) {
      return false;
    }
  }
  return entry[prop] && entry[prop].hasOwnProperty(val) && entry[prop][val];
};

module.exports = StyletronCore;


/***/ }),
/* 23 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });

// CONCATENATED MODULE: ./src/app/components/button/index.jsx
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__style_scss__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__style_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__style_scss__);



/* harmony default export */ var button_defaultExport = (function (props) {
    return __WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
        'button',
        {
            style: __WEBPACK_IMPORTED_MODULE_1__style_scss___default.a.button,
            onClick: function onClick() {
                return console.log('clicked the button!!');
            }
        },
        props.children
    );
});
// CONCATENATED MODULE: ./src/app/views/article.jsx
/* harmony import */ var article___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__article_scss__ = __webpack_require__(25);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__article_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__article_scss__);




/* harmony default export */ var article_defaultExport = (function (props) {
    return article___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
        'header',
        { style: __WEBPACK_IMPORTED_MODULE_2__article_scss___default.a['.header'] },
        article___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
            'div',
            { style: __WEBPACK_IMPORTED_MODULE_2__article_scss___default.a['.content-labels'] },
            article___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
                'a',
                {
                    style: __WEBPACK_IMPORTED_MODULE_2__article_scss___default.a['.section-label'],
                    'data-link-name': 'article section',
                    href: 'https://m.code.dev-theguardian.com/uk/ruralaffairs'
                },
                'Rural affairs'
            ),
            article___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
                'a',
                {
                    style: __WEBPACK_IMPORTED_MODULE_2__article_scss___default.a['.series-label'],
                    href: 'https://m.code.dev-theguardian.com/environment/series/country-diary'
                },
                'Country diary'
            ),
            article___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
                button_defaultExport,
                props,
                'hi!'
            )
        ),
        article___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
            'h1',
            { style: __WEBPACK_IMPORTED_MODULE_2__article_scss___default.a['.headline'], itemProp: 'headline' },
            props.page.headline
        )
    );
});
// CONCATENATED MODULE: ./src/app/layouts/body.jsx
/* harmony import */ var body___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style_scss__ = __webpack_require__(26);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__style_scss___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__style_scss__);




/* harmony default export */ __webpack_exports__["a"] = (function (props) {
    return body___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
        'body',
        { style: __WEBPACK_IMPORTED_MODULE_2__style_scss__["body"] },
        body___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
            'div',
            { style: __WEBPACK_IMPORTED_MODULE_2__style_scss__["side"] },
            body___WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](article_defaultExport, props)
        )
    );
});

/***/ }),
/* 24 */
/***/ (function(module, exports) {

module.exports = {"button":{"font-size":"15px","background-color":"#00e600","@media (min-width: 20em) and (max-width: 46.24em)":{"background":"red"}}};

/***/ }),
/* 25 */
/***/ (function(module, exports) {

module.exports = {".header":{"background-color":"#951c55"},".content-labels":{"border-bottom":"1px dotted rgba(255, 255, 255, 0.3)","padding":"0.375rem 0"},".section-label":{"color":"#fdadba"},".series-label":{"color":"#fff"},".headline":{"font-weight":"200","color":"#fff","font-size":"2.25rem","line-height":"2.5rem","padding-top":"0.125rem","padding-bottom":"1.5rem"}};

/***/ }),
/* 26 */
/***/ (function(module, exports) {

module.exports = {"side":{":before":{"left":"0","content":"''","position":"relative","z-index":"1","background":"rgba(51, 51, 51, 0.05)","top":"0","height":"100%","width":"calc((100% - 46.25rem) / 2)"},":after":{"right":"0","content":"''","position":"relative","z-index":"1","background":"rgba(51, 51, 51, 0.05)","top":"0","height":"100%","width":"calc((100% - 46.25rem) / 2)"}},"body":{"background-color":"#fff","text-rendering":"optimizeLegibility","font-feature-settings":"kern","font-kerning":"normal","line-height":"1.5","color":"#333"}};

/***/ }),
/* 27 */
/***/ (function(module, exports) {

module.exports = baseHandler;

function baseHandler(key, valueObj) {
  return key === 'pseudo' ?
    pseudoObjToCss(valueObj) : valsObjToCss(key, valueObj);
}

function pseudoObjToCss(pseudoObj) {
  var css = '';
  for (var pseudoClass in pseudoObj) {
    var propsObj = pseudoObj[pseudoClass];
    for (var prop in propsObj) {
      css += valsObjToCss(prop, propsObj[prop], pseudoClass);
    }
  }
  return css;
}

function valsObjToCss(prop, valsObj, pseudo) {
  var css = '';
  for (var val in valsObj) {
    var className = valsObj[val];
    css += declToCss(prop, val, className, pseudo);
  }
  return css;
}

function declToCss(prop, val, className, pseudo) {
  var classString = pseudo ? ("" + className + pseudo) : className;
  return ("." + classString + "{" + prop + ":" + val + "}");
}


/***/ }),
/* 28 */,
/* 29 */,
/* 30 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "render", function() { return render; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_preact_render_to_string__ = __webpack_require__(31);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_preact_render_to_string___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_preact_render_to_string__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_styletron_preact__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_styletron_preact___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_styletron_preact__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_styletron_server__ = __webpack_require__(32);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_styletron_server___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_styletron_server__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_layouts_body__ = __webpack_require__(23);

// //
// /* eslint-disable global-require */






var styletron = new __WEBPACK_IMPORTED_MODULE_3_styletron_server___default.a();

var body = function body(props) {
    return __WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](
        __WEBPACK_IMPORTED_MODULE_2_styletron_preact__["StyletronProvider"],
        { styletron: styletron },
        __WEBPACK_IMPORTED_MODULE_0_lib_h_jsx__["a" /* default */](__WEBPACK_IMPORTED_MODULE_4_layouts_body__["a" /* default */], props)
    );
};

// the main export for the JVM JS interpreter to run
// eslint-disable-next-line import/prefer-default-export
var render = function render(props) {
    return '\n    <html lang="en">\n        <head>\n            <title>' + props.page.headline + ' | ' + props.page.section + ' | The Guardian</title>\n            <style>\n            *, * > * {\n                margin: 0;\n                padding: 0;\n                box-sizing: border-box;\n            }\n            </style>\n            ' + styletron.getStylesheetsHtml() + '\n            <script>window.guardian = ' + JSON.stringify(props, null, 2) + ';</script>\n            <script src="/bundle.browser.js" async defer></script>\n        </head>\n        ' + __WEBPACK_IMPORTED_MODULE_1_preact_render_to_string__["render"](body(props)) + '\n    </html>\n';
};

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

(function (global, factory) {
	 true ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.preactRenderToString = factory());
}(this, (function () {

var NON_DIMENSION_PROPS = {
	boxFlex: 1, boxFlexGroup: 1, columnCount: 1, fillOpacity: 1, flex: 1, flexGrow: 1,
	flexPositive: 1, flexShrink: 1, flexNegative: 1, fontWeight: 1, lineClamp: 1, lineHeight: 1,
	opacity: 1, order: 1, orphans: 1, strokeOpacity: 1, widows: 1, zIndex: 1, zoom: 1
};

var ESC = {
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	'&': '&amp;'
};

var objectKeys = Object.keys || function (obj) {
	var keys = [];
	for (var i in obj) {
		if (obj.hasOwnProperty(i)) keys.push(i);
	}return keys;
};

var encodeEntities = function (s) {
	return String(s).replace(/[<>"&]/g, escapeChar);
};

var escapeChar = function (a) {
	return ESC[a] || a;
};

var falsey = function (v) {
	return v == null || v === false;
};

var memoize = function (fn) {
	var mem = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	return function (v) {
		return mem[v] || (mem[v] = fn(v));
	};
};

var indent = function (s, char) {
	return String(s).replace(/(\n+)/g, '$1' + (char || '\t'));
};

var isLargeString = function (s, length, ignoreLines) {
	return String(s).length > (length || 40) || !ignoreLines && String(s).indexOf('\n') !== -1 || String(s).indexOf('<') !== -1;
};

function styleObjToCss(s) {
	var str = '';
	for (var prop in s) {
		var val = s[prop];
		if (val != null) {
			if (str) str += ' ';
			str += jsToCss(prop);
			str += ': ';
			str += val;
			if (typeof val === 'number' && !NON_DIMENSION_PROPS[prop]) {
				str += 'px';
			}
			str += ';';
		}
	}
	return str || undefined;
}

function hashToClassName(c) {
	var str = '';
	for (var prop in c) {
		if (c[prop]) {
			if (str) str += ' ';
			str += prop;
		}
	}
	return str;
}

var jsToCss = memoize(function (s) {
	return s.replace(/([A-Z])/g, '-$1').toLowerCase();
});

function assign(obj, props) {
	for (var i in props) {
		obj[i] = props[i];
	}return obj;
}

function getNodeProps(vnode) {
	var defaultProps = vnode.nodeName.defaultProps,
	    props = assign({}, defaultProps || vnode.attributes);
	if (defaultProps) assign(props, vnode.attributes);
	if (vnode.children) props.children = vnode.children;
	return props;
}

var SHALLOW = { shallow: true };

var UNNAMED = [];

var EMPTY = {};

var VOID_ELEMENTS = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

renderToString.render = renderToString;

var shallowRender = function (vnode, context) {
	return renderToString(vnode, context, SHALLOW);
};

function renderToString(vnode, context, opts, inner, isSvgMode) {
	var _ref = vnode || EMPTY;

	var nodeName = _ref.nodeName;
	var attributes = _ref.attributes;
	var children = _ref.children;
	var isComponent = false;
	context = context || {};
	opts = opts || {};

	var pretty = opts.pretty,
	    indentChar = typeof pretty === 'string' ? pretty : '\t';

	if (vnode == null || vnode === false) {
		return '';
	}

	if (!nodeName) {
		return encodeEntities(vnode);
	}

	if (typeof nodeName === 'function') {
		isComponent = true;
		if (opts.shallow && (inner || opts.renderRootComponent === false)) {
			nodeName = getComponentName(nodeName);
		} else {
			var props = getNodeProps(vnode),
			    rendered = void 0;

			if (!nodeName.prototype || typeof nodeName.prototype.render !== 'function') {
				rendered = nodeName(props, context);
			} else {
				var c = new nodeName(props, context);

				c._disable = c.__x = true;
				c.props = props;
				c.context = context;
				if (c.componentWillMount) c.componentWillMount();
				rendered = c.render(c.props, c.state, c.context);

				if (c.getChildContext) {
					context = assign(assign({}, context), c.getChildContext());
				}
			}

			return renderToString(rendered, context, opts, opts.shallowHighOrder !== false);
		}
	}

	var s = '',
	    html = void 0;

	if (attributes) {
		var attrs = objectKeys(attributes);

		if (opts && opts.sortAttributes === true) attrs.sort();

		for (var i = 0; i < attrs.length; i++) {
			var name = attrs[i],
			    v = attributes[name];
			if (name === 'children') continue;
			if (!(opts && opts.allAttributes) && (name === 'key' || name === 'ref')) continue;

			if (name === 'className') {
				if (attributes['class']) continue;
				name = 'class';
			} else if (isSvgMode && name.match(/^xlink\:?(.+)/)) {
				name = name.toLowerCase().replace(/^xlink\:?(.+)/, 'xlink:$1');
			}

			if (name === 'class' && v && typeof v === 'object') {
				v = hashToClassName(v);
			} else if (name === 'style' && v && typeof v === 'object') {
				v = styleObjToCss(v);
			}

			var hooked = opts.attributeHook && opts.attributeHook(name, v, context, opts, isComponent);
			if (hooked || hooked === '') {
				s += hooked;
				continue;
			}

			if (name === 'dangerouslySetInnerHTML') {
				html = v && v.__html;
			} else if ((v || v === 0 || v === '') && typeof v !== 'function') {
				if (v === true || v === '') {
					v = name;

					if (!opts || !opts.xml) {
						s += ' ' + name;
						continue;
					}
				}
				s += ' ' + name + '="' + encodeEntities(v) + '"';
			}
		}
	}

	var sub = s.replace(/^\n\s*/, ' ');
	if (sub !== s && !~sub.indexOf('\n')) s = sub;else if (pretty && ~s.indexOf('\n')) s += '\n';

	s = '<' + nodeName + s + '>';

	if (VOID_ELEMENTS.indexOf(nodeName) > -1) {
		s = s.replace(/>$/, ' />');
	}

	if (html) {
		if (pretty && isLargeString(html)) {
			html = '\n' + indentChar + indent(html, indentChar);
		}
		s += html;
	} else {
		var len = children && children.length,
		    pieces = [],
		    hasLarge = ~s.indexOf('\n');
		for (var _i = 0; _i < len; _i++) {
			var child = children[_i];
			if (!falsey(child)) {
				var childSvgMode = nodeName === 'svg' ? true : nodeName === 'foreignObject' ? false : isSvgMode,
				    ret = renderToString(child, context, opts, true, childSvgMode);
				if (!hasLarge && pretty && isLargeString(ret)) hasLarge = true;
				if (ret) pieces.push(ret);
			}
		}
		if (pretty && hasLarge) {
			for (var _i2 = pieces.length; _i2--;) {
				pieces[_i2] = '\n' + indentChar + indent(pieces[_i2], indentChar);
			}
		}
		if (pieces.length) {
			s += pieces.join('');
		} else if (opts && opts.xml) {
			return s.substring(0, s.length - 1) + ' />';
		}
	}

	if (opts.jsx || VOID_ELEMENTS.indexOf(nodeName) === -1) {
		if (pretty && ~s.indexOf('\n')) s += '\n';
		s += '</' + nodeName + '>';
	}

	return s;
}

function getComponentName(component) {
	var proto = component.prototype,
	    ctor = proto && proto.constructor;
	return component.displayName || component.name || proto && (proto.displayName || proto.name) || getFallbackComponentName(component);
}

function getFallbackComponentName(component) {
	var str = Function.prototype.toString.call(component),
	    name = (str.match(/^\s*function\s+([^\( ]+)/) || EMPTY)[1];
	if (!name) {
		var index = -1;
		for (var i = UNNAMED.length; i--;) {
			if (UNNAMED[i] === component) {
				index = i;
				break;
			}
		}

		if (index < 0) {
			index = UNNAMED.push(component) - 1;
		}
		name = 'UnnamedComponent' + index;
	}
	return name;
}
renderToString.shallowRender = shallowRender;

return renderToString;

})));
//# sourceMappingURL=index.js.map


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

var cacheToCss = __webpack_require__(33);
var cacheToStylesheets = __webpack_require__(34);
var cacheToStylesheetsOldIE = __webpack_require__(35);
var generateHtmlString = __webpack_require__(36);
var StyletronCore = __webpack_require__(22);

/**
 * A Styletron class for extracting styles during server-side rendering
 * @packagename styletron-server
 * @extends StyletronCore
 */
var StyletronServer = (function (StyletronCore) {
  function StyletronServer(opts) {
    StyletronCore.call(this, opts);
  }

  if ( StyletronCore ) StyletronServer.__proto__ = StyletronCore;
  StyletronServer.prototype = Object.create( StyletronCore && StyletronCore.prototype );
  StyletronServer.prototype.constructor = StyletronServer;

  StyletronServer.prototype.injectDeclaration = function injectDeclaration (decl) {
    return StyletronCore.prototype.injectDeclaration.call(this, decl);
  };

  /**
   * Get an array of stylesheet objects
   * @return {Array} Array of stylesheet objects
   * @example
   * const styletron = new StyletronServer();
   *
   * styletron.injectDeclaration({prop: 'color', val: 'red'});
   * // → 'a'
   * styletron.getStylesheets();
   * // → [{css: '.a{color:red}'}]
   */
  StyletronServer.prototype.getStylesheets = function getStylesheets () {
    return cacheToStylesheets(this.cache);
  };

  /**
   * Get an array of stylesheet objects, with ≤IE9 limit of max 4095 rules per stylesheet
   * @return {Array} Array of stylesheet objects
   * @example
   * const styletron = new StyletronServer();
   *
   * styletron.injectDeclaration({prop: 'color', val: 'red'});
   * // → 'a'
   * styletron.getStylesheetsOldIE();
   * // → [{css: '.a{color:red}'}]
   */
  StyletronServer.prototype.getStylesheetsOldIE = function getStylesheetsOldIE () {
    return cacheToStylesheetsOldIE(this.cache);
  };

  /**
   * Get a string of style elements for server rendering
   * @return {String} The string of HTML
   * @param {String} className=_styletron_hydrate_ Class name for style elements
   * @example
   * const styletron = new StyletronServer();
   * styletron.injectDeclaration({prop: 'color', val: 'red'});
   * // → 'a'
   * styletron.getStylesheetsHtml();
   * // → '<style class="_styletron_hydrate_">.a{color:red}</style>'
   * styletron.getStylesheetsHtml('custom_class');
   * // → '<style class="custom_class">.a{color:red}</style>'
   */
  StyletronServer.prototype.getStylesheetsHtml = function getStylesheetsHtml (className) {
    if ( className === void 0 ) className = '_styletron_hydrate_';

    return generateHtmlString(this.getStylesheets(), className);
  };

  /**
   * Get a string of style elements for server rendering, with ≤IE9 limit of max 4095 rules per sheet
   * @return {String} The string of HTML
   * @param {String} className=_styletron_hydrate_ Class name for style elements
   * @example
   * const styletron = new StyletronServer();
   * styletron.injectDeclaration({prop: 'color', val: 'red'});
   * // → 'a'
   * styletron.getStylesheetsHtml();
   * // → '<style class="_styletron_hydrate_">.a{color:red}</style>'
   * styletron.getStylesheetsHtml('custom_class');
   * // → '<style class="custom_class">.a{color:red}</style>'
   */
  StyletronServer.prototype.getStylesheetsHtmlOldIE = function getStylesheetsHtmlOldIE (className) {
    if ( className === void 0 ) className = '_styletron_hydrate_';

    return generateHtmlString(this.getStylesheetsOldIE(), className);
  };

  /**
   * Get the CSS string. For hydrating styles on the client,
   * [`getStylesheetsHtml`]{@link StyletronServer#getStylesheetsHtml} or [`getStylesheets`]{@link StyletronServer#getStylesheets} should be used instead.
   * @return {String} The string of CSS
   * @example
   * const styletron = new StyletronServer();
   *
   * styletron.injectDeclaration({prop: 'color', val: 'red'});
   * // → 'a'
   * styletron.getCss();
   * // → '.a{color:red}'
   */
  StyletronServer.prototype.getCss = function getCss () {
    return cacheToCss(this.cache);
  };

  return StyletronServer;
}(StyletronCore));

module.exports = StyletronServer;


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

var baseHandler = __webpack_require__(27);

module.exports = cacheObjToCss;

/*
 * Converts cache object to a CSS string
 * @param  {object} cacheObj Cache object
 * @return {string}          String of CSS
 */
function cacheObjToCss(cacheObj) {
  var mediaCss = '';
  var css = '';
  for (var key in cacheObj) {
    if (key === 'media') {
      mediaCss += mediaObjToCss(cacheObj[key]);
      continue;
    }
    css += baseHandler(key, cacheObj[key]);
  }
  return css + mediaCss;
}

function mediaObjToCss(mediaObj) {
  var css = '';
  for (var query in mediaObj) {
    var obj = mediaObj[query];
    var mediaCss = '';
    for (var key in obj) {
      mediaCss += baseHandler(key, obj[key]);
    }
    css += "@media " + query + "{" + mediaCss + "}";
  }
  return css;
}


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

var baseHandler = __webpack_require__(27);

module.exports = cacheToStylesheets;

/*
 * Converts cache object to a CSS string
 * @param  {object} cacheObj Cache object
 * @return {string}          String of CSS
 */
function cacheToStylesheets(cacheObj) {
  var mediaSheets;
  var mainCss = '';
  for (var key in cacheObj) {
    if (key === 'media') {
      mediaSheets = getMediaSheets(cacheObj[key]);
      continue;
    }
    mainCss += baseHandler(key, cacheObj[key]);
  }
  var mainSheet = {
    css: mainCss
  };
  return mediaSheets ? [mainSheet].concat(mediaSheets) : [mainSheet];
}

function getMediaSheets(mediaObj) {
  var stylesheets = [];
  for (var query in mediaObj) {
    var obj = mediaObj[query];
    var mediaCss = '';
    for (var key in obj) {
      mediaCss += baseHandler(key, obj[key]);
    }
    stylesheets.push({
      media: query,
      css: mediaCss
    });
  }
  return stylesheets;
}


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

var baseHandler = __webpack_require__(27);

// https://blogs.msdn.microsoft.com/ieinternals/2011/05/14/stylesheet-limits-in-internet-explorer/
var IE9_RULE_LIMIT = 4095;

module.exports = cacheToStylesheetsOldIE;

/*
 * Converts cache object to a CSS string
 * @param  {object} cacheObj Cache object
 * @return {string}          String of CSS
 */
function cacheToStylesheetsOldIE(cacheObj) {
  var sheets = [];
  var mediaSheets;
  var mainCss = '';
  var ruleCount = 0;
  for (var key in cacheObj) {
    if (key === 'media') {
      mediaSheets = getMediaSheets(cacheObj[key]);
      continue;
    }
    ruleCount += Object.keys(cacheObj[key]).length;
    mainCss += baseHandler(key, cacheObj[key]);
    // TODO: handle case of than 4095 unique values for a single property
    if (ruleCount > IE9_RULE_LIMIT && mainCss) {
      sheets.push({css: mainCss});
      mainCss = '';
      ruleCount = 0;
    }
  }
  if (mainCss) {
    sheets.push({css: mainCss});
  }
  return mediaSheets ? sheets.concat(mediaSheets) : sheets;
}

function getMediaSheets(mediaObj) {
  var stylesheets = [];
  for (var query in mediaObj) {
    var obj = mediaObj[query];
    var mediaCss = '';
    var ruleCount = 0;
    for (var key in obj) {
      ruleCount += Object.keys(obj[key]).length;
      // TODO: handle case of than 4095 unique values for a single property
      if (ruleCount > IE9_RULE_LIMIT && mediaCss) {
        stylesheets.push({media: query, css: mediaCss});
        mediaCss = '';
        ruleCount = 0;
      }
      mediaCss += baseHandler(key, obj[key]);
    }
    if (mediaCss) {
      stylesheets.push({
        media: query,
        css: mediaCss
      });
    }
  }
  return stylesheets;
}


/***/ }),
/* 36 */
/***/ (function(module, exports) {

module.exports = generateHtmlString;

function generateHtmlString(sheets, className) {
  var html = '';
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var mediaAttr = sheet.media ? (" media=\"" + (sheet.media) + "\"") : '';
    html += "<style class=\"" + className + "\"" + mediaAttr + ">" + (sheet.css) + "</style>";
  }
  return html;
}


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.server.js.map

this.frontend
