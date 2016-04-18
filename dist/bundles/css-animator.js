var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
System.register("css-animator/contracts/animation_options", [], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters:[],
        execute: function() {
        }
    }
});
System.register("css-animator/contracts/element_props", [], function(exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    return {
        setters:[],
        execute: function() {
        }
    }
});
System.register("css-animator/contracts/listener_ref", [], function(exports_3, context_3) {
    "use strict";
    var __moduleName = context_3 && context_3.id;
    return {
        setters:[],
        execute: function() {
        }
    }
});
System.register("css-animator/contracts", [], function(exports_4, context_4) {
    "use strict";
    var __moduleName = context_4 && context_4.id;
    return {
        setters:[],
        execute: function() {
        }
    }
});
System.register("css-animator/builder/animation_builder", [], function(exports_5, context_5) {
    "use strict";
    var __moduleName = context_5 && context_5.id;
    var AnimationBuilder;
    return {
        setters:[],
        execute: function() {
            AnimationBuilder = (function () {
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
            exports_5("AnimationBuilder", AnimationBuilder);
        }
    }
});
System.register("css-animator/builder", ["css-animator/builder/animation_builder"], function(exports_6, context_6) {
    "use strict";
    var __moduleName = context_6 && context_6.id;
    function exportStar_1(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_6(exports);
    }
    return {
        setters:[
            function (animation_builder_1_1) {
                exportStar_1(animation_builder_1_1);
            }],
        execute: function() {
        }
    }
});
System.register("css-animator/modules/animation.service", ['angular2/core', "css-animator/builder"], function(exports_7, context_7) {
    "use strict";
    var __moduleName = context_7 && context_7.id;
    var core_1, builder_1;
    var AnimationService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (builder_1_1) {
                builder_1 = builder_1_1;
            }],
        execute: function() {
            AnimationService = (function () {
                function AnimationService() {
                }
                AnimationService.prototype.builder = function () {
                    return new builder_1.AnimationBuilder();
                };
                AnimationService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [])
                ], AnimationService);
                return AnimationService;
            }());
            exports_7("AnimationService", AnimationService);
        }
    }
});
System.register("css-animator/modules/animates.directive", ['angular2/core', "css-animator/index"], function(exports_8, context_8) {
    "use strict";
    var __moduleName = context_8 && context_8.id;
    var core_2, index_1;
    var AnimatesDirective;
    return {
        setters:[
            function (core_2_1) {
                core_2 = core_2_1;
            },
            function (index_1_1) {
                index_1 = index_1_1;
            }],
        execute: function() {
            AnimatesDirective = (function () {
                function AnimatesDirective(_elementRef, _animationService) {
                    this._elementRef = _elementRef;
                    this._animationService = _animationService;
                    this._animationBuilder = this._animationService.builder();
                }
                Object.defineProperty(AnimatesDirective.prototype, "animationBuilder", {
                    get: function () {
                        return this._animationBuilder;
                    },
                    enumerable: true,
                    configurable: true
                });
                AnimatesDirective.prototype.ngOnInit = function () {
                    if (!this._initOptions) {
                        return;
                    }
                    this._animationBuilder
                        .setOptions(this._initOptions)
                        .show(this._elementRef.nativeElement)
                        .then(function (element) { return element; }, function (error) {
                        // Animation interrupted
                    });
                };
                AnimatesDirective.prototype.start = function (options) {
                    this.setOptions(options);
                    return this._animationBuilder
                        .animate(this._elementRef.nativeElement)
                        .then(function (element) { return element; }, function (error) {
                        // Animation interrupted
                    });
                };
                AnimatesDirective.prototype.hide = function (options) {
                    this.setOptions(options);
                    return this._animationBuilder
                        .setOptions(options)
                        .hide(this._elementRef.nativeElement)
                        .then(function (element) { return element; }, function (error) {
                        // Animation interrupted
                    });
                };
                AnimatesDirective.prototype.show = function (options) {
                    this.setOptions(options);
                    return this._animationBuilder
                        .show(this._elementRef.nativeElement)
                        .then(function (element) { return element; }, function (error) {
                        // Animation interrupted
                    });
                };
                AnimatesDirective.prototype.animate = function () {
                    if (!this._defaultOptions) {
                        return;
                    }
                    return this._animationBuilder
                        .setOptions(this._defaultOptions)
                        .animate(this._elementRef.nativeElement)
                        .then(function (element) { return element; }, function (error) {
                        // Animation interrupted
                    });
                };
                AnimatesDirective.prototype.pause = function () {
                    this._animationBuilder
                        .setPlayState('paused')
                        .applyPlayState(this._elementRef.nativeElement);
                };
                AnimatesDirective.prototype.resume = function () {
                    this._animationBuilder
                        .setPlayState('running')
                        .applyPlayState(this._elementRef.nativeElement);
                };
                AnimatesDirective.prototype.toggle = function () {
                    this._animationBuilder
                        .setPlayState(this._animationBuilder.playState === 'running' ? 'paused' : 'running')
                        .applyPlayState(this._elementRef.nativeElement);
                };
                AnimatesDirective.prototype.stop = function () {
                    this._animationBuilder
                        .stop(this._elementRef.nativeElement)
                        .then(function (element) { return element; }, function (error) {
                        // Animation interrupted
                    });
                };
                AnimatesDirective.prototype.setOptions = function (options) {
                    if (options) {
                        this._animationBuilder.setOptions(options);
                        return;
                    }
                    this._animationBuilder.setOptions(this._defaultOptions);
                };
                __decorate([
                    core_2.Input('animates'), 
                    __metadata('design:type', Object)
                ], AnimatesDirective.prototype, "_defaultOptions", void 0);
                __decorate([
                    core_2.Input('animatesOnInit'), 
                    __metadata('design:type', Object)
                ], AnimatesDirective.prototype, "_initOptions", void 0);
                AnimatesDirective = __decorate([
                    core_2.Directive({
                        selector: '[animates]',
                        exportAs: 'animates'
                    }),
                    __param(0, core_2.Inject(core_2.ElementRef)),
                    __param(1, core_2.Inject(index_1.AnimationService)), 
                    __metadata('design:paramtypes', [core_2.ElementRef, index_1.AnimationService])
                ], AnimatesDirective);
                return AnimatesDirective;
            }());
            exports_8("AnimatesDirective", AnimatesDirective);
        }
    }
});
System.register("css-animator/modules", ["css-animator/modules/animation.service", "css-animator/modules/animates.directive"], function(exports_9, context_9) {
    "use strict";
    var __moduleName = context_9 && context_9.id;
    function exportStar_2(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_9(exports);
    }
    return {
        setters:[
            function (animation_service_1_1) {
                exportStar_2(animation_service_1_1);
            },
            function (animates_directive_1_1) {
                exportStar_2(animates_directive_1_1);
            }],
        execute: function() {
        }
    }
});
System.register("css-animator/index", ["css-animator/builder", "css-animator/modules"], function(exports_10, context_10) {
    "use strict";
    var __moduleName = context_10 && context_10.id;
    function exportStar_3(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_10(exports);
    }
    return {
        setters:[
            function (builder_2_1) {
                exportStar_3(builder_2_1);
            },
            function (modules_1_1) {
                exportStar_3(modules_1_1);
            }],
        execute: function() {
        }
    }
});
System.register("css-animator", ["css-animator/index"], function(exports_11, context_11) {
    "use strict";
    var __moduleName = context_11 && context_11.id;
    function exportStar_4(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_11(exports);
    }
    return {
        setters:[
            function (index_2_1) {
                exportStar_4(index_2_1);
            }],
        execute: function() {
        }
    }
});
System.register("index", ["css-animator/index"], function(exports_12, context_12) {
    "use strict";
    var __moduleName = context_12 && context_12.id;
    function exportStar_5(m) {
        var exports = {};
        for(var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_12(exports);
    }
    return {
        setters:[
            function (index_3_1) {
                exportStar_5(index_3_1);
            }],
        execute: function() {
        }
    }
});
