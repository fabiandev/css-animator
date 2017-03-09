import {
  AnimationOptions,
  ElementProps,
  ListenerRef,
  TimeoutRef,
} from '../contracts';

export enum AnimationMode {
  Animate,
  Show,
  Hide,
};

export class AnimationBuilder {

  // Members

  public static DEBUG: boolean = false;

  public static defaults: AnimationOptions = {
    fixed: false,
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

  private static raf: Function = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout;

  private animationOptions: AnimationOptions;
  private defaultOptions: AnimationOptions;

  private classes: string[];
  private activeClasses: Map<HTMLElement, string[]>;
  private listeners: Map<HTMLElement, ListenerRef[]>;
  private timeouts: Map<HTMLElement, TimeoutRef[]>;
  private styles: Map<HTMLElement, CSSStyleDeclaration>;

  // Public Methods

  constructor() {
    this.animationOptions = Object.assign(
      {}, AnimationBuilder.defaults,
    );

    this.defaultOptions = Object.assign(
      {}, AnimationBuilder.defaults,
    );

    this.classes = [];
    this.activeClasses = new Map<HTMLElement, string[]>();
    this.listeners = new Map<HTMLElement, ListenerRef[]>();
    this.timeouts = new Map<HTMLElement, TimeoutRef[]>();
    this.styles = new Map<HTMLElement, CSSStyleDeclaration>();
    this.log('AnimationBuilder created.');
  }

  private hideElement(element: HTMLElement): void {
    if (this.animationOptions.useVisibility) {
      element.style.visibility = 'hidden';
      return;
    }

    element.setAttribute('hidden', '');
  }

  private showElement(element: HTMLElement): void {
    if (this.animationOptions.useVisibility) {
      element.style.visibility = 'visible';
      return;
    }

    element.removeAttribute('hidden');
  }

  public show(element: HTMLElement): Promise<HTMLElement> {
    this.hideElement(element);
    return this.animate(element, AnimationMode.Show);
  }

  public hide(element: HTMLElement): Promise<HTMLElement> {
    return this.animate(element, AnimationMode.Hide);
  }

  public stop(element: HTMLElement, reset = true): Promise<HTMLElement> {
    this.removeTimeouts(element);
    this.removeListeners(element);
    if (reset) this.reset(element);
    return Promise.resolve(element);
  }

  public animate(element: HTMLElement, mode = AnimationMode.Animate): Promise<HTMLElement> {
    return new Promise<HTMLElement>((resolve: Function, reject: Function) => {
      this.removeTimeouts(element);

      const delay = setTimeout(() => {
        this.reset(element, true, false, true);
        this.registerAnimationListeners(element, mode, resolve, reject);
        this.styles.set(element, Object.assign({}, element.style));

        const classes = this.classes.slice(0);

        switch (mode) {
          case AnimationMode.Show:
            classes.push('animated-show');
            break;
          case AnimationMode.Hide:
            classes.push('animated-hide');
            break;
        }

        classes.push('animated', this.animationOptions.type);

        this.activeClasses.set(element, classes);

        if (this.animationOptions.pin) {
          if (mode === AnimationMode.Show) {
            element.style.visibility = 'hidden';
          }

          this.showElement(element);

          const position = this.getPosition(element);

          element.style.position = this.animationOptions.fixed ? 'fixed' : 'absolute';
          element.style.top = `${position.top}px`;
          element.style.left = `${position.left}px`;
          element.style.width = `${position.width}px`;
          element.style.height = `${position.height}px`;
          element.style.margin = '0px';
        }

        this.nextFrame(() => {
          element.style.visibility = 'visible';
          this.showElement(element);
          this.applyProperties(element, mode);
        });
      }, this.animationOptions.delay);

      this.log(`Timeout ${delay} registered for element`, element);

      this.addTimeout(element, delay, reject);
    });
  }

  public reset(element: HTMLElement, removePending = true, rejectTimeouts = false, rejectListeners = false): void {
    if (removePending) {
      this.removeTimeouts(element, rejectTimeouts);
      this.removeListeners(element, rejectListeners);
    }

    this.removeStyles(element);
    this.removeClasses(element);
  }

  public dispose(): void {
    this.timeouts.forEach(refs => {
      for (let t of refs) {
        clearTimeout(t.timeout);
      }
    });

    this.listeners.forEach((refs, el) => {
      for (let l of refs) {
        el.removeEventListener(l.eventName, l.handler);
      }
    });

    this.classes = [];
    this.styles = new Map<HTMLElement, CSSStyleDeclaration>();
    this.timeouts = new Map<HTMLElement, TimeoutRef[]>();
    this.listeners = new Map<HTMLElement, ListenerRef[]>();
  }

  public addAnimationClass(name: string): AnimationBuilder {
    if (this.classes.indexOf(name) === -1) {
      this.classes.push(name);
    }

    return this;
  }

  public removeAnimationClass(name: string): AnimationBuilder {
    let index = this.classes.indexOf(name);

    if (index !== -1) {
      this.classes.splice(index, 1);
    }

    return this;
  }

  // Private Methods

  private log(...values: any[]) {
    if (AnimationBuilder.DEBUG) {
      console.log('css-animator:', ...values);
    }
  }

  private nextFrame(fn: Function): void {
    AnimationBuilder.raf(() => {
      AnimationBuilder.raf(fn);
    });
  }

  // private getPosition(element: HTMLElement): { left: number, top: number, width: number, height: number } {
  //   return {
  //     left: element.offsetLeft,
  //     top: element.offsetTop,
  //     width: element.clientWidth,
  //     height: element.clientWidth,
  //   };
  // }

  // private getPosition(element: HTMLElement): { left: number, top: number, width: number, height: number } {
  //   let rect = element.getBoundingClientRect();
  //   let cs = window.getComputedStyle(element);
  //
  //   return {
  //     left: rect.left + window.scrollX,
  //     top: rect.top + window.scrollY,
  //     width: rect.width -
  //       parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) -
  //       parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth), // scrollbar?
  //     height: rect.height -
  //       parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) -
  //       parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth), // scrollbar?
  //   };
  // }

  // private getPosition(element: HTMLElement): { left: number, top: number, width: number, height: number } {
  //   const computed = window.getComputedStyle(element);
  //
  //   return {
  //     left: element.offsetLeft,
  //     top: element.offsetTop,
  //     width: parseFloat(computed.width),
  //     height: parseFloat(computed.height),
  //   };
  // }

  private getPosition(element: HTMLElement): { left: number, top: number, width: number, height: number } {
    let rect = element.getBoundingClientRect();
    let cs = window.getComputedStyle(element);

    let left = element.offsetLeft;
    let top = element.offsetTop;

    if (this.animationOptions.fixed) {
      left = rect.left + window.scrollX;
      top = rect.top + window.scrollY;
    }

    return {
      left,
      top,
      width: rect.width -
        parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) -
        parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth), // scrollbar?
      height: rect.height -
        parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) -
        parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth), // scrollbar?
    };
  }

  private registerAnimationListeners(element: HTMLElement, mode: AnimationMode, resolve: Function, reject: Function): void {
    const animationStartEvent = this.animationStartEvent(element);
    const animationEndEvent = this.animationEndEvent(element);

    let startHandler: () => any;
    element.addEventListener(animationStartEvent, startHandler = () => {
      this.log(`Animation start handler fired for element`, element);
      element.removeEventListener(animationStartEvent, startHandler);
      return startHandler;
    });

    this.log(`Registered animation start listener for element`, element);

    let endHandler: () => any;
    element.addEventListener(animationEndEvent, endHandler = () => {
      this.log(`Animation end handler fired for element`, element);
      element.removeEventListener(animationEndEvent, endHandler);
      this.removeListeners(element, false);
      this.reset(element, true, false, false);
      if (mode === AnimationMode.Hide) this.hideElement(element);
      if (mode === AnimationMode.Show) this.showElement(element);
      resolve(element);
      return endHandler;
    });

    this.log(`Registered animation end listener for element`, element);

    this.addListener(element, animationStartEvent, startHandler);
    this.addListener(element, animationEndEvent, endHandler, reject);
  }

  private addTimeout(element: HTMLElement, timeout: number, reject?: Function): void {
    if (!this.timeouts.has(element)) {
      this.timeouts.set(element, []);
    }

    this.timeouts.get(element).push({
      timeout,
      reject,
    });
  }

  private addListener(element: HTMLElement, eventName: string, handler: () => any, reject?: Function): void {
    if (!this.listeners.has(element)) {
      this.listeners.set(element, []);
    }

    const classes = Object.assign({}, this.classes);

    this.listeners.get(element).push({
      eventName,
      handler,
      reject,
      classes,
    });
  }

  private removeListeners(element: HTMLElement, reject = false): void {
    if (!this.listeners.has(element)) return;

    this.listeners.get(element)
      .forEach(ref => {
        element.removeEventListener(ref.eventName, ref.handler);
        this.log(`Listener ${ref.eventName} removed for element`, element);
        if (reject && this.animationOptions.reject && ref.reject) ref.reject('animation_aborted');
      });

    this.listeners.delete(element);
  }

  private removeTimeouts(element: HTMLElement, reject = false): void {
    if (!this.timeouts.has(element)) return;

    this.timeouts.get(element)
      .forEach(ref => {
        clearTimeout(ref.timeout);
        this.log(`Timeout ${ref.timeout} removed for element`, element);
        if (reject && this.animationOptions.reject && ref.reject) ref.reject('animation_aborted');
      });

    this.timeouts.delete(element);
  }

  private animationEndEvent(element: HTMLElement): string {
    let el = document.createElement('endAnimationElement');

    let animations: { [key: string]: string } = {
      animation: 'animationend',
      OAnimation: 'oAnimationEnd',
      MozAnimation: 'animationend',
      WebkitAnimation: 'webkitAnimationEnd',
    };

    for (let animation in animations) {
      if (el.style[animation] !== undefined) {
        return animations[animation];
      }
    }

    return null;
  }

  private animationStartEvent(element: HTMLElement): string {
    let el = document.createElement('startAnimationElement');

    let animations: { [key: string]: string } = {
      animation: 'animationstart',
      OAnimation: 'oAnimationStart',
      MozAnimation: 'animationstart',
      WebkitAnimation: 'webkitAnimationStart',
    };

    for (let animation in animations) {
      if (el.style[animation] !== undefined) {
        return animations[animation];
      }
    }

    return null;
  }

  private applyProperties(element: HTMLElement, mode?: AnimationMode): void {
    this.applyClasses(element, mode);
    this.applyStyles(element, mode);
  }

  private applyStyles(element: HTMLElement, mode?: AnimationMode): void {
    this.applyFillMode(element);
    this.applyTimingFunction(element);
    this.applyPlayState(element);
    this.applyDirection(element);
    this.applyDuration(element);
    this.applyIterationCount(element);
  }

  private removeStyles(element: HTMLElement): void {
    if (!this.styles.has(element)) return;

    const styles = this.styles.get(element);
    element.removeAttribute('style');

    for (let style in styles) {
      if (styles.hasOwnProperty(style)) {
        element.style[style] = styles[style];
      }
    }

    this.styles.delete(element);
  }

  private applyClasses(element: HTMLElement, mode?: AnimationMode): void {
    const active = this.activeClasses.get(element) || [];

    element.classList.add(
      'animated',
      ...active,
    );
  }

  private removeClasses(element: HTMLElement): void {
    const active = this.activeClasses.get(element) || [];

    element.classList.remove(
      'animated',
      'animated-show',
      'animated-hide',
      ...active,
    );

    this.activeClasses.delete(element);
  }

  private applyStyle(element: HTMLElement, prop: string, value: string | number | boolean) {
    let el = document.createElement('checkStyle');

    let styles: { [key: string]: string } = {
      standard: this.camelCase(prop),
      webkit: this.camelCase(`-webkit-${prop}`),
      mozilla: this.camelCase(`-moz-${prop}`),
      opera: this.camelCase(`-o-${prop}`),
      explorer: this.camelCase(`-ie-${prop}`),
    };

    for (let style in styles) {
      if (!styles.hasOwnProperty(style)) continue;
      if (el.style[styles[style]] !== undefined) {
        element.style[styles[style]] = value === undefined || value === null ? null : value;
        break;
      }
    }

    return this;
  }

  private camelCase(input: string): string {
    return input.toLowerCase().replace(/-(.)/g, (match, group1) => {
      return group1.toUpperCase();
    });
  }

  // Getters and Setters

  get defaults(): AnimationOptions {
    return this.defaultOptions;
  }

  set defaults(defaults: AnimationOptions) {
    this.defaultOptions = defaults;
  }

  public setDefaults(defaults: AnimationOptions): AnimationBuilder {
    this.defaults = defaults;
    return this;
  }

  get options(): AnimationOptions {
    return this.animationOptions;
  }

  set options(options: AnimationOptions) {
    this.animationOptions = options;
  }

  public setOptions(options: AnimationOptions): AnimationBuilder {
    Object.assign(this.options, options);
    return this;
  }

  get reject(): boolean {
    return this.animationOptions.reject;
  }

  set reject(reject: boolean) {
    this.animationOptions.reject = reject;
  }

  get pin(): boolean {
    return this.animationOptions.pin;
  }

  set pin(pin: boolean) {
    this.animationOptions.pin = pin;
  }

  public setPin(pin: boolean): AnimationBuilder {
    this.pin = pin;
    return this;
  }

  get useVisibility(): boolean {
    return this.animationOptions.useVisibility;
  }

  set useVisibility(useVisibility: boolean) {
    this.animationOptions.useVisibility = useVisibility;
  }

  public setUseVisibility(useVisibility: boolean): AnimationBuilder {
    this.useVisibility = useVisibility;
    return this;
  }

  get type(): string {
    return this.animationOptions.type;
  }

  set type(type: string) {
    this.animationOptions.type = type;
  }

  public setType(type: string): AnimationBuilder {
    this.type = type;
    return this;
  }

  public applyType(element: HTMLElement): AnimationBuilder {
    return this;
  }

  get fillMode(): string {
    return this.animationOptions.fillMode;
  }

  set fillMode(fillMode: string) {
    this.animationOptions.fillMode = fillMode;
  }

  public setFillMode(fillMode: string): AnimationBuilder {
    this.fillMode = fillMode;
    return this;
  }

  public applyFillMode(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-fill-mode',
      this.animationOptions.fillMode ?
        this.animationOptions.fillMode : null,
    );

    return this;
  }

  get timingFunction(): string {
    return this.animationOptions.timingFunction;
  }

  set timingFunction(timingFunction: string) {
    this.animationOptions.timingFunction = timingFunction;
  }

  public setTimingFunction(timingFunction: string): AnimationBuilder {
    this.timingFunction = timingFunction;
    return this;
  }

  public applyTimingFunction(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-timing-function',
      this.animationOptions.timingFunction,
    );

    return this;
  }

  get playState(): string {
    return this.animationOptions.playState;
  }

  set playState(playState: string) {
    this.animationOptions.playState = playState;
  }

  public setPlayState(playState: string): AnimationBuilder {
    this.playState = playState;
    return this;
  }

  public applyPlayState(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-play-state',
      this.animationOptions.playState,
    );

    return this;
  }

  get direction(): string {
    return this.animationOptions.direction;
  }

  set direction(direction: string) {
    this.animationOptions.direction = direction;
  }

  public setDirection(direction: string): AnimationBuilder {
    this.direction = direction;
    return this;
  }

  public applyDirection(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-direction',
      this.animationOptions.direction,
    );

    return this;
  }

  get duration(): number {
    return this.animationOptions.duration;
  }

  set duration(duration: number) {
    this.animationOptions.duration = duration;
  }

  public setDuration(duration: number): AnimationBuilder {
    this.duration = duration;
    return this;
  }

  public applyDuration(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-duration',
      `${this.animationOptions.duration}ms`,
    );

    return this;
  }

  get delay(): number {
    return this.animationOptions.delay;
  }

  set delay(delay: number) {
    this.animationOptions.delay = delay;
  }

  public setDelay(delay: number): AnimationBuilder {
    this.delay = delay;
    return this;
  }

  public applyDelayAsStyle(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-delay',
      this.animationOptions.delay,
    );

    return this;
  }

  get iterationCount(): number {
    return this.animationOptions.iterationCount;
  }

  set iterationCount(iterationCount: number) {
    this.animationOptions.iterationCount = iterationCount;
  }

  public setIterationCount(iterationCount: number): AnimationBuilder {
    this.iterationCount = iterationCount;
    return this;
  }

  public applyIterationCount(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-iteration-count',
      this.animationOptions.iterationCount,
    );

    return this;
  }

}
