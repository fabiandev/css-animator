import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './angular.component';
import { AnimatorModule } from 'css-animator';

@NgModule({
  imports: [
    BrowserModule,
    AnimatorModule,
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
