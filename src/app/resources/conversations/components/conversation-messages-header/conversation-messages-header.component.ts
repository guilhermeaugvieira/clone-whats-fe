import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { UserService } from '../../../users/services/user.service';

@Component({
  selector: 'app-conversation-messages-header',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './conversation-messages-header.component.html',
  styleUrl: './conversation-messages-header.component.scss'
})
export class ConversationMessagesHeaderComponent {

  private _activatedRoute = inject(ActivatedRoute);
  private _userService = inject(UserService);

  protected user$ = this._activatedRoute.paramMap
    .pipe(
      map(param => param.get('userId')),
      switchMap(userId => this._userService.getLocalUserById(userId!))
    );

}
