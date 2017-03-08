import { Component } from '@angular/core';
import { AnimationService, AnimationBuilder } from 'css-animator';

@Component({
  selector: 'angular-app',
  providers: [
    AnimationService
  ],
  template: `
  <nav>
    <button (click)="show(toAnimate)" [disabled]="isAnimating || isVisible">Show</button>
    <button (click)="shake(toAnimate)" [disabled]="isAnimating || !isVisible">Shake</button>
    <button (click)="hide(toAnimate)" [disabled]="isAnimating || !isVisible">Hide</button>
  </nav>
  <div
    #toAnimate
    class="el"
    animates
    #animation="animates"
    animatesInitMode="show"
    [animatesOnInit]="{type: 'fadeInUp', delay: 100, duration: 1000}"
    hidden
  >
  </div>
  `,
  styles: [`
    .el {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      background-color: cyan;
    }`
  ]
})
export class AppComponent {

  public isVisible = true;
  public isAnimating = false;

  private animator: AnimationBuilder;

  constructor(animationService: AnimationService) {
    this.animator = animationService.builder();
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
