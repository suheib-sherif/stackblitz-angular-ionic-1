import { OrderFormComponent } from '../../features/order-form/order-form.component';

import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { IonContent, ToastController, IonItem, IonItemOptions, IonItemSliding, IonItemOption } from '@ionic/angular/standalone';
import { AsyncPipe, CurrencyPipe } from '@angular/common';
import { HoldingsService } from '../../core/holdings.service';

import { InstrumentComponent } from '../../shared/components/instrument/instrument.component';
import { CardComponent } from '../../shared/components/card/card.component'; 
import { DataService } from 'src/app/core/data.service';
import { HttpClientModule } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type Holding = {
  ticker: string;
  quantity: string;
  price: number;
  delta: number;
};

type Trending = {
  logo: string;
  ticker: string;
  name: string;
  price: number;
  type: 'Stock' | 'ETF';
};

@Component({
  selector: 'app-invest',
  templateUrl: 'invest.page.html',
  styleUrls: ['invest.page.scss'],
  imports: [IonItemOption, IonItemSliding, IonItemOptions,
    IonItem, IonContent,
    HttpClientModule, CurrencyPipe, AsyncPipe,
    InstrumentComponent, CardComponent, OrderFormComponent
  ],
})
export class InvestPage implements OnInit {
  @ViewChild('buyModal') orderModal!: OrderFormComponent;

  constructor(private dataSvc: DataService, private holdingsSvc: HoldingsService, private toastController: ToastController) { }

  trending$ = this.dataSvc.trending$(12);
  equity$ = this.holdingsSvc.equity$;
  holdings$ = this.holdingsSvc.holdings$;

  ngOnInit() {
    this.holdingsSvc.calculateEquity();
  }

  async presentToast(position: string) {
    const toast = await this.toastController.create({
      message: `${position} successfully purchased`,
      duration: 1500,
      position: 'top',
      cssClass: 'custom-toast',
    });

    await toast.present();
  }

  async openModal(ticker: string, price: number) {
    let share = await firstValueFrom(this.dataSvc.bySymbols$([ticker]));
    this.orderModal.open({ ticker, price, amount: 10, priceChange: share[0].changePct });
  }

  async onDeleteCompleted(symbol: string) {
    this.holdingsSvc.clear();
  }
  async onDelete(symbol: string) {
    this.holdingsSvc.remove(symbol);
  }
}
