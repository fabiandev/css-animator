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

  public static defaultOptions: AnimationOptions = {
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

  private animationOptions: AnimationOptions = Object.assign(
    {}, AnimationBuilder.defaultOptions,
  );

  private defaultOptions: AnimationOptions = Object.assign(
    {}, AnimationBuilder.defaultOptions,
  );

  private classes: string[];
  private listeners: Map<HTMLElement, ListenerRef[]>;
  private timeouts: Map<HTMLElement, TimeoutRef[]>;
  private styles: Map<HTMLElement, CSSStyleDeclaration>;

  // Public Methods

  constructor() {
    this.classes = [];
    this.listeners = new Map<HTMLElement, ListenerRef[]>();
    this.timeouts = new Map<HTMLElement, TimeoutRef[]>();
    this.styles = new Map<HTMLElement, CSSStyleDeclaration>();
  }

  public show(element: HTMLElement): Promise<HTMLElement> {
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
      this.removeTimeouts(element, true);

      const delay = setTimeout(() => {
        this.reset(element, true, false, true);
        this.registerAnimationListeners(element, resolve, reject);
        this.applyProperties(element);
      }, this.animationOptions.delay);

      this.addTimeout(element, delay, reject);
    });
  }

  public reset(element: HTMLElement, removePending = true, rejectTimeouts = false, rejectListeners = false): void {
    this.removeStyles(element);
    this.removeClasses(element);

    if (removePending) {
      this.removeTimeouts(element, rejectTimeouts);
      this.removeListeners(element, rejectListeners);
    }
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

  private animation(element: HTMLElement, mode: AnimationMode): Promise<HTMLElement> {
    return new Promise<HTMLElement>((resolve: Function, reject: Function) => {
      this.styles.set(element, Object.assign({}, element.style));

      element.removeAttribute('hidden');

      resolve(element);
    });
  }

  private nextFrame(fn: Function): void {
    AnimationBuilder.raf(() => {
      AnimationBuilder.raf(fn);
    });
  }

  private registerAnimationListeners(element: HTMLElement, resolve: Function, reject: Function): void {
    const animationStartEvent = this.animationStartEvent(element);
    const animationEndEvent = this.animationEndEvent(element);

    let startHandler: () => any;
    element.addEventListener(animationStartEvent, startHandler = () => {
      element.removeEventListener(animationStartEvent, startHandler);
      return startHandler;
    });

    let endHandler: () => any;
    element.addEventListener(animationEndEvent, endHandler = () => {
      element.removeEventListener(animationEndEvent, endHandler);
      this.removeListeners(element, false);
      this.reset(element);
      resolve(element);
      return endHandler;
    });

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
      .forEach(listener => {
        listener.element.removeEventListener(listener.eventName, listener.handler);
        if (reject && listener.reject) listener.reject('animation_aborted');
      });

    this.listeners.delete(element);
  }

  private removeTimeouts(element: HTMLElement, reject = false): void {
    if (!this.timeouts.has(element)) return;

    this.timeouts.get(element)
      .forEach(timeout => {
        clearTimeout(timeout.timeout);
        if (reject && timeout.reject) timeout.reject('animation_aborted');
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

  private applyProperties(element: HTMLElement): void {
    this.applyClasses(element);
    this.applyStyles(element);
  }

  private applyStyles(element: HTMLElement): void {
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

  private applyClasses(element: HTMLElement): void {
    element.classList.add(
      'animated',
      this.animationOptions.type,
      ...this.classes,
    );
  }

  private removeClasses(element: HTMLElement): void {
    element.classList.remove(
      'animated',
      this.animationOptions.type,
      ...this.classes,
    );
  }

  private applyStyle(element: HTMLElement, prop: string, value: string|number|boolean) {
    let el = document.createElement('checkStyle');

    let styles: { [key: string]: string } = {
      standard: prop,
      webkit: `-webkit-${prop}`,
      mozilla: `-moz-${prop}`,
      opera: `-o-${prop}`,
      explorer: `-ie-${prop}`,
    };

    for (let style in styles) {
      if (el.style[style] !== undefined) {
        element.style[style] = value === undefined || null ? null : value;
        break;
      }
    }

    return this;
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
    this.options = options;
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

  get duration(): string | number {
    return this.animationOptions.duration;
  }

  set duration(duration: string | number) {
    this.animationOptions.duration = duration;
  }

  public setDuration(duration: string | number): AnimationBuilder {
    this.duration = duration;
    return this;
  }

  public applyDuration(element: HTMLElement): AnimationBuilder {
    this.applyStyle(
      element,
      'animation-duration',
      this.animationOptions.duration,
    );

    return this;
  }

  get delay(): string | number {
    return this.animationOptions.delay;
  }

  set delay(delay: string | number) {
    this.animationOptions.delay = delay;
  }

  public setDelay(delay: string | number): AnimationBuilder {
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

  get iterationCount(): string | number {
    return this.animationOptions.iterationCount;
  }

  set iterationCount(iterationCount: string | number) {
    this.animationOptions.iterationCount = iterationCount;
  }

  public setIterationCount(iterationCount: string | number): AnimationBuilder {
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
