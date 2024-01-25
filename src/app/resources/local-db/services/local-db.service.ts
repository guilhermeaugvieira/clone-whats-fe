import { Injectable } from "@angular/core";
import Dexie from "dexie";
import { from, map } from "rxjs";
import { LocalUserImage } from "../types/local-user-image.model";

@Injectable({
  providedIn: 'root'
})
export class LocalDbService {
  
  private localDb = new Dexie('whats-local-live');

  private get userTable(){
    return this.localDb.table<LocalUserImage>('users');
  }

  constructor(){
    this.localDb.version(1)
      .stores({
        users: '&id, name, imageBlob'
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

}