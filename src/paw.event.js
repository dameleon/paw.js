;(function(global, undefined) {
'use strict';

if (!global.Paw) {
    throw new Error('"Paw" does not exist in global');
}
var Paw = global.Paw;
var document = global.document;
var canCreateEvent = true;

// check useragent can use custom event
try {
    document.createEvent('CustomEvent');
} catch (_) {
    canCreateEvent = false;
}

if (canCreateEvent) {
    Paw.Event = function(eventType, canBubble, cancelable, detail) {
        var event = document.createEvent('CustomEvent');

        event.initEvent(eventType, canBubble, cancelable, detail);
        return event;
    };
} else {
    Paw.Event = function(eventType, canBubble, cancelable, detail) {
        var event = document.createEvent('Event');

        event.initEvent(eventType, canBubble, cancelable);
        if (detail) {
            event.detail = detail;
        }
        return event;
    };
}

Paw.MouseEvent = function(eventType, canBubble, cancelable, view,  detail, screenX, screenY, clientX, clientY,  ctrlKey, altKey, shiftKey, metaKey,  button, relatedTarget) {
        var event = document.createEvent('MouseEvent');

        event.initMouseEvent(
            eventType,
            canBubble,
            cancelable,
            view,
            detail,
            screenX,
            screenY,
            clientX,
            clientY,
            ctrlKey,
            altKey,
            shiftKey,
            metaKey,
            button,
            relatedTarget
        );
        return event;
};

})(this.self || global, void 0);
