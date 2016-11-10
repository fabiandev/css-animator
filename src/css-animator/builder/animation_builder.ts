import { AnimationOptions, ElementProps, ListenerRef, TimeoutRef } from '../contracts';

export class AnimationBuilder {
  [key: string]: any;

  private _type: string = 'bounce';
  private _fillMode: string = 'none';
  private _timingFunction: string = 'ease';
  private _playState: string = 'running';
  private _direction: string = 'normal';
  private _duration: string | number = 1000;
  private _delay: string | number = 0;
  private _iterationCount: string | number = 1;
  private _animationClasses: string[] = [];
  private _classHistory: string[] = [];
  private _listeners: ListenerRef[] = [];
  private _timeouts: TimeoutRef[] = [];
  private _keepFlow: boolean = false;

  public show(element: HTMLElement): Promise<HTMLElement> {
    element.setAttribute('hidden', '');
    return this.animate(element, 'show');
  }

  public hide(element: HTMLElement): Promise<HTMLElement> {
    return this.animate(element, 'hide');
  }

  public stop(element: HTMLElement, reset = true, detach = true): Promise<HTMLElement> {
    if (detach === true) {
      this.removeTimeoutsForElement(element, true, true);
      this.removeListenersForElement(element, true, true);
    }

    if (reset === true) {
      this.resetElement(element);
    }

    return Promise.resolve(element);
  }

  public animate(element: HTMLElement, mode = 'default'): Promise<HTMLElement> {
    return new Promise<HTMLElement>((resolve, reject) => {

      this.removeTimeoutsForElement(element, true, true);

      let delayTimeout: number;
      delayTimeout = setTimeout(() => {

        // Remove listeners if an animation is in progress on this element
        // and reject promise if an animation was interrupted
        this.removeTimeoutsForElement(element, true, false);
        this.removeListenersForElement(element, true, true);

        // Reset styles, remove animation classes (if currently being animated)
        this.resetElement(element);

        // Event to listen for (animation end)
        let animationEndEvent = this.animationEndEvent(element);
        let animationStartEvent = this.animationStartEvent(element);

        element.removeAttribute('hidden');
        // Required to get position of element
        element.style.display = 'initial';
        let initialProps = this.getElementInitialProperties(element);

        this.pinElement(element, initialProps);

        // Apply all animation properties
        this.applyAllProperties(element);
        this.applyCssClasses(element);

        element.classList.add('animated-' + mode);

        // Listen for animation start
        let startHandler: () => any;
        element.addEventListener(animationStartEvent, startHandler = () => {
          element.removeEventListener(animationStartEvent, startHandler);

          // this.resetElement(element);

          return startHandler;
        }); // listener

        // Listen for animation end
        let endHandler: () => any;
        element.addEventListener(animationEndEvent, endHandler = () => {
          element.removeEventListener(animationEndEvent, endHandler);
          this.removeListenersForElement(element, false);

          this.resetElement(element);

          element.classList.remove('animated-' + mode);

          if (mode === 'hide') {
            element.setAttribute('hidden', '');
            element.style.display = null;
          }

          resolve(element);

          return endHandler;
        }); // listener

        // Keep a reference to the listener
        this._listeners.push({
          element: element,
          eventName: animationStartEvent,
          handler: startHandler
        });

        this._listeners.push({
          element: element,
          eventName: animationEndEvent,
          handler: endHandler,
          reject: reject,
        });

      }, this._delay); // delayTimeout

      this._timeouts.push({
        element: element,
        timeout: delayTimeout,
        reject: reject,
      });

    }); // promise
  }

  public addAnimationClass(name: string): AnimationBuilder {
    if (this._animationClasses.indexOf(name) === -1) {
      this._animationClasses.push(name);
    }

    return this;
  }

  public removeAnimationClass(name: string): AnimationBuilder {
    let index = this._animationClasses.indexOf(name);

    if (index !== -1) {
      this._animationClasses.splice(index, 1);
    }

    return this;
  }

  public setOptions(options: AnimationOptions): AnimationBuilder {
    let method: string;

    for (let option in options) {
      if (this.checkValue(options[option])) {
        method = 'set' + option.charAt(0).toUpperCase() + option.slice(1);

        if (typeof this[method] === 'function') {
          this[method](options[option]);
        }
      }
    }

    return this;
  }

  public setType(type: string): AnimationBuilder {
    if (this._classHistory.indexOf(type) === -1) {
      this._classHistory.push(type);
    }

    this._type = type;
    return this;
  }

  public setFillMode(fillMode: string): AnimationBuilder {
    this._fillMode = fillMode;
    return this;
  }

  public setTimingFunction(timingFunction: string): AnimationBuilder {
    this._timingFunction = timingFunction;
    return this;
  }

  public setPlayState(playState: string): AnimationBuilder {
    this._playState = playState;
    return this;
  }

  public setDirection(direction: string): AnimationBuilder {
    this._direction = direction;
    return this;
  }

  public setDuration(duration: string | number): AnimationBuilder {
    this._duration = duration;
    return this;
  }

  public setDelay(delay: string | number): AnimationBuilder {
    this._delay = delay;
    return this;
  }

  public setIterationCount(iterationCount: string | number): AnimationBuilder {
    this._iterationCount = iterationCount;
    return this;
  }

  public applyAllProperties(element: HTMLElement): AnimationBuilder {
    this.applyFillMode(element);
    this.applyTimingFunction(element);
    this.applyPlayState(element);
    this.applyDirection(element);
    this.applyDuration(element);
    // this.applyDelay(element);
    this.applyIterationCount(element);

    return this;
  }

  public applyFillMode(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-fill-mode',
      this._fillMode ? this._fillMode : ''
    );

    return this;
  }

  public applyTimingFunction(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-timing-function',
      this._timingFunction ? this._timingFunction : ''
    );

    return this;
  }

  public applyPlayState(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-play-state',
      this._playState ? this._playState : ''
    );

    return this;
  }

  public applyDirection(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-direction',
      this._direction ? this._direction : ''
    );

    return this;
  }

  public applyDuration(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-duration',
      this._duration ? this._duration + 'ms' : ''
    );

    return this;
  }

  public applyDelay(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-delay',
      this._delay ? this._delay + 'ms' : ''
    );

    return this;
  }

  public applyIterationCount(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-iteration-count',
      this._iterationCount ? this._iterationCount : ''
    );

    return this;
  }

  public setKeepFlow(keepFlow: boolean): AnimationBuilder {
    this._keepFlow = keepFlow;
    return this;
  }

  get type(): string {
    return this._type;
  }

  get fillMode(): string {
    return this._fillMode;
  }

  get timingFunction(): string {
    return this._timingFunction;
  }

  get playState(): string {
    return this._playState;
  }

  get direction(): string | number {
    return this._direction;
  }

  get delay(): string | number {
    return this._delay;
  }

  get iterationCount(): string | number {
    return this._iterationCount;
  }

  get keepFlow(): boolean {
    return this._keepFlow;
  }

  private applyStyle(element: HTMLElement, property: string, value: any, shim = true): AnimationBuilder {
    if (shim === true) {
      element.style['-o-' + property] = value;
      element.style['-ms-' + property] = value;
      element.style['-moz-' + property] = value;
      element.style['-webkit-' + property] = value;
    }

    element.style[property] = value;

    return this;
  }

  private removeListenersForElement(element: HTMLElement, detach = true, reject = false) {
    let toRemove: number[] = [];
    for (let i = 0; i < this._listeners.length; i++) {
      if (this._listeners[i].element !== element) {
        continue;
      }

      let data = this._listeners[i];

      if (detach) {
        data.element.removeEventListener(data.eventName, data.handler);
      }

      if (reject && data.reject) {
        data.reject('animation_aborted');
      }

      toRemove.push(i);
    }

    toRemove.forEach((value) => {
      this._listeners.splice(value, 1);
    });
  }

  private removeTimeoutsForElement(element: HTMLElement, detach = true, reject = false) {
    let toRemove: number[] = [];
    for (let i = 0; i < this._timeouts.length; i++) {
      if (this._timeouts[i].element !== element) {
        continue;
      }

      let data = this._timeouts[i];

      if (detach) {
        clearTimeout(data.timeout);
      }

      if (reject && data.reject) {
        data.reject('animation_aborted');
      }

      toRemove.push(i);
    }

    toRemove.forEach((value) => {
      this._timeouts.splice(value, 1);
    });
  }

  private resetElement(element: HTMLElement): AnimationBuilder {
    this.removeCssClasses(element);

    let initialProps = JSON.parse(element.getAttribute('data-reset-styles'));

    // Reset or remove inline styles (default could be passed as third parameter)
    element.style.bottom = this.getValueOrDefault(initialProps, 'bottom', null);
    element.style.height = this.getValueOrDefault(initialProps, 'height', null);
    element.style.left = this.getValueOrDefault(initialProps, 'left', null);
    element.style.right = this.getValueOrDefault(initialProps, 'right', null);
    element.style.top = this.getValueOrDefault(initialProps, 'top', null);
    element.style.width = this.getValueOrDefault(initialProps, 'width', null);
    element.style.position = this.getValueOrDefault(initialProps, 'position', null);
    element.style.display = this.getValueOrDefault(initialProps, 'display', null);

    element.removeAttribute('data-reset-styles');

    return this;
  }

  // https://jonsuh.com/blog/detect-the-end-of-css-animations-and-transitions-with-javascript/
  private animationEndEvent(element: HTMLElement): string {
    let el = document.createElement("endAnimationElement");
    let animations: { [key: string]: string };
    animations = {
      'animation': 'animationend',
      'OAnimation': 'oAnimationEnd',
      'MozAnimation': 'animationend',
      'WebkitAnimation': 'webkitAnimationEnd'
    };

    for (let animation in animations) {
      if (el.style[animation] !== undefined) {
        return animations[animation];
      }
    }

    return null;
  }

  private animationStartEvent(element: HTMLElement): string {
    let el = document.createElement("startAnimationElement");

    let animations: { [key: string]: string };
    animations = {
      'animation': 'animationstart',
      'OAnimation': 'oAnimationStart',
      'MozAnimation': 'animationstart',
      'WebkitAnimation': 'webkitAnimationStart'
    };

    for (let animation in animations) {
      if (el.style[animation] !== undefined) {
        return animations[animation];
      }
    }

    return null;
  }

  private applyCssClasses(element: HTMLElement, add = true): AnimationBuilder {
    this._animationClasses.forEach((name) => {
      if (add === true) {
        element.classList.add(name);
      } else {
        element.classList.remove(name);
      }
    });

    if (add === true) {
      element.classList.add('animated');
      element.classList.add(this._type);
    } else {
      element.classList.remove('animated');
      element.classList.remove('animated-show');
      element.classList.remove('animated-hide');
      element.classList.remove(this._type);
    }

    if (add !== true) {
      this._classHistory.forEach((name) => {
        element.classList.remove(name);
      });
    }

    return this;
  }

  private removeCssClasses(element: HTMLElement): AnimationBuilder {
    this.applyCssClasses(element, false);

    return this;
  }

  private getElementPosition(element: HTMLElement): ClientRect {
    return element.getBoundingClientRect();
  }

  private getElementInitialProperties(element: HTMLElement): ElementProps {
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
  }

  private pinElement(element: HTMLElement, initialProps: ElementProps) {
    let position = this.getElementPosition(element);

    element.setAttribute('data-reset-styles', JSON.stringify(initialProps));

    // Support for concurrent animations on non-fixed elements
    if (!this._keepFlow) {
      element.style.bottom = position.bottom + 'px';
      element.style.height = position.height + 'px';
      element.style.left = position.left + 'px';
      element.style.right = position.right + 'px';
      element.style.top = position.top + 'px';
      element.style.width = position.width + 'px';
      element.style.position = 'fixed';
      element.style.display = 'inline-block';
    }
  }

  private checkValue(value: any): boolean {
    return (value === 0 || !!value);
  }

  private getValueOrDefault(obj: any, objKey: string, fallback = '') {
    return (obj && this.checkValue(obj[objKey]) ? obj[objKey] : fallback);
  }

}
