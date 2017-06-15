import { Directive, Inject, ElementRef, OnInit } from '@angular/core';
import { AnimationService } from './animation.service';
import { AnimationBuilder } from '../builder';
import { AnimationOptions } from '../contracts';

@Directive({
  selector: '[animates]',
  exportAs: 'animates',
  inputs: [
    'animates',
    'animatesOnInit',
    'animatesInitMode'
  ]
})
export class AnimatesDirective implements OnInit {
  private _defaultOptions: AnimationOptions;
  private _initOptions: AnimationOptions;
  private _initMode: string;

  private _animationBuilder: AnimationBuilder;
  private _started: boolean;

  set animates(options: AnimationOptions) {
    this._defaultOptions = options;
  }

  set animatesOnInit(options: AnimationOptions) {
    this._initOptions = options;
  }

  set animatesInitMode(mode: string) {
    if (typeof mode === 'string') {
      this._initMode = mode.toLowerCase();
    }
  }

  get animationBuilder(): AnimationBuilder {
    return this._animationBuilder;
  }

  constructor( @Inject(ElementRef) private _elementRef: ElementRef, @Inject(AnimationService) animationService: AnimationService) {
    this._animationBuilder = animationService.builder();
  }

  public ngOnInit() {
    if (!this._initOptions) {
      return;
    }

    let promise: Promise<HTMLElement>;
    let builder = this._animationBuilder
      .setOptions(this._initOptions);

    switch (this._initMode) {
      case 'show':
        promise = builder.show(this._elementRef.nativeElement);
        break;
      case 'hide':
        promise = builder.hide(this._elementRef.nativeElement);
        break;
      default:
        promise = builder.animate(this._elementRef.nativeElement);
    }

    promise.then((element: HTMLElement) => element, (error: string) => {
      // Animation interrupted
    });
  }

  public start(options?: AnimationOptions): Promise<void | HTMLElement> {
    this._started = true;
    this.setOptions(options);

    return this._animationBuilder
      .animate(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
        // Animation interrupted
      });
  }

  public hide(options?: AnimationOptions): Promise<void | HTMLElement> {
    this.setOptions(options);

    return this._animationBuilder
      .setOptions(options)
      .hide(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
        // Animation interrupted
      });
  }

  public show(options?: AnimationOptions): Promise<void | HTMLElement> {
    this.setOptions(options);

    return this._animationBuilder
      .show(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
        // Animation interrupted
      });
  }

  public animate(options?: AnimationOptions) {
    this.setOptions(options);

    return this._animationBuilder
      .setOptions(this._defaultOptions)
      .animate(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
        // Animation interrupted
      });
  }

  public pause() {
    if (!this._started) return;

    this._animationBuilder
      .setPlayState('paused')
      .applyPlayState(this._elementRef.nativeElement);
  }

  public resume() {
    if (!this._started) return;

    this._animationBuilder
      .setPlayState('running')
      .applyPlayState(this._elementRef.nativeElement);
  }

  public toggle() {
    if (!this._started) return;

    this._animationBuilder
      .setPlayState(this._animationBuilder.playState === 'running' ? 'paused' : 'running')
      .applyPlayState(this._elementRef.nativeElement);
  }

  public stop() {
    this._started = false;
    this._animationBuilder
      .stop(this._elementRef.nativeElement)
      .then((element) => element, (error) => {
        // Animation interrupted
      });
  }

  public startOrStop(options?: AnimationOptions) {
    if (!this._started) {
      this.start(options);
      return;
    }

    this.stop();
  }

  private setOptions(options: AnimationOptions) {
    if (options) {
      this._animationBuilder.setOptions(options);
      return;
    }

    this._animationBuilder.setOptions(this._defaultOptions);
  }

}
