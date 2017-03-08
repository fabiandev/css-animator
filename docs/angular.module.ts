import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './angular.component';
import { AnimatesDirective } from 'css-animator';

@NgModule({
  imports: [
    BrowserModule,
  ],
  declarations: [
    AnimatesDirective,
    AppComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
