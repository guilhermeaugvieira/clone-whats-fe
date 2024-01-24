import { APP_INITIALIZER, ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { UserService } from './resources/users/services/user.service';

const appInitializerProvider = (userService: UserService) => () => {
  userService.trySyncLocalStorage();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: appInitializerProvider,
      multi: true,
      deps: [UserService]
    }
  ]
};
