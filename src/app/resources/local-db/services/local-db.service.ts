import { Injectable } from "@angular/core";
import Dexie, { liveQuery } from "dexie";
import { defer, from, map } from "rxjs";
import { LocalConversationMessage } from "../types/local-conversation-message.model";
import { LocalConversation } from "../types/local-conversation.model";
import { LocalUserImage } from "../types/local-user-image.model";

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  
  private _localDb = new Dexie('whats-local-live');

  private get userTable(){
    return this._localDb.table<LocalUserImage>('users');
  }

  private get conversationTable(){
    return this._localDb.table<LocalConversation>('conversations');
  }

  private get conversationMessagesTable(){
    return this._localDb.table<LocalConversationMessage>('conversationMessages');
  }

  constructor(){
    this._localDb.version(3)
      .stores({
        users: '&id, name, imageBlob',
        conversations: '&id, userName',
        conversationMessages: '++id, conversationUserId, message, mine, time'
      });
  }

  addUsers(users: LocalUserImage[]){
    return from(this.userTable.bulkPut(users));
  }

  getUserImage(userId: string){
    return from(this.userTable.get(userId))
      .pipe(
        map(localUserImageBlob => localUserImageBlob?.imageBlob));
  }

  addConversation(id: string, userName: string){
    return defer(() => this.conversationTable.put({
      id, userName
    }));
  }

  getUsers(){
    return defer(() => this.userTable.toArray());
  }

  getLiveConversation(){
    return from(liveQuery(() => this.conversationTable.toArray()));
  }

  getUserById(userId: string){
    return defer(() => this.userTable.get(userId.toLocaleLowerCase()));
  }

  saveMessage(message: LocalConversationMessage){
    return from(this.conversationMessagesTable.add(message));
  }

  getMessageHistoryByConversationUserId(conversationUserId: string){
    return defer(() => this.conversationMessagesTable
      .where('conversationUserId')
      .equalsIgnoreCase(conversationUserId)
      .toArray());
  }

}