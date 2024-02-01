import { AfterViewInit, Component, ElementRef, OnDestroy, QueryList, ViewChild, ViewChildren, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, filter, map, take, takeUntil } from 'rxjs';
import { LocalConversationMessage } from '../../../local-db/types/local-conversation-message.model';
import { ConversationService } from '../../services/conversation.service';
import { MessageComponent } from '../message/message.component';

@Component({
  selector: 'app-conversation-messages',
  standalone: true,
  imports: [MessageComponent, FormsModule],
  templateUrl: './conversation-messages.component.html',
  styleUrl: './conversation-messages.component.scss'
})
export class ConversationMessagesComponent implements OnDestroy, AfterViewInit {
  @ViewChildren(MessageComponent) messageComponents!: QueryList<MessageComponent>;
  @ViewChild('scrollPanel') messageSection!: ElementRef;
  
  private _conversationService = inject(ConversationService);
  private _unsub$ = new Subject<boolean>();
  private _conversationUserId = '';
  
  protected messages : LocalConversationMessage[] = [];
  protected inputMessage = '';

  constructor(activatedRoute: ActivatedRoute){
    activatedRoute.paramMap
      .pipe(
        map(params => params.get('userId')),
        filter(userId => !!userId),
        takeUntil(this._unsub$)
      ).subscribe(userId => {
        this._conversationUserId = userId || '';
        
        this._conversationService.obtainMessageHistoryFromConversationUserId(userId!)
          .pipe(
            take(1),
          ).subscribe(storedMessages => {
            this.messages = storedMessages;
          })
      });
  }

  sendMessage(){
    if(!this.inputMessage.trim())
      return;

    this.messages.push({
      time: new Date(),
      mine: true,
      message: this.inputMessage,
      conversationUserId: this._conversationUserId,
    });

    this._conversationService.publishMessage(this._conversationUserId, this.inputMessage);

    this.inputMessage = '';
  }

  scrollToLast(){
    try{
      this.messageSection.nativeElement.scrollTop = this.messageSection.nativeElement.scrollHeight;
    }catch{}
  }

  ngAfterViewInit(): void {
    this.messageComponents.changes
      .pipe(
        takeUntil(this._unsub$)
      )
      .subscribe(() => this.scrollToLast());
  }
  
  ngOnDestroy(): void {
    this._unsub$.next(true);
    this._unsub$.complete();
  }

}
