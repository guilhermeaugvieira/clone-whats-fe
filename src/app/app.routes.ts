import { Routes } from '@angular/router';
import { ConversationMessagePageComponent } from './resources/conversations/pages/conversation-message-page/conversation-message-page.component';
import { isUserLoggedGuard } from './resources/users/guards/is-user-logged.can-activate.guard';
import { LoginPageComponent } from './resources/users/pages/login-page/login-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'conversations',
    loadComponent: () => import('./resources/conversations/pages/conversation-page/conversation-page.component'),
    canActivate: [ isUserLoggedGuard ],
    children: [
      {
        path: ':userId',
        component: ConversationMessagePageComponent
      }
    ]
  }
];
