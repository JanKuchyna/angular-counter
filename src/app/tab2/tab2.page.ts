import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  AlertController,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';

export type SortOrder = 'newest' | 'oldest' | 'name' | 'value';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);
  private readonly alertController = inject(AlertController);
  private readonly toastController = inject(ToastController);

  readonly sortOrder = signal<SortOrder>('newest');
  readonly searchTerm = signal('');

  readonly totalValue = computed(() =>
    this.counterService
      .counters()
      .reduce((sum, counter) => sum + counter.value, 0),
  );

  readonly valueStats = computed(() => {
    const counters = this.counterService.counters();

    return {
      positive: counters.filter((counter) => counter.value > 0).length,
      negative: counters.filter((counter) => counter.value < 0).length,
      zero: counters.filter((counter) => counter.value === 0).length,
    };
  });

  readonly visibleCounters = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('cs');
    const filtered = this.counterService
      .counters()
      .filter((counter) =>
        counter.name.toLocaleLowerCase('cs').includes(term),
      );

    return [...filtered].sort(this.compareBy(this.sortOrder()));
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  async remove(counter: SavedCounter): Promise<void> {
    await this.counterService.remove(counter.id);
    await this.showToast(`Záznam „${counter.name}“ byl odstraněn.`);
  }

  async confirmClear(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Vymazat historii?',
      message: 'Všechny uložené záznamy budou trvale odstraněny.',
      buttons: [
        { text: 'Zrušit', role: 'cancel' },
        { text: 'Vymazat', role: 'destructive' },
      ],
    });

    await alert.present();
    const { role } = await alert.onDidDismiss();

    if (role === 'destructive') {
      await this.clear();
    }
  }

  async clear(): Promise<void> {
    await this.counterService.clear();
    await this.showToast('Historie byla vymazána.');
  }

  private compareBy(
    order: SortOrder,
  ): (a: SavedCounter, b: SavedCounter) => number {
    switch (order) {
      case 'oldest':
        return (a, b) => a.createdAt.localeCompare(b.createdAt);
      case 'name':
        return (a, b) => a.name.localeCompare(b.name, 'cs');
      case 'value':
        return (a, b) => b.value - a.value;
      default:
        return (a, b) => b.createdAt.localeCompare(a.createdAt);
    }
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
    });

    await toast.present();
  }
}
