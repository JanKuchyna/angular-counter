import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonInput,
  IonToggle,
} from '@ionic/angular';
import { SavedCounter } from '../../models/saved-counter';

@Component({
  selector: 'app-counter',
  templateUrl: './counter.component.html',
  styleUrls: ['./counter.component.scss'],
  imports: [
    FormsModule,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonToggle,
  ],
})
export class CounterComponent {
  readonly heading = input('Nové počítadlo');
  readonly saved = output<SavedCounter>();

  counterName = '';
  count = 0;
  allowNegative = false;

  increment(): void {
    this.count++;
  }

  decrement(): void {
    if (this.allowNegative || this.count > 0) {
      this.count--;
    }
  }

  onAllowNegativeChange(): void {
    if (!this.allowNegative && this.count < 0) {
      this.count = 0;
    }
  }

  reset(): void {
    this.count = 0;
  }

  save(): void {
    const name = this.counterName.trim();

    if (!name) {
      return;
    }

    this.saved.emit({
      id: crypto.randomUUID(),
      name,
      value: this.count,
      createdAt: new Date().toISOString(),
    });

    this.counterName = '';
    this.count = 0;
  }
}
