import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Holding = { symbol: string; quantity: number; avgPrice: number, changePrice: number, description: string };

@Injectable({ providedIn: 'root' })
export class HoldingsService {
  private readonly KEY = 'holdings.v1';
  private readonly EQUITY = 'equity.v1';
  private readonly HISTORY = 'history.v1';

  private _holdings$ = new BehaviorSubject<Holding[]>(this.load());
  private _history$ = new BehaviorSubject<Holding[]>(this.load());
  private _equity$ = new BehaviorSubject<number>(0);
  holdings$ = this._holdings$.asObservable();
  equity$ = this._equity$.asObservable();
  history$ = this._history$.asObservable();

  /** Add or upsert a holding */
  add(h: Holding) {
    const list = this._holdings$.value.slice();
    const i = list.findIndex(x => x.symbol === h.symbol);
    if (i >= 0) {
      // example: average price, accumulate qty (tweak logic to your needs)
      const prev = list[i];
      const newQty = prev.quantity + h.quantity;
      const newAvg = (prev.avgPrice * prev.quantity + h.avgPrice * h.quantity) / newQty;
      list[i] = { symbol: h.symbol, quantity: newQty, avgPrice: +newAvg.toFixed(4), changePrice:h.changePrice, description: h.description };
    } else {
      list.push(h);
    }
    this._holdings$.next(list);
    this.save(list);
    this.calculateEquity();
  }

    addHistory(h: Holding) {
    const list = this._holdings$.value.slice();
    const i = list.findIndex(x => x.symbol === h.symbol);
    if (i < 0) {
        list.push(h);
    } 
    this._history$.next(list);
    this.save(list);
    //this.calculateEquity();
  }

  remove(symbol: string) {
    const list = this._holdings$.value.filter(x => x.symbol !== symbol);
    this._holdings$.next(list);
    this.save(list);
    this.calculateEquity();
  }

  clear() {
    this._holdings$.next([]);
    localStorage.removeItem(this.KEY);
  }

  calculateEquity() {
    let equity = 0;
    const list = this._holdings$.value.slice();
    list.forEach(share => {
        equity += share.avgPrice*share.quantity;
    });
    console.log(Math.round(equity));
    
    this._equity$.next(Math.round(equity));
  }

  private load(): Holding[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch { return []; }
  }
  private save(list: Holding[]) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  }
    private saveHistory(list: Holding[]) {
    localStorage.setItem(this.HISTORY, JSON.stringify(list));
  }
    private loadHistory(): Holding[] {
    try { return JSON.parse(localStorage.getItem(this.HISTORY) || '[]'); }
    catch { return []; }
  }
}
