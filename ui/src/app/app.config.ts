import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import {BrowserAnimationsModule, NoopAnimationsModule, provideAnimations} from "@angular/platform-browser/animations";
import {DataRequestService} from "./services/data-request.service";
import {provideHttpClient, withFetch} from "@angular/common/http";
import {AgGridModule} from "ag-grid-angular";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    BrowserAnimationsModule,
    NoopAnimationsModule,
    DataRequestService,
    AgGridModule,
    provideHttpClient(withFetch()),
    provideClientHydration(),
    provideAnimations()]
};
