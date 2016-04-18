import { ElementRef, OnInit } from 'angular2/core';
import { AnimationService, AnimationBuilder, AnimationOptions } from '../index';
export declare class AnimatesDirective implements OnInit {
    private _elementRef;
    private _animationService;
    private _defaultOptions;
    private _initOptions;
    private _animationBuilder;
    animationBuilder: AnimationBuilder;
    constructor(_elementRef: ElementRef, _animationService: AnimationService);
    ngOnInit(): void;
    start(options?: AnimationOptions): Promise<HTMLElement>;
    hide(options?: AnimationOptions): Promise<HTMLElement>;
    show(options?: AnimationOptions): Promise<HTMLElement>;
    animate(): Promise<HTMLElement>;
    pause(): void;
    resume(): void;
    toggle(): void;
    stop(): void;
    private setOptions(options);
}
