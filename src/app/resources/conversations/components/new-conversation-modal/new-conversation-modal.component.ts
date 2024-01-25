import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-new-conversation-modal',
  standalone: true,
  imports: [],
  templateUrl: './new-conversation-modal.component.html',
  styleUrl: './new-conversation-modal.component.scss'
})
export class NewConversationModalComponent {
  
  @Input({required: true})
  showModal = false;

  @Output()
  showModalChange = new EventEmitter<boolean>();
}
