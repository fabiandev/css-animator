import 'reflect-metadata';
import 'zone.js';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './angular.module';

enableProdMode();
platformBrowserDynamic().bootstrapModule(AppModule);
