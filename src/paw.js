;(function(global, undefined) {
'use strict';

var document = global.document;
var IS_SUPPORT_TOUCH_EVENT = 'ontouchstart' in document;
var IS_SUPPORT_POINTER_EVENT = !!global.PointerEvent;
var EVENTS = {
        START  : IS_SUPPORT_TOUCH_EVENT && 'touchstart'  || IS_SUPPORT_POINTER_EVENT && 'pointerdown'   || 'mousedown',
        MOVE   : IS_SUPPORT_TOUCH_EVENT && 'touchmove'   || IS_SUPPORT_POINTER_EVENT && 'pointermove'   || 'mousemove',
        END    : IS_SUPPORT_TOUCH_EVENT && 'touchend'    || IS_SUPPORT_POINTER_EVENT && 'pointerup'     || 'mouseup',
        CANCEL : IS_SUPPORT_TOUCH_EVENT && 'touchcancel' || IS_SUPPORT_POINTER_EVENT && 'pointercancel' || 'mouseleave'
};
var defaultSetting = {
        pressDuration: 500,
        doubleTapDuration: 400,
        motionThreshold: 5,
        preventClickEvent: true
};
var identifierKey = IS_SUPPORT_TOUCH_EVENT && 'identifier' || IS_SUPPORT_POINTER_EVENT && 'pointerId' || 'button';

function Paw(rootNode, option) {
    if (rootNode && !rootNode.addEventListener) {
        throw new Error('Argument Error: First argument must be Node');
    }
    var setting = this.setting = {};

    if (!option) {
        option = {};
    }
    for (var key in defaultSetting) {
        setting[key] = (option[key] !== undefined) ? option[key] : defaultSetting[key];
    }
    this.rootNode = rootNode || document;
    this.rootNode.addEventListener(EVENTS.START, this);
    this.handlers = {};
    this.timers = {};
}

Paw.IS_SUPPORT_TOUCH_EVENT = IS_SUPPORT_TOUCH_EVENT;
Paw.IS_SUPPORT_POINTER_EVENT = IS_SUPPORT_POINTER_EVENT;
Paw.EVENT_TYPES = {
        TAP: 'tap',
        DOUBLE_TAP: 'doubletap',
        PRESS: 'press',
        CLICK: 'click'
};
Paw.EVENT_INTERFACES = {
    TOUCH_EVENT   : 'touchevent',
    POINTER_EVENT : 'pointerevent',
    MOUSE_EVENT   : 'mouseevent'
};
Paw.keys = Object.keys || (_ && _.keys);
Paw.env = __getEnvData(global.navigator.userAgent);
Paw.createTouchEvent = (function(env) {
    var _defaultView = document.defaultView;

    if (env.isAndroid && (env.version && env.version[0] < 4)) {
        return function(type, target, bubbles, cancelable, pageX, pageY, identifier) {
            var event = document.createEvent('MouseEvent');
            var touchList = _getTouchList(target, identifier, pageX, pageY);

            event.initMouseEvent(
                type,
                bubbles,
                cancelable,
                _defaultView,
                1, // detail
                0, // screenX
                0, // screenY
                pageX,
                pageY,
                false, // ctrlKey
                false, // altKey
                false, // shiftKey
                false, // metaKey
                identifier,
                null // relatedTarget
            );
            event.touches = touchList;
            event.targetTouches = touchList;
            event.changedTouches = touchList;
            event.scale = 0;
            event.rotation = 0;
            return event;
        };
    }
    // create touch event for android stock browser spec
    else if (env.isAndroid) {
        return function(type, target, bubbles, cancelable, pageX, pageY, identifier) {
            var event = document.createEvent('TouchEvent');
            var touchList = _getTouchList(target, identifier, pageX, pageY);

            event.initTouchEvent(
                touchList,
                touchList,
                touchList,
                type,
                _defaultView,
                0, // screenX
                0, // screenY
                pageX,
                pageY,
                false, // ctrlKey
                false, // altKey
                false, // shiftKey
                false  // metaKey
            );
            return event;
        };
    }
    // w3c spec touch event
    else {
        return function(type, target, bubbles, cancelable, pageX, pageY, identifier) {
            var event = document.createEvent('TouchEvent');
            var touchList = _getTouchList(target, identifier, pageX, pageY);

            event.initTouchEvent(
                type,
                bubbles,
                cancelable,
                _defaultView,
                1, // detail
                0, // screenX
                0, // screenY
                pageX,
                pageY,
                false, // ctrlKey
                false, // altKey
                false, // shiftKey
                false, // metaKey
                touchList,
                touchList,
                touchList,
                0, // scale
                0  // rotation
            );
            return event;
        };
    }

    function _getTouchList(target, identifier, pageX, pageY) {
        var touch = document.createTouch(
                _defaultView,
                target,
                identifier,
                pageX,
                pageY,
                0, // screenX
                0, // screenY
                0, // clientX
                0, // clientY
                0, // radiusX
                0, // radiusY
                0, // rotationAngle
                1  // force
        );

        return document.createTouchList(touch);
    }
})(Paw.env);

Paw.prototype = {
    constructor: Paw,
    handleEvent: _handleEvent,
    onStart: _onStart,
    onMove: _onMove,
    onEnd: _onEnd,
    onCancel: _onCancel,
    onTimeout: _onTimeout,
    setTimer: _setTimer,
    clearTimer: _clearTimer,
    bindEvents: _bindEvents,
    unbindEvents: _unbindEvents,
    dispose: _dispose
};

function _handleEvent(ev) {
    switch (ev.type) {
        case EVENTS.MOVE:
            this.onMove(ev);
            break;
        case EVENTS.START:
            this.onStart(ev);
            break;
        case EVENTS.END:
            this.onEnd(ev);
            break;
        case EVENTS.CANCEL:
            this.onCancel(ev);
            break;
    }
}

function _onStart(ev) {
    var setting = this.setting;
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var handler, touchInfo, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = new Paw.Touch(id, touchInfo, setting);
        handlers[id] = handler;
        this.setTimer(id);
    }
    this.bindEvents();
}

function _onMove(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = handlers[id];
        if (handler) {
            handler.move(touchInfo);
        }
    }
}

function _onEnd(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler, id;


    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = handlers[id];
        if (handler) {
            handler.end(touchInfo);
            delete handlers[id];
        }
        this.clearTimer(id);
    }
    this.unbindEvents();
}

function _onCancel(ev) {
    var handlers = this.handlers;
    var touches = __getTouchInfoList(ev);
    var touchInfo, handler, id;

    for (var i = 0, iz = touches.length; i < iz; i++) {
        touchInfo = touches[i];
        id = touchInfo[identifierKey];
        handler = handlers[id];
        if (handler) {
            handler.cancel(touchInfo);
            delete handlers[id];
        }
        this.clearTimer(id);
    }
    this.unbindEvents();
}

function _onTimeout(id) {
    var handlers = this.handlers;
    var handler = handlers[id];

    if (handler) {
        handler.timeout();
        delete handlers[id];
    }
    this.clearTimer(id);
}

function _setTimer(id) {
    var that = this;

    this.timers[id] = global.setTimeout(function() {
        that.onTimeout(id);
    }, this.setting.pressDuration);
}

function _clearTimer(id) {
    var timers = this.timers;

    global.clearTimeout(timers[id]);
    delete timers[id];
}

function _bindEvents() {
    if (this.boundEvents) {
        return;
    }
    var rootNode = this.rootNode;

    this.boundEvents = true;
    rootNode.addEventListener(EVENTS.MOVE, this);
    rootNode.addEventListener(EVENTS.END, this);
    rootNode.addEventListener(EVENTS.CANCEL, this);
}

function _unbindEvents() {
    if (!this.boundEvents || Paw.keys(this.handlers).length > 0) {
        return;
    }
    var rootNode = this.rootNode;

    this.boundEvents = false;
    rootNode.removeEventListener(EVENTS.MOVE, this);
    rootNode.removeEventListener(EVENTS.END, this);
    rootNode.removeEventListener(EVENTS.CANCEL, this);
}

function _dispose(cond) {
    var handlers = this.handlers;
    var rootNode = this.rootNode;

    for (var id in handlers) {
        delete handlers[id];
        this.clearTimer(id);
    }
    rootNode.removeEventListener(EVENTS.START);
    this.unbindEvents();
    if (cond) {
        Paw.Touch.dispose();
    }
}

//// private methods
function __getTouchInfoList(ev) {
    return IS_SUPPORT_TOUCH_EVENT && ev.changedTouches || [ev];
}

function __getEnvData(ua) {
    ua = ua.toLowerCase();

    var appleWebkitRE = /applewebkit/;
    var res = {
        isAndroid : /android/.test(ua),
        isIOS     : /ip(hone|od|ad)/.test(ua),
        isChrome  : /(chrome|crios)/.test(ua),
        versionString: null,
        version: null
    };
    var version, versionString;

    res.isAndroidBrowser = !res.isChrome && res.isAndroid && appleWebkitRE.test(ua);
    res.isMobileSafari = !res.isChrome && res.isIOS && appleWebkitRE.test(ua);

    versionString =
        (res.isAndroidBrowser || res.android && res.chrome) ? ua.match(/android\s(\S.*?)\;/) :
        (res.isMobileSafari || res.isIOS && res.chrome) ? ua.match(/os\s(\S.*?)\s/) :
        null;
    if (versionString) {
        if (res.isIOS) {
            versionString = versionString[1].replace('_', '.');
        } else {
            versionString = versionString[1];
        }
        version = versionString.split('.');
        for (var i = 0, iz = version.length; i < iz; i++) {
            version[i] = version[i]|0;
        }
        res.versionString = versionString;
        res.version = version;
    }
    return res;
}

// exports
global.Paw = Paw;

})(this.self || global, void 0);
