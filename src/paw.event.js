;(function(global, undefined) {
'use strict';

if (!global.Paw) {
    throw new Error('"Paw" does not exist in global');
}
var Paw = global.Paw;
var document = global.document;
var canCreateEventByConstructor = true;
var PawEvent, PawMouseEvent;

// PawEvent
try {
    new global.CustomEvent('testevent');
} catch (_) {
    canCreateEventByConstructor = false;
}

if (canCreateEventByConstructor) {
    PawEvent = global.CustomEvent;
} else {
    PawEvent = function(eventType, params) {
        var event = document.createEvent('Event');

        params = params || { bubbles: true, cancelable: true };
        event.initEvent(eventType, params.bubbles, params.cancelable);
        if (params.detail) {
            event.detail = params.detail;
        }
        return event;
    };
    PawEvent.prototype = global.Event.prototype;
}

// PawMouseEvent
canCreateEventByConstructor = true;

try {
    new global.MouseEvent('testevent');
} catch (_) {
    canCreateEventByConstructor = false;
}

if (canCreateEventByConstructor) {
    PawMouseEvent = global.MouseEvent;
} else {
    PawMouseEvent = function(eventType, params) {
        var event = document.createEvent('MouseEvent');

        params = params || { bubbles: true, cancelable: true }
        event.initMouseEvent(
            type,
            params.bubbles,
            params.cancelable,
            params.view || global,
            params.detail,
            params.screenX,
            params.screenY,
            params.clientX,
            params.clientY,
            params.ctrlKey,
            params.altKey,
            params.shiftKey,
            params.metaKey,
            params.button,
            params.relatedTarget
        );
        return event;
    };
    PawMouseEvent.prototype = global.MouseEvent.prototype;
}


// export
Paw.Event = PawEvent;
Paw.MouseEvent = PawMouseEvent;

})(this.self || global, void 0);
