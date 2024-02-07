import { environment } from "@@environment/environment";
import { Injectable, OnDestroy, inject } from "@angular/core";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { Subject, filter, from, of, switchMap, take, takeUntil, tap } from "rxjs";
import { LocalDbService } from "../../local-db/services/local-db.service";
import { LocalConversationMessage } from "../../local-db/types/local-conversation-message.model";
import { LocalConversation } from "../../local-db/types/local-conversation.model";
import { UserService } from "../../users/services/user.service";
import { Message } from "../types/message.model";

@Injectable()
export class ConversationHubService implements OnDestroy {
  
  private _userService = inject(UserService);
  private _localDbService = inject(LocalDbService);
  
  private _apiUrl = `${environment.urlApi}`;
  private _tokenSignal = this._userService.getUserInfoSignal();
  private _isConnectionStarted = false;
  private _messagesReceived$ = new Subject<LocalConversationMessage>();
  private _openedConversations : LocalConversation [] = [];
  private _unsub$ = new Subject<boolean>();

  private _hubConnection : HubConnection;
  
  constructor(){
    this._hubConnection = this.buildHubConnection();
    this.getOpenedConversations();
  }

  getOpenedConversations(){
    this._localDbService.getLiveConversation()
      .pipe(takeUntil(this._unsub$))
      .subscribe(conversations => {
        this._openedConversations = conversations;
      }); 
  }

  buildHubConnection(){
    return new HubConnectionBuilder()
      .withUrl(`${this._apiUrl}/message-hub`, {
        accessTokenFactory: () => this._tokenSignal()!.token,
      }).build();
  }

  publishMessage(conversationUserId: string, message: string){
    this._localDbService.saveMessage({
      time: new Date(),
      message,
      mine: true,
      conversationUserId
    });

    this.sendMessageToDestinationUserId(conversationUserId, message);
  }

  startHubConnection(){
    if(this._isConnectionStarted)
      return of(null);

    return from(this._hubConnection.start())
      .pipe(tap(() => {
        this._isConnectionStarted = true;
        console.log('Conectou');
      }));
  }

  startListeningMessages(){
    this._hubConnection.on('message-received', (messageReceived: Message) => {
      this.processReceivedMessage(messageReceived);
    })
  }

  listenMessagesReceived(conversationUserId: string){
    return this._messagesReceived$.asObservable()
      .pipe(filter(message => message.conversationUserId === conversationUserId));
  }

  processReceivedMessage(message: Message){
    
    const localMessage: LocalConversationMessage = {
      conversationUserId: message.userId.toLowerCase(),
      mine: false,
      time: new Date(),
      message: message.message
    }

    if(!this._openedConversations.some(cvs => cvs.id === localMessage.conversationUserId)){
      this._localDbService.getUserById(localMessage.conversationUserId)
        .pipe(
          switchMap(usr => this._localDbService.addConversation(usr!.id, usr!.name)),
          take(1)
        ).subscribe();
    }
      
    
    this._localDbService.saveMessage(localMessage);
    this._messagesReceived$.next(localMessage);
  }

  stopHubConnection(){
    return from(this._hubConnection.stop())
      .pipe(tap(() => {
        this._isConnectionStarted = false;
        console.log('Desconectou')}
      ));
  }

  sendMessageToDestinationUserId(destinationUserId: string, message: string){
    return from(this._hubConnection.send('SendMessage', destinationUserId, message));
  }

  ngOnDestroy(): void {
    this.stopHubConnection();
    this._unsub$.next(true);
    this._unsub$.complete();
  }

}