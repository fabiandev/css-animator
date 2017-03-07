import { Component, ElementRef } from '@angular/core';
import { AnimationService, AnimationBuilder } from 'css-animator';

@Component({
  selector: 'angular-app',
  providers: [
    AnimationService,
  ],
  template: `
  <nav>
    <button #button (click)="startAnimation(button)">Start Animation</button>
  </nav>
  <div
    class="el"
    animates
    #animation="animates"
    animatesInitMode="hide"
    [animatesOnInit]="{type: 'fadeOutDown', delay: 100, duration: 1000}">
  </div>
  `,
  styles: [`
    .el {
      width: 100px;
      height: 100px;
      margin: 0 auto;
      background-color: cyan;
    }`,
  ],
})
export class AppComponent {

  private animator: AnimationBuilder;

  constructor(private elementRef: ElementRef, animationService: AnimationService) {
    this.animator = animationService.builder();
  }

  public startAnimation(button: HTMLElement) {
    button.setAttribute('disabled', '');
    const element = this.elementRef.nativeElement.querySelector('.el');

    this.animator
      .setType('fadeInUp')
      .show(element)
      .then(el => {
        return this.animator
          .setDelay(500)
          .setDuration(1500)
          .setType('shake')
          .animate(el);
      })
      .then(el => {
        return this.animator
          .setDelay(1000)
          .setDuration(1000)
          .setType('fadeOutDown')
          .hide(el);
      })
      .then(() => {
        this.animator.setDelay(0);
        button.removeAttribute('disabled');
      })
      .catch(() => {
        button.removeAttribute('disabled');
      });
  }

}
