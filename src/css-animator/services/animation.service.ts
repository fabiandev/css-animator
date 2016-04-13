import { Injectable } from 'angular2/core';
import { AnimationBuilder } from '..';

@Injectable()
export class AnimationService {

  public builder(): AnimationBuilder {
    return new AnimationBuilder();
  }

}
