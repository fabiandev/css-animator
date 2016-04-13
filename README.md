# css-animator

The documentation is work in progress. Explanations and more examples will be added very soon!

# Installation

```bash
$ npm install --save css-animator
```

# Usage

## Basic Usage

```ts
import { AnimationBuilder } from 'css-animator/builder';

let animator = new AnimationBuilder();

animator.setType('shake').animate(element);
```

## Angular2 Service Usage

```ts
import { AnimationBuilder } from 'css-animator/builder';
import { AnimationService } from 'css-animator/modules';

@Component({ ... })
export class AppComponent {

  private animator: AnimationBuilder;

  constructor(animationService: AnimationService, private elementRef: ElementRef) {
    this.animator = animationService.builder();
  }

  ngOnInit() {
    this.animator.setType('fadeInUp').show(elementRef.nativeElement);
  }

}
```

> `AnimationService` must be defined as provider to make it injectable.

## Angular2 Directive Usage

```ts
import { AnimatesDirective } from 'css-animator/modules';

@Component({
  ...
  directives: [
    AnimatesDirective
  ]
})
export class AppComponent {

}
```

```html
<div
[animates]="{ optional default options }" #animation="animation"
[animatesOnInit]="{ on-init options }"
(click)="animation.start({type: 'shake'})"
></div>
```

# API

## AnimationOptions

```ts
export interface AnimationOptions {
  [key: string]: string|number;
  type: string;
  fillMode?: string;
  timingFunction?: string;
  playState?: string;
  direction?: string;
  duration?: string|number;
  delay?: string|number;
  iterationCount?: string|number;
}
```

## AnimationBuilder

```ts
animate(element: HTMLElement, mode = 'default'): Promise<HTMLElement>
```

```ts
show(element: HTMLElement): Promise<HTMLElement>
```

```ts
hide(element: HTMLElement): Promise<HTMLElement>
```

```ts
stop(element: HTMLElement, reset = true, detach = true): Promise<HTMLElement>
```

```ts
setOptions(options: AnimationOptions): AnimationBuilder
```

## AnimatesDirective

```ts
start(options: AnimationOptions): Promise<HTMLElement>
```

```ts
show(options: AnimationOptions): Promise<HTMLElement>
```

```ts
hide(options: AnimationOptions): Promise<HTMLElement>
```

```ts
stop(options: AnimationOptions): void
```

```ts
pause(options: AnimationOptions): void
```

```ts
resume(options: AnimationOptions): void
```

```ts
toggle(options: AnimationOptions): void
```
