import { Injectable, inject } from '@angular/core';
import { forkJoin, map, switchMap } from 'rxjs';
import { LocalDbService } from '../../local-db/services/local-db.service';
import { Conversation } from '../types/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private _localDb = inject(LocalDbService);

  createConversation(id: string, userName: string){
    return this._localDb.addConversation(id, userName);
  }

  listenConversations(){
    return this._localDb.getLiveConversation()
      .pipe(
        switchMap(conversations => {
          
          const userImageBlobRequests = conversations
            .map(conversation => 
              this._localDb.getUserImage(conversation.id)
                .pipe(
                  map(blob => ({
                    id: conversation.id,
                    userId: conversation.id,
                    userName: conversation.userName,
                    userImageUrl: !!blob ? URL.createObjectURL(blob) : null
                }) as Conversation)
            ));

          return forkJoin(userImageBlobRequests);
        })
      );
  }
}
