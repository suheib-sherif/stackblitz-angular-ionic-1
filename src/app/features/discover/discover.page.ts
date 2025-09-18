import { Component, inject, ViewChild } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonGrid, IonCol, IonRow, IonSearchbar, IonList, IonItem, IonLabel, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/angular/standalone';
import { CardComponent } from '../../shared/components/card/card.component';
import { InstrumentComponent } from 'src/app/shared/components/instrument/instrument.component';
import { NgClass } from '@angular/common';
import { addIcons } from 'ionicons';
import { trash } from 'ionicons/icons';
import { DataService, CardViewModel } from 'src/app/core/data.service';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { firstValueFrom, Observable } from 'rxjs';
import { HoldingsService } from 'src/app/core/holdings.service';
import { OrderFormComponent } from '../order-form/order-form.component';

@Component({
  selector: 'app-discover',
  templateUrl: 'discover.page.html',
  styleUrls: ['discover.page.scss'],
  imports: [IonSearchbar, IonContent, AsyncPipe, CardComponent, InstrumentComponent, OrderFormComponent]
})
export class DiscoverPage {
  @ViewChild('buyModal') orderModal!: OrderFormComponent;

  history$ = this.holdingsSvc.history$;

  // handleInput(event: Event) {
  //   const target = event.target as HTMLIonSearchbarElement;
  //   const query = target.value?.toLowerCase() || '';
  //   this.results = this.data.filter((d) => d.toLowerCase().includes(query));
  // }
  private data = inject(DataService);

  searchClass = '';
  isFocused = false;
  dataService: any;
  list$ = this.data.searchInstruments$('');

  constructor(private holdingsSvc: HoldingsService) {
    addIcons({ trash });
  }

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    //this.results = this.data.filter((d) => d.toLowerCase().includes(query));
    this.list$ = this.data.searchInstruments$(query);
  }

  async openModal(ticker: string, price: number) {
    let share = await firstValueFrom(this.data.bySymbols$([ticker]));
    this.orderModal.open({ ticker, price, amount: 10, priceChange: share[0].changePct });
    this.holdingsSvc.addHistory({ symbol: share[0].symbol, quantity: 0, avgPrice: share[0].price, changePrice: share[0].changePct, description: share[0].name });
  }

  onBlurDeferred() {
    setTimeout(() => this.isFocused = false, 0);
  }

  trending$ = this.data.trending$(3);

  topVolume$: Observable<CardViewModel[]> = this.data.topVolume$(3);

}
