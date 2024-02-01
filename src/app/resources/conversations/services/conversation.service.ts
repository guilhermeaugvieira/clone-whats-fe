import { Injectable, inject } from '@angular/core';
import { forkJoin, map, switchMap } from 'rxjs';
import { LocalDbService } from '../../local-db/services/local-db.service';
import { Conversation } from '../types/conversation.model';

@Injectable({
  providedIn: 'root'
})
export class ConversationService {

  private _localDbService = inject(LocalDbService);

  createConversation(id: string, userName: string){
    return this._localDbService.addConversation(id, userName);
  }

  listenConversations(){
    return this._localDbService.getLiveConversation()
      .pipe(
        switchMap(conversations => {
          
          const userImageBlobRequests = conversations
            .map(conversation => 
              this._localDbService.getUserImage(conversation.id)
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

  publishMessage(conversationUserId: string, message: string){
    return this._localDbService.saveMessage({
      time: new Date(),
      message,
      mine: true,
      conversationUserId
    });
  }

  obtainMessageHistoryFromConversationUserId(conversationUserId: string){
    return this._localDbService.getMessageHistoryByConversationUserId(conversationUserId);
  }
}
