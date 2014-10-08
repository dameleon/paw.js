//! Event.prototype.stopImmediatePropagation Polyfill
if (!Event.prototype.stopImmediatePropagation) {
    Event.prototype.stopImmediatePropagation = function() {
        this.cancelBubble = true;
    };
}
