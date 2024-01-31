import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConversationService } from '../../services/conversation.service';
import { ConversationContactComponent } from '../conversation-contact/conversation-contact.component';
import { ConversationHeaderComponent } from '../conversation-header/conversation-header.component';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [ConversationHeaderComponent, ConversationContactComponent, AsyncPipe],
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.scss'
})
export class ConversationListComponent {

  private _conversationService = inject(ConversationService);
  private _router = inject(Router);

  protected conversations$ = this._conversationService.listenConversations();

  goToUser(userId: string){
    this._router.navigate(['conversations', userId]);
  }

}
