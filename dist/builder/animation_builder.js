"use strict";
var AnimationBuilder = (function () {
    function AnimationBuilder() {
        this._type = 'bounce';
        this._fillMode = 'none';
        this._timingFunction = 'ease';
        this._playState = 'running';
        this._direction = 'normal';
        this._duration = 1000;
        this._delay = 0;
        this._iterationCount = 1;
        this._animationClasses = [];
        this._classHistory = [];
        this._listeners = [];
    }
    AnimationBuilder.prototype.show = function (element) {
        return this.animate(element, 'show');
    };
    AnimationBuilder.prototype.hide = function (element) {
        return this.animate(element, 'hide');
    };
    AnimationBuilder.prototype.stop = function (element, reset, detach) {
        if (reset === void 0) { reset = true; }
        if (detach === void 0) { detach = true; }
        if (detach === true) {
            this.removeListenersForElement(element, true, true);
        }
        if (reset === true) {
            this.resetElement(element);
        }
        return Promise.resolve(element);
    };
    AnimationBuilder.prototype.animate = function (element, mode) {
        var _this = this;
        if (mode === void 0) { mode = 'default'; }
        return new Promise(function (resolve, reject) {
            // Remove listeners if an animation is in progress on this element
            // and reject promise if an animation was interrupted
            _this.removeListenersForElement(element, true, true);
            // Reset styles, remove animation classes (if currently being animated),...
            _this.resetElement(element);
            // Required to get position of element
            element.style.display = 'initial';
            var initialProps = _this.getElementInitialProperties(element);
            // Pick up changes (element's position)
            setTimeout(function () {
                _this.pinElement(element, initialProps);
                // Event to listen for (animation end)
                var animationEventName = _this.whichAnimationEvent(element);
                // Apply all animation properties
                _this.applyAllProperties(element);
                _this.applyCssClasses(element);
                element.classList.add('animated-' + mode);
                // Listen for animation end
                var handler;
                element.addEventListener(animationEventName, handler = function () {
                    element.removeEventListener(animationEventName, handler);
                    _this.removeListenersForElement(element, false);
                    _this.resetElement(element);
                    element.classList.remove('animated-' + mode);
                    if (mode === 'hide') {
                        element.setAttribute('hidden', '');
                    }
                    resolve(element);
                    return handler;
                }); // listener
                // Keep a reference to the listener
                _this._listeners.push({
                    element: element,
                    eventName: animationEventName,
                    handler: handler,
                    reject: reject,
                });
            });
        }); // promise
    };
    AnimationBuilder.prototype.addAnimationClass = function (name) {
        if (this._animationClasses.indexOf(name) === -1) {
            this._animationClasses.push(name);
        }
        return this;
    };
    AnimationBuilder.prototype.removeAnimationClass = function (name) {
        var index = this._animationClasses.indexOf(name);
        if (index !== -1) {
            this._animationClasses.splice(index, 1);
        }
        return this;
    };
    AnimationBuilder.prototype.setOptions = function (options) {
        var method;
        for (var option in options) {
            if (this.checkValue(options[option])) {
                method = 'set' + option.charAt(0).toUpperCase() + option.slice(1);
                if (typeof this[method] === 'function') {
                    this[method](options[option]);
                }
            }
        }
        return this;
    };
    AnimationBuilder.prototype.setType = function (type) {
        if (this._classHistory.indexOf(type) === -1) {
            this._classHistory.push(type);
        }
        this._type = type;
        return this;
    };
    AnimationBuilder.prototype.setFillMode = function (fillMode) {
        this._fillMode = fillMode;
        return this;
    };
    AnimationBuilder.prototype.setTimingFunction = function (timingFunction) {
        this._timingFunction = timingFunction;
        return this;
    };
    AnimationBuilder.prototype.setPlayState = function (playState) {
        this._playState = playState;
        return this;
    };
    AnimationBuilder.prototype.setDirection = function (direction) {
        this._direction = direction;
        return this;
    };
    AnimationBuilder.prototype.setDuration = function (duration) {
        this._duration = duration;
        return this;
    };
    AnimationBuilder.prototype.setDelay = function (delay) {
        this._delay = delay;
        return this;
    };
    AnimationBuilder.prototype.setIterationCount = function (iterationCount) {
        this._iterationCount = iterationCount;
        return this;
    };
    AnimationBuilder.prototype.applyAllProperties = function (element) {
        this.applyFillMode(element);
        this.applyTimingFunction(element);
        this.applyPlayState(element);
        this.applyDirection(element);
        this.applyDuration(element);
        this.applyDelay(element);
        this.applyIterationCount(element);
        return this;
    };
    AnimationBuilder.prototype.applyFillMode = function (element) {
        this.applyStyle(element, 'animation-fill-mode', this._fillMode ? this._fillMode : '');
        return this;
    };
    AnimationBuilder.prototype.applyTimingFunction = function (element) {
        this.applyStyle(element, 'animation-timing-function', this._timingFunction ? this._timingFunction : '');
        return this;
    };
    AnimationBuilder.prototype.applyPlayState = function (element) {
        this.applyStyle(element, 'animation-play-state', this._playState ? this._playState : '');
        return this;
    };
    AnimationBuilder.prototype.applyDirection = function (element) {
        this.applyStyle(element, 'animation-direction', this._direction ? this._direction : '');
        return this;
    };
    AnimationBuilder.prototype.applyDuration = function (element) {
        this.applyStyle(element, 'animation-duration', this._duration ? this._duration + 'ms' : '');
        return this;
    };
    AnimationBuilder.prototype.applyDelay = function (element) {
        this.applyStyle(element, 'animation-delay', this._delay ? this._delay + 'ms' : '');
        return this;
    };
    AnimationBuilder.prototype.applyIterationCount = function (element) {
        this.applyStyle(element, 'animation-iteration-count', this._iterationCount ? this._iterationCount : '');
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "type", {
        get: function () {
            return this._type;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationBuilder.prototype, "fillMode", {
        get: function () {
            return this._fillMode;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationBuilder.prototype, "timingFunction", {
        get: function () {
            return this._timingFunction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationBuilder.prototype, "playState", {
        get: function () {
            return this._playState;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationBuilder.prototype, "direction", {
        get: function () {
            return this._direction;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationBuilder.prototype, "delay", {
        get: function () {
            return this._delay;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationBuilder.prototype, "iterationCount", {
        get: function () {
            return this._iterationCount;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.applyStyle = function (element, property, value, shim) {
        if (shim === void 0) { shim = true; }
        if (shim === true) {
            element.style['-o-' + property] = value;
            element.style['-ms-' + property] = value;
            element.style['-moz-' + property] = value;
            element.style['-webkit-' + property] = value;
        }
        element.style[property] = value;
        return this;
    };
    AnimationBuilder.prototype.removeListenersForElement = function (element, detach, reject) {
        var _this = this;
        if (detach === void 0) { detach = true; }
        if (reject === void 0) { reject = false; }
        var toRemove = [];
        for (var i = 0; i < this._listeners.length; i++) {
            if (this._listeners[i].element !== element) {
                continue;
            }
            var data = this._listeners[i];
            if (detach) {
                data.element.removeEventListener(data.eventName, data.handler);
            }
            if (reject) {
                data.reject('Animation aborted.');
            }
            toRemove.push(i);
        }
        toRemove.forEach(function (value) {
            _this._listeners.splice(value, 1);
        });
    };
    AnimationBuilder.prototype.resetElement = function (element) {
        element.removeAttribute('hidden');
        this.removeCssClasses(element);
        var initialProps = JSON.parse(element.getAttribute('data-reset-styles'));
        // Reset or remove inline styles (default could be passed as third parameter)
        element.style.bottom = this.getValueOrDefault(initialProps, 'bottom');
        element.style.height = this.getValueOrDefault(initialProps, 'height');
        element.style.left = this.getValueOrDefault(initialProps, 'left');
        element.style.right = this.getValueOrDefault(initialProps, 'right');
        element.style.top = this.getValueOrDefault(initialProps, 'top');
        element.style.width = this.getValueOrDefault(initialProps, 'width');
        element.style.position = this.getValueOrDefault(initialProps, 'position');
        element.style.display = this.getValueOrDefault(initialProps, 'display');
        element.removeAttribute('data-reset-styles');
        return this;
    };
    // https://jonsuh.com/blog/detect-the-end-of-css-animations-and-transitions-with-javascript/
    AnimationBuilder.prototype.whichAnimationEvent = function (element) {
        var el = document.createElement('animationDetectionElement');
        var animations;
        animations = {
            'animation': 'animationend',
            'OAnimation': 'oAnimationEnd',
            'MozAnimation': 'animationend',
            'WebkitAnimation': 'webkitAnimationEnd'
        };
        for (var animation in animations) {
            if (element.style[animation] !== undefined) {
                return animations[animation];
            }
        }
        return null;
    };
    AnimationBuilder.prototype.applyCssClasses = function (element, add) {
        if (add === void 0) { add = true; }
        this._animationClasses.forEach(function (name) {
            if (add === true) {
                element.classList.add(name);
            }
            else {
                element.classList.remove(name);
            }
        });
        if (add === true) {
            element.classList.add('animated');
            element.classList.add(this._type);
        }
        else {
            element.classList.remove('animated');
            element.classList.remove('animated-show');
            element.classList.remove('animated-hide');
            element.classList.remove(this._type);
        }
        if (add !== true) {
            this._classHistory.forEach(function (name) {
                element.classList.remove(name);
            });
        }
        return this;
    };
    AnimationBuilder.prototype.removeCssClasses = function (element) {
        this.applyCssClasses(element, false);
        return this;
    };
    AnimationBuilder.prototype.getElementPosition = function (element) {
        return element.getBoundingClientRect();
    };
    AnimationBuilder.prototype.getElementInitialProperties = function (element) {
        return {
            position: element.style.position,
            display: element.style.display,
            bottom: element.style.bottom,
            height: element.style.height,
            left: element.style.left,
            right: element.style.right,
            top: element.style.top,
            width: element.style.width
        };
    };
    AnimationBuilder.prototype.pinElement = function (element, initialProps) {
        var position = this.getElementPosition(element);
        element.setAttribute('data-reset-styles', JSON.stringify(initialProps));
        // Support for concurrent animations on non-fixed elements
        element.style.bottom = position.bottom + 'px';
        element.style.height = position.height + 'px';
        element.style.left = position.left + 'px';
        element.style.right = position.right + 'px';
        element.style.top = position.top + 'px';
        element.style.width = position.width + 'px';
        element.style.position = 'fixed';
        element.style.display = 'inline-block';
    };
    AnimationBuilder.prototype.checkValue = function (value) {
        return (value === 0 || !!value);
    };
    AnimationBuilder.prototype.getValueOrDefault = function (obj, objKey, fallback) {
        if (fallback === void 0) { fallback = ''; }
        return (obj && this.checkValue(obj[objKey]) ? obj[objKey] : fallback);
    };
    return AnimationBuilder;
}());
exports.AnimationBuilder = AnimationBuilder;
