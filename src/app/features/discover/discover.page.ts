import { Component, inject, ViewChild } from '@angular/core';
import { IonContent, IonSearchbar } from '@ionic/angular/standalone';
import { CardComponent } from '../../shared/components/card/card.component';
import { InstrumentComponent } from 'src/app/shared/components/instrument/instrument.component';
import { DataService, CardViewModel } from 'src/app/core/data.service';
import { AsyncPipe } from '@angular/common';
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

  searchClass = '';
  isFocused = false;
  list$ = this.dataSvc.searchInstruments$('');
  history$ = this.holdingsSvc.history$;
  topVolume$: Observable<CardViewModel[]> = this.dataSvc.topVolume$(3);

  constructor(private holdingsSvc: HoldingsService, private dataSvc: DataService) {}

  handleInput(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    const query = target.value?.toLowerCase() || '';
    if (query == '') {
      this.isFocused = false;
      return;
    }
    this.isFocused = true;
    this.list$ = this.dataSvc.searchInstruments$(query);
  }

  async openModal(ticker: string, price: number) {
    let share = await firstValueFrom(this.dataSvc.bySymbols$([ticker]));
    this.orderModal.open({ ticker, price, amount: 10, priceChange: share[0].changePct });
    this.holdingsSvc.addHistory({ symbol: share[0].symbol, quantity: 0, avgPrice: share[0].price, changePrice: share[0].changePct, description: share[0].name });
  }

  onBlurDeferred() {
    setTimeout(() => this.isFocused = false, 50);
  }


}
