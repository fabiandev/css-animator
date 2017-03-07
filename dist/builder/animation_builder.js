"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AnimationMode;
(function (AnimationMode) {
    AnimationMode[AnimationMode["Animate"] = 0] = "Animate";
    AnimationMode[AnimationMode["Show"] = 1] = "Show";
    AnimationMode[AnimationMode["Hide"] = 2] = "Hide";
})(AnimationMode = exports.AnimationMode || (exports.AnimationMode = {}));
;
var AnimationBuilder = (function () {
    // Public Methods
    function AnimationBuilder() {
        this.animationOptions = Object.assign({}, AnimationBuilder.defaultOptions);
        this.defaultOptions = Object.assign({}, AnimationBuilder.defaultOptions);
        this.classes = [];
        this.listeners = new Map();
        this.timeouts = new Map();
        this.styles = new Map();
        this.log('AnimationBuilder created.');
    }
    AnimationBuilder.prototype.hideElement = function (element) {
        if (this.animationOptions.useVisibility) {
            element.style.visibility = 'hidden';
            return;
        }
        element.setAttribute('hidden', '');
    };
    AnimationBuilder.prototype.showElement = function (element) {
        if (this.animationOptions.useVisibility) {
            element.style.visibility = 'visible';
            return;
        }
        element.removeAttribute('hidden');
    };
    AnimationBuilder.prototype.show = function (element) {
        this.hideElement(element);
        return this.animate(element, AnimationMode.Show);
    };
    AnimationBuilder.prototype.hide = function (element) {
        return this.animate(element, AnimationMode.Hide);
    };
    AnimationBuilder.prototype.stop = function (element, reset) {
        if (reset === void 0) { reset = true; }
        this.removeTimeouts(element);
        this.removeListeners(element);
        if (reset)
            this.reset(element);
        return Promise.resolve(element);
    };
    AnimationBuilder.prototype.animate = function (element, mode) {
        var _this = this;
        if (mode === void 0) { mode = AnimationMode.Animate; }
        return new Promise(function (resolve, reject) {
            _this.removeTimeouts(element);
            var delay = setTimeout(function () {
                _this.reset(element, true, false, true);
                _this.registerAnimationListeners(element, mode, resolve, reject);
                _this.styles.set(element, Object.assign({}, element.style));
                if (_this.animationOptions.pin) {
                    if (mode === AnimationMode.Show) {
                        element.style.visibility = 'hidden';
                    }
                    _this.showElement(element);
                    var position = _this.getPosition(element);
                    element.style.position = 'fixed';
                    element.style.top = position.top + "px";
                    element.style.left = position.left + "px";
                    element.style.margin = '0px';
                }
                _this.nextFrame(function () {
                    element.style.visibility = 'visible';
                    _this.showElement(element);
                    _this.applyProperties(element, mode);
                });
            }, _this.animationOptions.delay);
            _this.log("Timeout " + delay + " registered for element", element);
            _this.addTimeout(element, delay, reject);
        });
    };
    AnimationBuilder.prototype.reset = function (element, removePending, rejectTimeouts, rejectListeners) {
        if (removePending === void 0) { removePending = true; }
        if (rejectTimeouts === void 0) { rejectTimeouts = false; }
        if (rejectListeners === void 0) { rejectListeners = false; }
        this.removeStyles(element);
        this.removeClasses(element);
        if (removePending) {
            this.removeTimeouts(element, rejectTimeouts);
            this.removeListeners(element, rejectListeners);
        }
    };
    AnimationBuilder.prototype.dispose = function () {
        this.timeouts.forEach(function (refs) {
            for (var _i = 0, refs_1 = refs; _i < refs_1.length; _i++) {
                var t = refs_1[_i];
                clearTimeout(t.timeout);
            }
        });
        this.listeners.forEach(function (refs, el) {
            for (var _i = 0, refs_2 = refs; _i < refs_2.length; _i++) {
                var l = refs_2[_i];
                el.removeEventListener(l.eventName, l.handler);
            }
        });
        this.classes = [];
        this.styles = new Map();
        this.timeouts = new Map();
        this.listeners = new Map();
    };
    AnimationBuilder.prototype.addAnimationClass = function (name) {
        if (this.classes.indexOf(name) === -1) {
            this.classes.push(name);
        }
        return this;
    };
    AnimationBuilder.prototype.removeAnimationClass = function (name) {
        var index = this.classes.indexOf(name);
        if (index !== -1) {
            this.classes.splice(index, 1);
        }
        return this;
    };
    // Private Methods
    AnimationBuilder.prototype.log = function () {
        var values = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            values[_i] = arguments[_i];
        }
        if (AnimationBuilder.DEBUG) {
            console.log.apply(console, ['css-animator:'].concat(values));
        }
    };
    AnimationBuilder.prototype.nextFrame = function (fn) {
        AnimationBuilder.raf(function () {
            AnimationBuilder.raf(fn);
        });
    };
    //   private offset(element: HTMLElement): { left: number, top: number } {
    //     var body = document.body,
    //         win = document.defaultView,
    //         docElem = document.documentElement,
    //         box = document.createElement('div') as any;
    //
    //     box.style.paddingLeft = box.style.width = "1px";
    //     body.appendChild(box);
    //     var isBoxModel = box.offsetWidth == 2;
    //     body.removeChild(box);
    //     box = element.getBoundingClientRect() as any;
    //     var clientTop  = docElem.clientTop  || body.clientTop  || 0,
    //         clientLeft = docElem.clientLeft || body.clientLeft || 0,
    //         scrollTop  = win.pageYOffset || isBoxModel && docElem.scrollTop  || body.scrollTop,
    //         scrollLeft = win.pageXOffset || isBoxModel && docElem.scrollLeft || body.scrollLeft;
    //     return {
    //         top : box.top  + scrollTop  - clientTop,
    //         left: box.left + scrollLeft - clientLeft};
    // }
    AnimationBuilder.prototype.getPosition = function (element) {
        var el = element.getBoundingClientRect();
        return {
            left: el.left + window.scrollX,
            top: el.top + window.scrollY,
        };
    };
    AnimationBuilder.prototype.registerAnimationListeners = function (element, mode, resolve, reject) {
        var _this = this;
        var animationStartEvent = this.animationStartEvent(element);
        var animationEndEvent = this.animationEndEvent(element);
        var startHandler;
        element.addEventListener(animationStartEvent, startHandler = function () {
            _this.log("Animation start handler fired for element", element);
            element.removeEventListener(animationStartEvent, startHandler);
            return startHandler;
        });
        this.log("Registered animation start listener for element", element);
        var endHandler;
        element.addEventListener(animationEndEvent, endHandler = function () {
            _this.log("Animation end handler fired for element", element);
            element.removeEventListener(animationEndEvent, endHandler);
            _this.removeListeners(element, false);
            _this.reset(element);
            if (mode === AnimationMode.Hide)
                _this.hideElement(element);
            if (mode === AnimationMode.Show)
                _this.showElement(element);
            resolve(element);
            return endHandler;
        });
        this.log("Registered animation end listener for element", element);
        this.addListener(element, animationStartEvent, startHandler);
        this.addListener(element, animationEndEvent, endHandler, reject);
    };
    AnimationBuilder.prototype.addTimeout = function (element, timeout, reject) {
        if (!this.timeouts.has(element)) {
            this.timeouts.set(element, []);
        }
        this.timeouts.get(element).push({
            timeout: timeout,
            reject: reject,
        });
    };
    AnimationBuilder.prototype.addListener = function (element, eventName, handler, reject) {
        if (!this.listeners.has(element)) {
            this.listeners.set(element, []);
        }
        var classes = Object.assign({}, this.classes);
        this.listeners.get(element).push({
            eventName: eventName,
            handler: handler,
            reject: reject,
            classes: classes,
        });
    };
    AnimationBuilder.prototype.removeListeners = function (element, reject) {
        var _this = this;
        if (reject === void 0) { reject = false; }
        if (!this.listeners.has(element))
            return;
        this.listeners.get(element)
            .forEach(function (ref) {
            element.removeEventListener(ref.eventName, ref.handler);
            _this.log("Listener " + ref.eventName + " removed for element", element);
            if (reject && _this.animationOptions.reject && ref.reject)
                ref.reject('animation_aborted');
        });
        this.listeners.delete(element);
    };
    AnimationBuilder.prototype.removeTimeouts = function (element, reject) {
        var _this = this;
        if (reject === void 0) { reject = false; }
        if (!this.timeouts.has(element))
            return;
        this.timeouts.get(element)
            .forEach(function (ref) {
            clearTimeout(ref.timeout);
            _this.log("Timeout " + ref.timeout + " removed for element", element);
            if (reject && _this.animationOptions.reject && ref.reject)
                ref.reject('animation_aborted');
        });
        this.timeouts.delete(element);
    };
    AnimationBuilder.prototype.animationEndEvent = function (element) {
        var el = document.createElement('endAnimationElement');
        var animations = {
            animation: 'animationend',
            OAnimation: 'oAnimationEnd',
            MozAnimation: 'animationend',
            WebkitAnimation: 'webkitAnimationEnd',
        };
        for (var animation in animations) {
            if (el.style[animation] !== undefined) {
                return animations[animation];
            }
        }
        return null;
    };
    AnimationBuilder.prototype.animationStartEvent = function (element) {
        var el = document.createElement('startAnimationElement');
        var animations = {
            animation: 'animationstart',
            OAnimation: 'oAnimationStart',
            MozAnimation: 'animationstart',
            WebkitAnimation: 'webkitAnimationStart',
        };
        for (var animation in animations) {
            if (el.style[animation] !== undefined) {
                return animations[animation];
            }
        }
        return null;
    };
    AnimationBuilder.prototype.applyProperties = function (element, mode) {
        this.applyClasses(element, mode);
        this.applyStyles(element, mode);
    };
    AnimationBuilder.prototype.applyStyles = function (element, mode) {
        this.applyFillMode(element);
        this.applyTimingFunction(element);
        this.applyPlayState(element);
        this.applyDirection(element);
        this.applyDuration(element);
        this.applyIterationCount(element);
    };
    AnimationBuilder.prototype.removeStyles = function (element) {
        if (!this.styles.has(element))
            return;
        var styles = this.styles.get(element);
        element.removeAttribute('style');
        for (var style in styles) {
            if (styles.hasOwnProperty(style)) {
                element.style[style] = styles[style];
            }
        }
        this.styles.delete(element);
    };
    AnimationBuilder.prototype.applyClasses = function (element, mode) {
        (_a = element.classList).add.apply(_a, ['animated',
            this.animationOptions.type].concat(this.classes));
        switch (mode) {
            case AnimationMode.Show:
                element.classList.add('animated-show');
                break;
            case AnimationMode.Hide:
                element.classList.add('animated-hide');
                break;
        }
        var _a;
    };
    AnimationBuilder.prototype.removeClasses = function (element) {
        (_a = element.classList).remove.apply(_a, ['animated',
            'animated-show',
            'animated-hide',
            this.animationOptions.type].concat(this.classes));
        var _a;
    };
    AnimationBuilder.prototype.applyStyle = function (element, prop, value) {
        var el = document.createElement('checkStyle');
        var styles = {
            standard: this.camelCase(prop),
            webkit: this.camelCase("-webkit-" + prop),
            mozilla: this.camelCase("-moz-" + prop),
            opera: this.camelCase("-o-" + prop),
            explorer: this.camelCase("-ie-" + prop),
        };
        for (var style in styles) {
            if (!styles.hasOwnProperty(style))
                continue;
            if (el.style[styles[style]] !== undefined) {
                element.style[styles[style]] = value === undefined || value === null ? null : value;
                break;
            }
        }
        return this;
    };
    AnimationBuilder.prototype.camelCase = function (input) {
        return input.toLowerCase().replace(/-(.)/g, function (match, group1) {
            return group1.toUpperCase();
        });
    };
    Object.defineProperty(AnimationBuilder.prototype, "defaults", {
        // Getters and Setters
        get: function () {
            return this.defaultOptions;
        },
        set: function (defaults) {
            this.defaultOptions = defaults;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setDefaults = function (defaults) {
        this.defaults = defaults;
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "options", {
        get: function () {
            return this.animationOptions;
        },
        set: function (options) {
            this.animationOptions = options;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setOptions = function (options) {
        this.options = options;
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "reject", {
        get: function () {
            return this.animationOptions.reject;
        },
        set: function (reject) {
            this.animationOptions.reject = reject;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AnimationBuilder.prototype, "pin", {
        get: function () {
            return this.animationOptions.pin;
        },
        set: function (pin) {
            this.animationOptions.pin = pin;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setPin = function (pin) {
        this.pin = pin;
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "useVisibility", {
        get: function () {
            return this.animationOptions.useVisibility;
        },
        set: function (useVisibility) {
            this.animationOptions.useVisibility = useVisibility;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setUseVisibility = function (useVisibility) {
        this.useVisibility = useVisibility;
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "type", {
        get: function () {
            return this.animationOptions.type;
        },
        set: function (type) {
            this.animationOptions.type = type;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setType = function (type) {
        this.type = type;
        return this;
    };
    AnimationBuilder.prototype.applyType = function (element) {
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "fillMode", {
        get: function () {
            return this.animationOptions.fillMode;
        },
        set: function (fillMode) {
            this.animationOptions.fillMode = fillMode;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setFillMode = function (fillMode) {
        this.fillMode = fillMode;
        return this;
    };
    AnimationBuilder.prototype.applyFillMode = function (element) {
        this.applyStyle(element, 'animation-fill-mode', this.animationOptions.fillMode ?
            this.animationOptions.fillMode : null);
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "timingFunction", {
        get: function () {
            return this.animationOptions.timingFunction;
        },
        set: function (timingFunction) {
            this.animationOptions.timingFunction = timingFunction;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setTimingFunction = function (timingFunction) {
        this.timingFunction = timingFunction;
        return this;
    };
    AnimationBuilder.prototype.applyTimingFunction = function (element) {
        this.applyStyle(element, 'animation-timing-function', this.animationOptions.timingFunction);
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "playState", {
        get: function () {
            return this.animationOptions.playState;
        },
        set: function (playState) {
            this.animationOptions.playState = playState;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setPlayState = function (playState) {
        this.playState = playState;
        return this;
    };
    AnimationBuilder.prototype.applyPlayState = function (element) {
        this.applyStyle(element, 'animation-play-state', this.animationOptions.playState);
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "direction", {
        get: function () {
            return this.animationOptions.direction;
        },
        set: function (direction) {
            this.animationOptions.direction = direction;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setDirection = function (direction) {
        this.direction = direction;
        return this;
    };
    AnimationBuilder.prototype.applyDirection = function (element) {
        this.applyStyle(element, 'animation-direction', this.animationOptions.direction);
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "duration", {
        get: function () {
            return this.animationOptions.duration;
        },
        set: function (duration) {
            this.animationOptions.duration = duration;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setDuration = function (duration) {
        this.duration = duration;
        return this;
    };
    AnimationBuilder.prototype.applyDuration = function (element) {
        this.applyStyle(element, 'animation-duration', this.animationOptions.duration + "ms");
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "delay", {
        get: function () {
            return this.animationOptions.delay;
        },
        set: function (delay) {
            this.animationOptions.delay = delay;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setDelay = function (delay) {
        this.delay = delay;
        return this;
    };
    AnimationBuilder.prototype.applyDelayAsStyle = function (element) {
        this.applyStyle(element, 'animation-delay', this.animationOptions.delay);
        return this;
    };
    Object.defineProperty(AnimationBuilder.prototype, "iterationCount", {
        get: function () {
            return this.animationOptions.iterationCount;
        },
        set: function (iterationCount) {
            this.animationOptions.iterationCount = iterationCount;
        },
        enumerable: true,
        configurable: true
    });
    AnimationBuilder.prototype.setIterationCount = function (iterationCount) {
        this.iterationCount = iterationCount;
        return this;
    };
    AnimationBuilder.prototype.applyIterationCount = function (element) {
        this.applyStyle(element, 'animation-iteration-count', this.animationOptions.iterationCount);
        return this;
    };
    return AnimationBuilder;
}());
// Members
AnimationBuilder.DEBUG = false;
AnimationBuilder.defaultOptions = {
    reject: true,
    useVisibility: false,
    pin: true,
    type: 'bounce',
    fillMode: 'none',
    timingFunction: 'ease',
    playState: 'running',
    direction: 'normal',
    duration: 1000,
    delay: 0,
    iterationCount: 1,
};
AnimationBuilder.raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout;
exports.AnimationBuilder = AnimationBuilder;
