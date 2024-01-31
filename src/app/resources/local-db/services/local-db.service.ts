import { Injectable } from "@angular/core";
import Dexie, { liveQuery } from "dexie";
import { defer, from, map } from "rxjs";
import { LocalConversation } from "../types/local-conversation.model";
import { LocalUserImage } from "../types/local-user-image.model";

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  
  private localDb = new Dexie('whats-local-live');

  private get userTable(){
    return this.localDb.table<LocalUserImage>('users');
  }

  private get conversationTable(){
    return this.localDb.table<LocalConversation>('conversations');
  }

  constructor(){
    this.localDb.version(2)
      .stores({
        users: '&id, name, imageBlob',
        conversations: '&id, userName'
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

}