import { Directive, Inject, ElementRef, Input, OnInit } from 'angular2/core';
import { AnimationService, AnimationBuilder, AnimationOptions } from '../index';

@Directive({
  selector: '[animates]',
  exportAs: 'animates'
})
export class AnimatesDirective implements OnInit {
  @Input('animates') private _defaultOptions: AnimationOptions;
  @Input('animatesOnInit') private _initOptions: AnimationOptions;

  private _animationBuilder: AnimationBuilder;

  get animationBuilder(): AnimationBuilder {
    return this._animationBuilder;
  }

  constructor(
    @Inject(ElementRef) private _elementRef: ElementRef,
    @Inject(AnimationService) private _animationService: AnimationService
    ) {
    this._animationBuilder = this._animationService.builder();
  }

  public ngOnInit() {
    if (!this._initOptions) {
      return;
    }

    this._animationBuilder
      .setOptions(this._initOptions)
      .show(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
      // Animation interrupted
    });
  }

  public start(options?: AnimationOptions): Promise<HTMLElement> {
    this.setOptions(options);

    return this._animationBuilder
      .animate(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
      // Animation interrupted
    });
  }

  public hide(options?: AnimationOptions): Promise<HTMLElement> {
    this.setOptions(options);

    return this._animationBuilder
      .setOptions(options)
      .hide(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
      // Animation interrupted
    });
  }

  public show(options?: AnimationOptions): Promise<HTMLElement> {
    this.setOptions(options);

    return this._animationBuilder
      .show(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
      // Animation interrupted
    });
  }

  public animate() {
    if (!this._defaultOptions) {
      return;
    }

    return this._animationBuilder
      .setOptions(this._defaultOptions)
      .animate(this._elementRef.nativeElement)
      .then((element: HTMLElement) => element, (error: string) => {
      // Animation interrupted
    });
  }

  public pause() {
    this._animationBuilder
      .setPlayState('paused')
      .applyPlayState(this._elementRef.nativeElement);
  }

  public resume() {
    this._animationBuilder
      .setPlayState('running')
      .applyPlayState(this._elementRef.nativeElement);
  }

  public toggle() {
    this._animationBuilder
      .setPlayState(this._animationBuilder.playState === 'running' ? 'paused' : 'running')
      .applyPlayState(this._elementRef.nativeElement);
  }

  public stop() {
    this._animationBuilder
      .stop(this._elementRef.nativeElement)
      .then((element) => element, (error) => {
      // Animation interrupted
    });
  }

  private setOptions(options: AnimationOptions) {
    if (options) {
      this._animationBuilder.setOptions(options);
      return;
    }

    this._animationBuilder.setOptions(this._defaultOptions);
  }

}
