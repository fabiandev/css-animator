import { Injectable } from '@angular/core';
import { AnimationBuilder } from '../builder';

@Injectable()
export class AnimationService {

  public builder(): AnimationBuilder {
    return new AnimationBuilder();
  }

}
