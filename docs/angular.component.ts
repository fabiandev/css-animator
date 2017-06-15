import { Component } from '@angular/core';
import { AnimationService, AnimationBuilder } from 'css-animator';

@Component({
  selector: 'angular-app',
  template: `
  <nav>
    <button (click)="show(toAnimate)" [disabled]="isAnimating || isVisible">Show</button>
    <button (click)="shake(toAnimate)" [disabled]="isAnimating || !isVisible">Shake</button>
    <button (click)="hide(toAnimate)" [disabled]="isAnimating || !isVisible">Hide</button>
  </nav>
  <div
    class="el"
    #toAnimate
    animates
    animatesInitMode="show"
    [animatesOnInit]="{useVisibility: true, type: 'fadeInUp', delay: 100, duration: 1000}"
  >
  </div>
  <div
    class="el2"
    animates
    #animation="animates"
    animatesInitMode="show"
    [animatesOnInit]="{ delay: 350, type: 'fadeInUp' }"
    (click)="animation.startOrStop({delay: 0, duration: 1500, type: 'shake', iterationCount: 'infinite'})"
    (mouseleave)="animation.pause()"
    (mouseenter)="animation.resume()"
    hidden
  >
  </div>
  `,
  styles: [`
    .el {
      visibility: hidden;
      width: 100px;
      height: 100px;
      margin: 0 auto;
      background-color: cyan;
    }
    .el2 {
      position: absolute;
      width: 100px;
      height: 100px;
      top: 300px;
      left: 50%;
      margin-left: -50px;
      background-color: yellow;
    }`
  ]
})
export class AppComponent {

  public isVisible = true;
  public isAnimating = false;

  private animator: AnimationBuilder;

  constructor(animationService: AnimationService) {
    this.animator = animationService.builder();
    this.animator.useVisibility = true;
  }

  public show(element: HTMLElement) {
    this.isAnimating = true;

    this.animator
      .setType('fadeInUp')
      .setDuration(1000)
      .show(element)
      .then(() => {
        this.isVisible = true;
        this.isAnimating = false;
      })
      .catch(e => {
        this.isAnimating = false;
        console.log('css-animator: Animation aborted', e);
      });
  }

  public shake(element: HTMLElement) {
    this.isAnimating = true;

    this.animator
      .setType('shake')
      .setDuration(1500)
      .animate(element)
      .then(() => {
        this.isAnimating = false;
      })
      .catch(e => {
        this.isAnimating = false;
        console.log('css-animator: Animation aborted', e);
      });
  }

  public hide(element: HTMLElement) {
    this.isAnimating = true;

    this.animator
      .setType('fadeOutDown')
      .setDuration(1000)
      .hide(element)
      .then(() => {
        this.isVisible = false;
        this.isAnimating = false;
      })
      .catch(e => {
        this.isAnimating = false;
        console.log('css-animator: Animation aborted', e);
      });
  }

}
