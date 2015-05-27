/**
 * PointRoll resp.lib.js
 *
 * Created by Joe Brust
 * Last edited 5/11/15 r00
 *
 * Notes - Updated window.console check to include dir, info, and warn
 *
 * Sourced from: http://speed.pointroll.com/PointRoll/Media/Asset/RespLib/201296/resp.lib.js
 */

define([
    'common/utils/config'
], function (
    config
) {
    function load() {
        if (config.switches.pointroll) {

            (function () {
                var _pr_pub_control;
                var _pr_viewport = null;

                function prInitPubSide() {
                    _pr_pub_control = new prPubControl();

                    window.addEventListener('message', _pr_pub_control.getMessageFromAd, false);
                }

                function prPubControl() {
                    var _this = this;
                    _this._connections = {};
                    _this._debug_mode = {};

                    window.prGarabageCollect = function () {
                        for (var id in _this._connections) {
                            _this.removeAd(id);
                        }
                    }

                    window.prGarbageCollect = function () {
                        for (var id in _this._connections) {
                            _this.removeAd(id);
                        }
                    }

                    _this.createConnection = function (object) {
                        var _connection_id = object.id;
                        var _connection_index = object.index;
                        var _connection_iframe = null;
                        var _iframe_bounding_rect = {};
                        var _pub_page_info = {};

                        _this.log(_connection_id, 'attempting to find iframe for connection');

                        if (document.getElementById('profr' + _connection_id)) {
                            _this.log(_connection_id, 'pr iframe found, connection in progress');

                            _connection_iframe = document.getElementById('profr' + _connection_id);
                        } else {
                            var _site_iframes = document.getElementsByTagName('iframe');

                            for (var i = 0; i < _site_iframes.length; i++) {
                                try {
                                    if (_site_iframes[i].contentWindow.prPlacementId == _connection_id) {
                                        _this.log(_connection_id, 'non-pr iframe found with matching prPlacementId, connection in progress');

                                        _connection_iframe = _site_iframes[i];
                                    }
                                } catch (error) {
                                    _this.error(_connection_id, 'no iframe contentWindow[\'prPlacementId\'] found');
                                }
                            }
                        }

                        if (_connection_iframe != null) {
                            _this.log(_connection_id, 'connection listeners and callbacks initialized, connection complete');

                            _this._connections[_connection_id] = new prPubConnection(_connection_id, _connection_iframe);

                            for (var key in _this._connections[_connection_id]._iframe.getBoundingClientRect()) {
                                _iframe_bounding_rect[key] = _this._connections[_connection_id]._iframe.getBoundingClientRect()[key];
                            }

                            try {
                                _pub_page_info = {
                                    'body': {
                                        'width': document.body.offsetWidth,
                                        'height': document.body.offsetHeight
                                    },
                                    'iframe': _iframe_bounding_rect,
                                    'window': {
                                        'width': _pr_viewport.width.target[_pr_viewport.width.prefix + 'Width'],
                                        'height': _pr_viewport.height.target[_pr_viewport.height.prefix + 'Height']
                                    },
                                    'scroll': {'x': window.scrollX, 'y': window.scrollY}
                                };
                            } catch (error) {
                                _pr_pub_control.error(_this._id, 'getBoundingClientRect is not supported by this browser');
                            }

                            window.addEventListener('orientationchange', _this._connections[_connection_id].getBrowserSize, false);
                            window.addEventListener('resize', _this._connections[_connection_id].getBrowserSize, false);
                            window.addEventListener('scroll', _this._connections[_connection_id].windowScrollHandler, false);

                            _this._connections[_connection_id].setAdSlotTarget(_connection_index);
                            _this._connections[_connection_id].getBrowserSize();
                            _this._connections[_connection_id].incrementTrackingCount();
                            _this._connections[_connection_id].sendMessageToAd({'updatePubPageInfo': _pub_page_info});
                        } else {
                            _this.error(_connection_id, 'no pr ad found in any iframe');
                        }
                    }

                    _this.destroyConnection = function (id) {
                        window.removeEventListener('orientationchange', _this._connections[id].getBrowserSize, false);
                        window.removeEventListener('resize', _this._connections[id].getBrowserSize, false);
                        window.removeEventListener('scroll', _this._connections[id].windowScrollHandler, false);

                        _this._connections[id].removeAllListeners();
                    }

                    _this.error = function (id, message) {
                        if (_this._debug_mode[id]) {
                            console.log('prPubConnection error (' + id + ') - ' + message);
                        }
                    }

                    _this.getMessageFromAd = function (event) {
                        var _object;
                        var _id;
                        var _messages;

                        try {
                            _object = JSON.parse(event.data);
                            _id = _object.id;
                            _messages = _object.messages;
                        } catch (error) {
                            return;
                        }

                        if (_pr_viewport == null) {
                            _pr_viewport = {};
                            _pr_viewport.width = {};
                            _pr_viewport.height = {};

                            _this.getViewport('Width');
                            _this.getViewport('Height');
                        }

                        for (var message in _messages) {
                            var _message = message;
                            var _params = _messages[message];

                            if (/addCustomStyles/.test(_message) || /addDirectStyles/.test(_message) || /addListener/.test(_message) || /debug/.test(_message) || /destroy/.test(_message) || /hide/.test(_message) || /init/.test(_message) || /wrapElements/.test(_message) || /overwriteImportantStyles/.test(_message) || /remove/.test(_message) || /removeListener/.test(_message) || /reveal/.test(_message) || /setAdOffset/.test(_message) || /setAdPosition/.test(_message) || /setAdSize/.test(_message) || /setAdSlotTarget/.test(_message)) {
                                _this.log(_id, 'message received (' + _message + ')');
                                _this.log(_id, _params);
                            } else {
                                return;
                            }

                            switch (_message) {
                                case 'addCustomStyles':
                                    _this._connections[_id].setCustomStyles(_params);
                                    break;
                                case 'addDirectStyles':
                                    _this._connections[_id].setDirectStyles(_params);
                                    break;
                                case 'addListener':
                                    _this._connections[_id].addListener(_params);
                                    break;
                                case 'debug':
                                    _this.setDebugMode(_id, _params);
                                    break;
                                case 'destroy':
                                    _this.destroyConnection(_id);
                                    break;
                                case 'hide':
                                    _this._connections[_id].hideAd();
                                    break;
                                case 'init':
                                    _this.createConnection(_params);
                                    break;
                                case 'wrapElements':
                                    _this._connections[_id].wrapElements(_params);
                                    break;
                                case 'overwriteImportantStyles':
                                    _this._connections[_id].overwriteImportantStyles(_params);
                                    break;
                                case 'remove':
                                    _this.removeAd(_id);
                                    break;
                                case 'removeListener':
                                    _this._connections[_id].removeListener(_params);
                                    break;
                                case 'reveal':
                                    _this._connections[_id].revealAd();
                                    break;
                                case 'setAdOffset':
                                    _this._connections[_id].setAdOffset(_params);
                                    break;
                                case 'setAdPosition':
                                    _this._connections[_id].setAdPosition(_params);
                                    break;
                                case 'setAdSize':
                                    _this._connections[_id].setAdSize(_params);
                                    break;
                                case 'setAdSlotTarget':
                                    _this._connections[_id].setAdSlotTarget(_params);
                                    break;
                                default:
                                    break;
                            }
                        }
                    }

                    _this.getViewport = function (dimension) {
                        var _name_upper = dimension;
                        var _name_lower = _name_upper.toLowerCase();
                        var _document = window.document;
                        var _document_element = _document.documentElement;

                        if (window['inner' + _name_upper] === undefined) {
                            _pr_viewport[_name_lower].target = _document_element;
                            _pr_viewport[_name_lower].prefix = 'client';
                        } else if (window['inner' + _name_upper] != _document_element['client' + _name_upper]) {
                            var _body_element = document.createElement('body');
                            _body_element.id = 'pr-viewport-test-body';
                            _body_element.style.cssText = 'overflow: scroll;';

                            var _div_element = document.createElement('div');
                            _div_element.id = 'pr-viewport-test-div';
                            _div_element.style.cssText = 'position: absolute; top: -1000px;';
                            _div_element.innerHTML = '<style>@media(' + _name_lower + ': ' + _document_element['client' + _name_upper] + 'px){body#pr-viewport-test-body div#pr-viewport-test-div{' + _name_lower + ': 7px! important}}</style>';

                            _body_element.appendChild(_div_element);
                            _document_element.insertBefore(_body_element, _document.head);

                            if (_div_element['offset' + _name_upper] == 7) {
                                _pr_viewport[_name_lower].target = _document_element;
                                _pr_viewport[_name_lower].prefix = 'client';
                            } else {
                                _pr_viewport[_name_lower].target = window;
                                _pr_viewport[_name_lower].prefix = 'inner';
                            }

                            _document_element.removeChild(_body_element);
                        } else {
                            _pr_viewport[_name_lower].target = window;
                            _pr_viewport[_name_lower].prefix = 'inner';
                        }
                    }

                    _this.log = function (id, message) {
                        if (_this._debug_mode[id]) {
                            if (typeof message == 'string') {
                                console.log('prPubConnection log (' + id + ') - ' + message);
                            } else {
                                console.log(message);
                            }
                        }
                    }

                    _this.removeAd = function (id) {
                        _this.destroyConnection(id);

                        _this._connections[id].removeCustomStyles();
                        _this._connections[id].getAdSlotTarget(_this._ad_slot_index).style.height = '0px';
                        _this._connections[id]._iframe.parentNode.removeChild(_this._connections[id]._iframe);

                        delete _this._connections[id];
                        delete _this._debug_mode[id];
                    }

                    _this.setDebugMode = function (id, flag) {
                        _this._debug_mode[id] = flag;
                    }

                    _this.warning = function (id, message) {
                        if (_this._debug_mode[id]) {
                            console.log('prPubConnection warning (' + id + ') - ' + message);
                        }
                    }
                }

                function prPubConnection(id, iframe) {
                    var _this = this;
                    _this._ad_is_shown = true;
                    _this._ad_has_shown = false;
                    _this._ad_slot_height = null;
                    _this._ad_slot_index = null;
                    _this._ad_slot_target = null;
                    _this._ad_styles_applied = {};
                    _this._id = id;
                    _this._iframe = iframe;
                    _this._listeners = {};
                    _this._tracking_buffer = 0.5;
                    _this._tracking_count = 0;
                    _this._tracking_timeout = null;

                    _this.addListener = function (object) {
                        var _target = object.target;
                        var _type = object.type;
                        var _element;

                        switch (_target) {
                            case 'document':
                                _element = document;
                                break;

                            case 'window':
                                _element = window;
                                break;

                            default:
                                _element = document.getElementById(_target);
                                break;
                        }

                        if (!_this._listeners[_target]) {
                            _this._listeners[_target] = {};
                        }

                        _element.addEventListener(_type, _this.customEventFunction, false);

                        _this._listeners[_target][_type] = 'added';
                    }

                    _this.applyCustomStyles = function () {
                        var _targets = _this._ad_styles_applied;

                        for (var target in _targets) {
                            var _target = _this.getAdSlotTarget(parseInt(target));
                            var _styles = _this._ad_styles_applied[target];

                            for (var style in _styles) {
                                _target.style[style] = _this._ad_styles_applied[target][style];
                            }
                        }
                    }

                    _this.customEventFunction = function (event) {
                        var _custom_event = {};
                        var _element;
                        var _target;
                        var _type;
                        var _rect = {};

                        for (var key in event) {
                            _custom_event[key] = event[key];
                        }

                        if (_custom_event.currentTarget.window) {
                            _element = window;
                            _target = 'window';
                        } else if (_custom_event.currentTarget.write) {
                            _element = document;
                            _target = 'document';
                        } else {
                            _element = document.getElementById(_custom_event.target.id);
                            _target = _custom_event.target.id;
                        }

                        _type = _custom_event.type;

                        _custom_event.currentTarget = null;
                        _custom_event.explicitOriginalTarget = null;
                        _custom_event.originalTarget = null;
                        _custom_event.srcElement = null;
                        _custom_event.target = null;
                        _custom_event.toElement = null;
                        _custom_event.view = null;

                        switch (_type) {
                            case 'resize':
                                _custom_event.innerWidth = window.innerWidth;
                                _custom_event.innerHeight = window.innerHeight;
                                break;

                            case 'scroll':
                                _custom_event.scrollX = _element.scrollX;
                                _custom_event.scrollY = _element.scrollY;
                                break;
                        }

                        try {
                            for (var param in _this._iframe.getBoundingClientRect()) {
                                _rect[param] = _this._iframe.getBoundingClientRect()[param];
                            }

                            _custom_event.rect = _rect;
                        } catch (error) {
                            _pr_pub_control.error(_this._id, 'getBoundingClientRect is not supported by this browser');
                        }

                        try {
                            var _event_as_string = JSON.stringify(_custom_event);

                            _this.sendMessageToAd({
                                'dispatchCustomEvent': {
                                    'name': 'custom' + _target + _type,
                                    'event': _event_as_string
                                }
                            });
                        } catch (error) {
                            try {
                                for (var key in _custom_event) {
                                    if (typeof _custom_event[key] !== 'string' && typeof _custom_event[key] !== 'number' && key !== 'rect') {
                                        delete _custom_event[key];
                                    }
                                }

                                var _event_as_string = JSON.stringify(_custom_event);

                                _this.sendMessageToAd({
                                    'dispatchCustomEvent': {
                                        'name': 'custom' + _target + _type,
                                        'event': _event_as_string
                                    }
                                });
                            } catch (error) {
                                _pr_pub_control.error(_this._id, 'cyclic structure found in listener event object, cannot send event to ad');
                                _pr_pub_control.log(_this._id, _custom_event);
                            }
                        }
                    }

                    _this.getAdSlotSize = function () {
                        var _width = _this._ad_slot_target.offsetWidth;
                        var _height = _this._ad_slot_target.offsetHeight;

                        _this.sendMessageToAd({'setAdSlotSize': {'width': _width, 'height': _height}});
                    }

                    _this.getAdSlotTarget = function (index) {
                        var _ad_slot;

                        if (index != undefined && index != null && index != '') {
                            _ad_slot = _this._iframe;

                            for (var i = 0; i < index; i++) {
                                _ad_slot = _ad_slot.parentNode;
                            }
                        } else {
                            _ad_slot = _this._ad_slot_target;
                        }

                        return _ad_slot;
                    }

                    _this.getBrowserSize = function () {
                        window.setTimeout(function () {
                            var _width = _pr_viewport.width.target[_pr_viewport.width.prefix + 'Width'];
                            var _height = _pr_viewport.height.target[_pr_viewport.height.prefix + 'Height'];

                            _this.getAdSlotSize();
                            _this.updateBodySize();
                            _this.updateIframeRect();
                            _this.updateWindowSize();

                            _this.sendMessageToAd({'browserSizeUpdated': {'width': _width, 'height': _height}});
                        }, 0);
                    }

                    _this.hideAd = function () {
                        window.clearTimeout(_this._tracking_timeout);

                        if (_this._tracking_count / 1000 < _this._tracking_buffer) {
                            _this._tracking_count = _this._tracking_buffer;

                            _this.sendMessageToAd({'fireNonImpression': null});
                        }

                        if (_this._ad_is_shown) {
                            _this._ad_is_shown = false;

                            var _ad_slot = _this.getAdSlotTarget(_this._ad_slot_index);

                            _ad_slot_height = _ad_slot.offsetHeight;

                            _ad_slot.style.height = '0px';
                            _ad_slot.style.overflow = 'hidden';

                            _this.removeCustomStyles();
                        }
                    }

                    _this.incrementTrackingCount = function () {
                        _this._tracking_count += 10;
                        _this._tracking_timeout = window.setTimeout(_this.incrementTrackingCount, 10);
                    }

                    _this.overwriteImportantStyles = function (object) {
                        for (var targets in object) {
                            var _targets = document.querySelectorAll(targets);
                            var _styles = object[targets];
                            var _css_text = '';

                            for (var style in _styles) {
                                _css_text += (style + ': ' + _styles[style] + ' !important; ');
                            }

                            for (var i = 0; i < _targets.length; i++) {
                                _targets[i].style.cssText = _css_text;
                            }
                        }
                    }

                    _this.removeAllListeners = function () {
                        for (var target in _this._listeners) {
                            var _element;

                            switch (target) {
                                case 'window':
                                    _element = window;
                                    break;

                                case 'document':
                                    _element = document;
                                    break;

                                default:
                                    _element = document.getElementById(target);
                                    break;
                            }

                            for (var type in _this._listeners[target]) {
                                if (_this._listeners[target][type] == 'added') {
                                    _element.removeEventListener(type, _this.customEventFunction, false);
                                    _this._listeners[target][type] = 'removed';
                                }
                            }
                        }
                    }

                    _this.removeCustomStyles = function () {
                        var _targets = _this._ad_styles_applied;

                        for (var target in _targets) {
                            var _target = _this.getAdSlotTarget(parseInt(target));
                            var _styles = _this._ad_styles_applied[target];

                            for (var style in _styles) {
                                _target.style[style] = 'initial';
                            }
                        }
                    }

                    _this.removeListener = function (object) {
                        var _target = object.target;
                        var _type = object.type;
                        var _element;

                        switch (_target) {
                            case 'window':
                                _element = window;
                                break;

                            case 'document':
                                _element = document;
                                break;

                            default:
                                _element = document.getElementById(target);
                                break;
                        }

                        _element.removeEventListener(_type, _this.customEventFunction, false);

                        try {
                            _this._listeners[_target][_type] = 'removed';
                        } catch (error) {
                            _pr_pub_control.error(_this._id, 'trying to remove event listener that has not yet been added');
                        }
                    }

                    _this.revealAd = function () {
                        if (!_this._ad_is_shown) {
                            _this._ad_is_shown = true;

                            _this.getAdSlotTarget(_this._ad_slot_index).style.height = _ad_slot_height + 'px';
                        }

                        _this.applyCustomStyles();
                    }

                    _this.sendMessageToAd = function (message) {
                        _this._iframe.contentWindow.postMessage(JSON.stringify(message), '*');
                    }

                    _this.setAdOffset = function (object) {
                        for (var offset in object) {
                            _this._iframe.style[offset] = object[offset];
                        }

                        _this.updateIframeRect();
                    }

                    _this.setAdPosition = function (position) {
                        _this._iframe.style.position = position;

                        _this.updateIframeRect();
                    }

                    _this.setAdSize = function (object) {
                        for (var size in object) {
                            var _dimension = object[size];

                            _this._iframe.setAttribute(size, _dimension.replace(/px/g, ''));
                            _this._ad_slot_target.style[size] = _dimension;
                        }

                        _this.updateIframeRect();
                    }

                    _this.setAdSlotTarget = function (index) {
                        _this._ad_slot_index = parseInt(index);
                        _this._ad_slot_target = _this._iframe;

                        for (var i = 0; i < _this._ad_slot_index; i++) {
                            _this._ad_slot_target = _this._ad_slot_target.parentNode;
                        }
                    }

                    _this.setCustomStyles = function (object) {
                        var _index = _this._ad_slot_index;
                        var _target = _this.getAdSlotTarget(_index);

                        if (_this._ad_is_shown) {
                            if (!_this._ad_styles_applied[_index]) {
                                _this._ad_styles_applied[_index] = {};
                            }

                            for (var style in object) {
                                _this._ad_styles_applied[_index][style] = object[style];
                                _target.style[style] = object[style];
                            }
                        } else {
                            _pr_pub_control.warning(_this._id, 'attempting to add custom styles to the ad slot while it is hidden');
                        }
                    }

                    _this.setDirectStyles = function (object) {
                        for (var targets in object) {
                            var _targets = document.querySelectorAll(targets);
                            var _styles = object[targets];

                            for (var i = 0; i < _targets.length; i++) {
                                for (var style in _styles) {
                                    _targets[i].style[style] = _styles[style];
                                }
                            }
                        }
                    }

                    _this.updateBodySize = function (event) {
                        var _body_resize_object = {
                            'body': {
                                'width': document.body.offsetWidth,
                                'height': document.body.offsetHeight
                            }
                        }

                        _this.sendMessageToAd({'updatePubPageInfo': _body_resize_object});
                    }

                    _this.updateIframeRect = function () {
                        try {
                            var _iframe_resize_object = {
                                'iframe': {}
                            }

                            for (var param in _this._iframe.getBoundingClientRect()) {
                                _iframe_resize_object.iframe[param] = _this._iframe.getBoundingClientRect()[param];
                            }

                            _this.sendMessageToAd({'updatePubPageInfo': _iframe_resize_object});
                        } catch (error) {
                            _pr_pub_control.error(_this._id, 'getBoundingClientRect is not supported by this browser');
                        }
                    }

                    _this.updateWindowSize = function () {
                        var _window_resize_object = {
                            'window': {
                                'width': _pr_viewport.width.target[_pr_viewport.width.prefix + 'Width'],
                                'height': _pr_viewport.height.target[_pr_viewport.height.prefix + 'Height']
                            }
                        }

                        _this.sendMessageToAd({'updatePubPageInfo': _window_resize_object});
                    }

                    _this.windowScrollHandler = function (event) {
                        var _window_scroll_object = {
                            'scroll': {
                                'x': window.scrollX,
                                'y': window.scrollY
                            }
                        }

                        _this.sendMessageToAd({'updatePubPageInfo': _window_scroll_object});
                    }

                    _this.wrapElements = function (object) {
                        var _class = object.class || '';
                        var _elements = Array.prototype.slice.call(document.querySelectorAll(object.elements));
                        var _id = object.id;
                        var _max = object.max || _elements.length;
                        var _min = object.min || 0;
                        var _new_el;
                        var _tag = object.tag;
                        var _to = object.to;

                        if (_tag) {
                            _new_el = document.createElement(_tag);
                        } else {
                            _new_el = document.createElement('div');
                        }

                        _new_el.id = _id;
                        _new_el.className = _class;

                        for (var i = _min; i < _max; i++) {
                            var _child = _elements[i];

                            if (i === _min) {
                                _child.parentNode.insertBefore(_new_el, _child);
                            }

                            _new_el.appendChild(_child);
                        }

                        if (_to) {
                            document.querySelectorAll(_to)[0].appendChild(_new_el);
                        }
                    }
                }

                prInitPubSide();
            })();

            if (!window.console) {
                var console = {
                    dir: function () {
                    },
                    info: function () {
                    },
                    log: function () {
                    },
                    warn: function () {
                    }
                }
            }
        }
    }

    return {
        load: load
    };

});
