import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { map, switchMap } from 'rxjs';
import { LocalDbService } from '../../../local-db/services/local-db.service';
import { Conversation } from '../../types/conversation.model';

@Component({
  selector: 'app-conversation-messages-header',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './conversation-messages-header.component.html',
  styleUrl: './conversation-messages-header.component.scss'
})
export class ConversationMessagesHeaderComponent {

  private _activatedRoute = inject(ActivatedRoute);
  private _localDb = inject(LocalDbService);

  protected user$ = this._activatedRoute.paramMap
    .pipe(
      map(value => value.get('userId')),
      switchMap(userId => {
        const userData = this._localDb.getUserById(userId!)
          .pipe(
            map(userInfo => ({
              id: userId,
              userId: userId,
              userName: userInfo!.name,
              userImageUrl: userInfo!.imageBlob ? URL.createObjectURL(userInfo!.imageBlob) : null
            } as Conversation))            
          )

        return userData;
      })
    );

}
