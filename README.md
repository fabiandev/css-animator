# css-animator

This package was created out of the need for using CSS animations with a library like [animate.css](https://github.com/daneden/animate.css) in Angular2. There is no useful animation builder available yet, but I'm sure the Angular2 team will come up with something really cool! Anyway, I'm happy if css-animator can help you with getting some neat animations into your project.

Feel free to [open an issue](https://github.com/fabianweb/css-animator/issues/new) if you're experiencing issues, or if you have any suggestions or comments.  

The package includes ES5 compiled [Browserify](http://browserify.org) files, [SystemJS](https://github.com/systemjs/systemjs) bundle files and all TypeScript typings. Source files will also be added soon (both SystemJS and TypeScript). Please leave a comment if there's something missing for you.

# Installation

```bash
$ npm install --save css-animator
```

# Usage

Use this package in combination with CSS animations.  
A library like [animate.css](https://github.com/daneden/animate.css) already offers a lot of great animations out of the box.  

You can install both packages by running:

```bash
$ npm install --save css-animator animate.css
```

## Basic Usage

You can use css-animator without Angular2. Just import the class and animate any HTMLElement.

```ts
import { AnimationBuilder } from 'css-animator/builder';

let animator = new AnimationBuilder();

animator.setType('shake').animate(element);
```

## Angular2 Service Usage

There is a little Angular2 service included, that gives you the power of dependency injection out of the box.

```ts
import { Component, OnInit } from 'angular2/core';
import { AnimationService, AnimationBuilder } from 'css-animator';

@Component({ ... })
export class SomeComponent implements OnInit {

  private animator: AnimationBuilder;

  constructor(animationService: AnimationService, private elementRef: ElementRef) {
    this.animator = animationService.builder();
  }

  ngOnInit() {
    this.animator.setType('fadeInUp').show(this.elementRef.nativeElement);
  }

}
```

`AnimationService` must be defined as provider to make it injectable. You could do so in you main app component like this:

```ts
import { Component } from 'angular2/core';
import { AnimationService } from 'css-animator';

@Component({
  selector: 'app',
  templateUrl: '/app.html',
  providers: [
    AnimationService
  ]
})
export class AppComponent {

}
```

## Angular2 Directive Usage

Feel free to create your own directive around css-animator. For you to get started, there is one included in this package.

```ts
import { Component } from 'angular2/core';
import { AnimatesDirective } from 'css-animator';

@Component({
  selector: 'some-component',
  template: `
    <div [animates] #animation="animates">
      <span (click)="animation.start({type: 'bounce'})">Click me!</span>
    </div>
  `,
  directives: [
    AnimatesDirective
  ]
})
export class SomeComponent {

}
```

Set default options for the animates directive. Those will be used if you use `animation.start()`.
You can optionally pass all options that the interface `AnimationOptions` supports like this: `animation.start({type: 'bounce', duration: 800})`.

```html
<div
#animation="animates"
[animates]="{ type: 'wobble', duration: '2000' }" // default options are optional
[animatesOnInit]="{ type: 'fadeInUp' }" // automatically animate on init (optional)
(click)="animation.start()"
(mouseleave)="animation.pause()"
(mouseenter)="animation.resume()"
>
</div>
```

> You can also animate host elements with css-animator!

# API

## AnimationOptions

This are all options supported. You may notice, that these are all [CSS animation properties](https://developer.mozilla.org/en/docs/Web/CSS/animation), so you can look up which values are supported.

```ts
export interface AnimationOptions {
  [key: string]: string|number;
  type?: string;
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

Simply animate an element.

```ts
show(element: HTMLElement): Promise<HTMLElement>
```

Animate an element, that was previously hidden.

```ts
hide(element: HTMLElement): Promise<HTMLElement>
```

Adds the attribute `hidden` to the element after the animation has finished.
You may need to add something like `[hidden] { display: none; }` to your CSS.

```ts
stop(element: HTMLElement, reset = true, detach = true): Promise<HTMLElement>
```

Stop the current animation on an element, reset it's position, reject the promise and remove the event listener that listens for animation end.

```ts
setOptions(options: AnimationOptions): AnimationBuilder
```

Set multiple options at once.

```ts
set{Option}(option: string|number): AnimationBuilder
```

You may set options individually like `setDuration(500)`

```ts
addAnimationClass(name: string): AnimationBuilder
```

Adds your custom classes while animating alongside the classes `animated` `animated-{mode}` (where mode is `show`, `hide` or `default`, unless you pass another string to the `animate` method).

```ts
removeAnimationClass(name: string): AnimationBuilder
```

Won't add classes for future animations, previously added with `addAnimationClass`.

> You can also directly apply options without saving it to the animation builder by using `apply{Option}(options: string|number)`  
> Also there are getters for each option, you can access with `animator.{option}`.

## AnimatesDirective

```ts
start(options?: AnimationOptions): Promise<HTMLElement>
```

Animates the element.

```ts
show(options?: AnimationOptions): Promise<HTMLElement>
```

Shows an element that was hidden.

```ts
hide(options?: AnimationOptions): Promise<HTMLElement>
```

Adds the attribute `hidden` to the element after the animation has finished.
You may need to add something like `[hidden] { display: none; }` to your CSS.

```ts
stop(): void
```

Stop the current animation on an element, reset it's position, and removes the event listener that listens for animation end.

```ts
pause(): void
```

Pauses the animation (sets the playState option to `paused`).

```ts
resume(): void
```

Resumes a previously paused animation (sets the playState option to `running`).

```ts
toggle(): void
```

Switches between `pause()` and `resume()`.
