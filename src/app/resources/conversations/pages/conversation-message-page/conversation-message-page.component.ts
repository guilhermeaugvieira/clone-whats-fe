import { Component } from '@angular/core';
import { ConversationMessagesHeaderComponent } from '../../components/conversation-messages-header/conversation-messages-header.component';
import { ConversationMessagesComponent } from '../../components/conversation-messages/conversation-messages.component';

@Component({
  selector: 'app-conversation-message-page',
  standalone: true,
  imports: [ConversationMessagesHeaderComponent, ConversationMessagesComponent],
  templateUrl: './conversation-message-page.component.html',
  styleUrl: './conversation-message-page.component.scss'
})
export class ConversationMessagePageComponent {

  

}
