//!Document.prototype.createTouch by w3c spec createTouch (https://developer.mozilla.org/ja/docs/Web/API/DocumentTouch.createTouch)
if (!Document.prototype.createTouch) {
    Document.prototype.createTouch = function(view, target, identifier, pageX, pageY,
                                              screenX, screenY, clientX, clientY,
                                              radiusX, radiusY, rotationAngle, force) {
        return {
            clientX       : clientX,
            clientY       : clientY,
            force         : force,
            identifier    : identifier,
            pageX         : pageX,
            pageY         : pageY,
            radiusX       : radiusX,
            radiusY       : radiusY,
            rotationAngle : rotationAngle,
            screenX       : screenX,
            screenY       : screenY,
            target        : target,
        };
    };
}
