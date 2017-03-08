import { AnimationOptions } from '../contracts';
export declare enum AnimationMode {
    Animate = 0,
    Show = 1,
    Hide = 2,
}
export declare class AnimationBuilder {
    static DEBUG: boolean;
    static defaults: AnimationOptions;
    private static raf;
    private animationOptions;
    private defaultOptions;
    private classes;
    private activeClasses;
    private listeners;
    private timeouts;
    private styles;
    constructor();
    private hideElement(element);
    private showElement(element);
    show(element: HTMLElement): Promise<HTMLElement>;
    hide(element: HTMLElement): Promise<HTMLElement>;
    stop(element: HTMLElement, reset?: boolean): Promise<HTMLElement>;
    animate(element: HTMLElement, mode?: AnimationMode): Promise<HTMLElement>;
    reset(element: HTMLElement, removePending?: boolean, rejectTimeouts?: boolean, rejectListeners?: boolean): void;
    dispose(): void;
    addAnimationClass(name: string): AnimationBuilder;
    removeAnimationClass(name: string): AnimationBuilder;
    private log(...values);
    private nextFrame(fn);
    private getPosition(element);
    private registerAnimationListeners(element, mode, resolve, reject);
    private addTimeout(element, timeout, reject?);
    private addListener(element, eventName, handler, reject?);
    private removeListeners(element, reject?);
    private removeTimeouts(element, reject?);
    private animationEndEvent(element);
    private animationStartEvent(element);
    private applyProperties(element, mode?);
    private applyStyles(element, mode?);
    private removeStyles(element);
    private applyClasses(element, mode?);
    private removeClasses(element);
    private applyStyle(element, prop, value);
    private camelCase(input);
    defaults: AnimationOptions;
    setDefaults(defaults: AnimationOptions): AnimationBuilder;
    options: AnimationOptions;
    setOptions(options: AnimationOptions): AnimationBuilder;
    reject: boolean;
    pin: boolean;
    setPin(pin: boolean): AnimationBuilder;
    useVisibility: boolean;
    setUseVisibility(useVisibility: boolean): AnimationBuilder;
    type: string;
    setType(type: string): AnimationBuilder;
    applyType(element: HTMLElement): AnimationBuilder;
    fillMode: string;
    setFillMode(fillMode: string): AnimationBuilder;
    applyFillMode(element: HTMLElement): AnimationBuilder;
    timingFunction: string;
    setTimingFunction(timingFunction: string): AnimationBuilder;
    applyTimingFunction(element: HTMLElement): AnimationBuilder;
    playState: string;
    setPlayState(playState: string): AnimationBuilder;
    applyPlayState(element: HTMLElement): AnimationBuilder;
    direction: string;
    setDirection(direction: string): AnimationBuilder;
    applyDirection(element: HTMLElement): AnimationBuilder;
    duration: string | number;
    setDuration(duration: string | number): AnimationBuilder;
    applyDuration(element: HTMLElement): AnimationBuilder;
    delay: string | number;
    setDelay(delay: string | number): AnimationBuilder;
    applyDelayAsStyle(element: HTMLElement): AnimationBuilder;
    iterationCount: string | number;
    setIterationCount(iterationCount: string | number): AnimationBuilder;
    applyIterationCount(element: HTMLElement): AnimationBuilder;
}
