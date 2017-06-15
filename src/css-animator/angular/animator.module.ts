import { NgModule } from '@angular/core';
import { AnimatesDirective } from './animates.directive';
import { AnimationService } from './animation.service';

@NgModule({
  declarations: [
    AnimatesDirective
  ],
  exports: [
    AnimatesDirective
  ],
  providers: [
    AnimationService
  ]
})
export class AnimatorModule { }
