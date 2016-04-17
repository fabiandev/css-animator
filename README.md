# css-animator

The documentation is work in progress and shows just the most important usages and options.  

Explanations and more examples will be added very soon!

# Installation

```bash
$ npm install --save css-animator
```

# Usage

Use this package in combination with CSS animations.  
A library like [animate.css](https://github.com/daneden/animate.css) already offers a lot of great animations out of the box.

## Basic Usage

```ts
import { AnimationBuilder } from 'css-animator/builder';

let animator = new AnimationBuilder();

animator.setType('shake').animate(element);
```

## Angular2 Service Usage

```ts
import { Component, OnInit } from 'angular2/core';
import { AnimationBuilder } from 'css-animator/builder';
import { AnimationService } from 'css-animator/modules';

@Component({ ... })
export class AppComponent implements OnInit {

  private animator: AnimationBuilder;

  constructor(animationService: AnimationService, private elementRef: ElementRef) {
    this.animator = animationService.builder();
  }

  ngOnInit() {
    this.animator.setType('fadeInUp').show(this.elementRef.nativeElement);
  }

}
```

> `AnimationService` must be defined as provider to make it injectable.

## Angular2 Directive Usage

```ts
import { Component } from 'angular2/core';
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
#animation="animates"
[animates]="{ type: 'wobble', duration: '1000' }" // default options
[animatesOnInit]="{ type: 'fadeInUp' }"
(click)="animation.start()"
>
</div>
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
start(options?: AnimationOptions): Promise<HTMLElement>
```

```ts
show(options?: AnimationOptions): Promise<HTMLElement>
```

```ts
hide(options?: AnimationOptions): Promise<HTMLElement>
```

```ts
stop(): void
```

```ts
pause(): void
```

```ts
resume(): void
```

```ts
toggle(): void
```
