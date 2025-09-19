import { ChangeDetectorRef, ElementRef, EventEmitter, NgZone, Output } from '@angular/core';
import { Component, Input, ViewChild } from '@angular/core';
import {
  IonModal, ToastController
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HoldingsService } from 'src/app/core/holdings.service';

@Component({
  selector: 'order-form',
  templateUrl: './order-form.component.html',
  styleUrls: ['./order-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonModal
  ]
})
export class OrderFormComponent {

  @Input() stockSymbol: string = 'GOOG';
  @Input() stockPrice: number = 109.80;
  @Input() priceType: string = 'At market';
  @Input() priceChange: number = 10.00;
  @Output() purchaseComplete = new EventEmitter<any>();

  buyingShares: number = 0;

  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChild('swipeContainer', { read: ElementRef }) swipeContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('swipeButton', { read: ElementRef }) swipeButton?: ElementRef<HTMLDivElement>;

  swipeProgress = 0;
  swipePercentage = 0;
  private _dragging = false;
  private _startX = 0;
  private _knobStart = 0;
  private _max = 0;
  private _thresholdPct = 80;

  ngAfterViewInit() {
  }

  onModalPresented() {
    requestAnimationFrame(() => this.setupSwipe());
  }

  amount: number = 5.1;
  maxSwipeDistance: number = 0;

  presentingEl = document.querySelector('ion-router-outlet') ?? undefined;

  constructor(private holdingsSvc: HoldingsService, private toastController: ToastController, private zone: NgZone, private cdr: ChangeDetectorRef) { }

  open(opts?: { ticker?: string; price?: number; amount?: number, priceChange?: number }) {
    if (opts?.ticker) this.stockSymbol = opts.ticker;
    if (opts?.price != null) this.stockPrice = opts.price;
    if (opts?.amount != null) this.amount = opts.amount;
    if (opts?.priceChange != null) this.priceChange = opts.priceChange;
    this.computeShares(this.amount, this.stockPrice);
    this.modal.present();
  }

  async presentToast(position: string) {
    const toast = await this.toastController.create({
      message: `${position} successfully purchased`,
      duration: 1500,
      position: 'top',
      color: 'secondary',
      cssClass: 'custom-toast'
    });

    await toast.present();
  }


  buy(ticker: string, price: number, amount: number) {
  }

  computeShares(price: number, amount: number) {
    this.buyingShares = amount / price;
  }

  async onSwapCompleted(symbol: string, qty: number, price: number) {
    this.holdingsSvc.add({ symbol, quantity: qty, avgPrice: price, changePrice: this.priceChange, description: '' });
    setTimeout(() => {
      this.presentToast(symbol);
     this.swipeProgress = 0;
     this.swipePercentage = 0;
      this.modal.dismiss();
    }, 500);
  }


  private setupSwipe() {
    const container = this.swipeContainer?.nativeElement;
    const knob = this.swipeButton?.nativeElement;
    if (!container || !knob) return;

    const computeMax = () => {
      const cw = container.clientWidth;
      const kw = knob.clientWidth;
      const leftInset = 8 + 12;
      const rightInset = 8;
      this._max = Math.max(0, cw - kw - leftInset - rightInset);
    };
    computeMax();
    new ResizeObserver(computeMax).observe(container);

    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      knob.setPointerCapture(e.pointerId);
      this._dragging = true;
      this._startX = e.clientX;
      this._knobStart = this.swipeProgress;
    };

    const onMove = (e: PointerEvent) => {
      if (!this._dragging) return;
      const delta = e.clientX - this._startX;
      let next = this._knobStart + delta;
      if (next < 0) next = 0;
      if (next > this._max) next = this._max;

      this.zone.run(() => {
        this.swipeProgress = next;
        this.swipePercentage = Math.round((next / (this._max || 1)) * 100);
        this.cdr.markForCheck();
      });
    };

    const onUp = (e: PointerEvent) => {
      if (!this._dragging) return;
      this._dragging = false;
      knob.releasePointerCapture(e.pointerId);

      this.zone.run(() => {
        if (this.swipePercentage >= this._thresholdPct) {
          this.swipeProgress = this._max;
          this.swipePercentage = 100;
          this.onSwapCompleted(this.stockSymbol, this.buyingShares, this.stockPrice);
        } else {
          this.swipeProgress = 0;
          this.swipePercentage = 0;
        }
        this.cdr.markForCheck();
      });
    };

    knob.addEventListener('pointerdown', onDown, { passive: false });
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }
}
