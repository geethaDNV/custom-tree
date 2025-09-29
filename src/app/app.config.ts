import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import {
  NgxsRouterPluginModule,
  RouterStateSerializer,
} from '@ngxs/router-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxsDispatchPluginModule } from '@ngxs-labs/dispatch-decorator';
import { GlobalState } from './state/global.state';
import { providePrimeNG } from 'primeng/config';
import MyPreset from './my-preset';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
     providePrimeNG({
        theme: {
            preset: MyPreset,
            options: {
                cssLayer: {
                    name: 'primeng',
                    order: 'primeng, app-styles'
                }
            }
        }
    }),
    provideRouter(routes),
     importProvidersFrom(
      NgxsModule.forRoot(
        [
          GlobalState,
        ],
        {
          developmentMode: true,
          compatibility: {
            strictContentSecurityPolicy: true,
          },
        },
      ),
      NgxsDispatchPluginModule.forRoot(),
      NgxsReduxDevtoolsPluginModule.forRoot(),
      NgxsRouterPluginModule.forRoot(),
    ),
  ]
};
