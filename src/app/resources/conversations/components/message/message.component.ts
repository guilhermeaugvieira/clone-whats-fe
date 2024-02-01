import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LocalConversationMessage } from '../../../local-db/types/local-conversation-message.model';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss'
})
export class MessageComponent {

  @Input({required: true})
  message!: LocalConversationMessage;

}
