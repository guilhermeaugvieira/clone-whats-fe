import { Component, Input } from '@angular/core';
import { Conversation } from '../../types/conversation.model';

@Component({
  selector: 'app-conversation-contact',
  standalone: true,
  imports: [],
  templateUrl: './conversation-contact.component.html',
  styleUrl: './conversation-contact.component.scss'
})
export class ConversationContactComponent {

  @Input({required: true})
  conversation!: Conversation

}
