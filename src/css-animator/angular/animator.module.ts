import { NgModule } from '@angular/core';
import { AnimatesDirective } from './animates.directive';

@NgModule({
  declarations: [
    AnimatesDirective
  ],
  exports: [
    AnimatesDirective
  ]
})
export class AnimatorModule { }
