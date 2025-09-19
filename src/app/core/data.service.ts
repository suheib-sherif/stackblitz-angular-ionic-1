import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, catchError, of, combineLatestWith } from 'rxjs';

export interface InstrumentDetails {
  id: string;
  symbol: string;
  type: 'stock' | 'etf' | 'otc';
  fullName: string;
  logo: string;
  volume: number | null;
  marketCap: number | null;
}

export interface InstrumentPricing {
  id: string;
  symbol: string;
  open: number;
  close: number;
  ask: number;
  high: number;
  low: number;
}

export interface InstrumentViewModel {
  symbol: string;
  type: 'Stock' | 'ETF' | 'OTC';
  name: string;
  logo: string;
  price: number;      // we'll use pricing.ask as "now" price
  changePct: number;  // (close - open) / open * 100
}

export interface CardMetric {
  icon: string;
  value: string;
}

export interface CardViewModel {
  symbol: string;
  type: 'Stock' | 'ETF' | 'OTC';
  name: string;
  logo: string;
  price: number;
  changePct: number;
  metrics: CardMetric[];
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private http = inject(HttpClient);

  private details$ = this.http.get<InstrumentDetails[]>('/assets/data/details.json').pipe(
    shareReplay(1),
    catchError(() => of([] as InstrumentDetails[]))
  );

  private pricing$ = this.http.get<InstrumentPricing[]>('/assets/data/pricing.json').pipe(
    shareReplay(1),
    catchError(() => of([] as InstrumentPricing[]))
  );

  instruments$ = this.details$.pipe(
    combineLatestWith(this.pricing$),
    map(([details, pricing]) => {
      const pMap = new Map(pricing.map(p => [p.symbol, p]));
      return details.map<InstrumentViewModel>(d => {
        const p = pMap.get(d.symbol);
        const open = p?.open ?? 0;
        const close = p?.close ?? 0;
        const ask = p?.ask ?? (close || open);

        const changePct = open ? ((close - open) / open) * 100 : 0;
        return {
          symbol: d.symbol,
          type: this.formatString(d.type),
          name: d.fullName,
          logo: d.logo,
          price: ask,
          changePct
        };
      });
    }),
    shareReplay(1)
  );

  private cardViewModels$ = this.details$.pipe(
    combineLatestWith(this.pricing$),
    map(([details, pricing]) => {
      const pMap = new Map(pricing.map(p => [p.symbol, p]));
      return details.map<CardViewModel>(d => {
        const p = pMap.get(d.symbol);
        const open = p?.open ?? 0;
        const close = p?.close ?? 0;
        const ask = p?.ask ?? (close || open);
        const high = p?.high ?? 0;
        const low = p?.low ?? 0;

        const changePct = open ? ((close - open) / open) * 100 : 0;
        
        const metrics: CardMetric[] = [];
        
        if (d.marketCap && d.marketCap > 0) {
          metrics.push({
            icon: 'assets/icon/circle-dollar.svg',
            value: this.formatMarketCap(d.marketCap)
          });
        }
        
        if (d.volume && d.volume > 0) {
          metrics.push({
            icon: 'assets/icon/target.svg',
            value: this.formatVolume(d.volume)
          });
        }
        
        if (high > 0 && low > 0) {
          metrics.push({
            icon: 'assets/icon/square-dollar.svg',
            value: `$${low.toFixed(0)}-${high.toFixed(0)}`
          });
        }

        return {
          symbol: d.symbol,
          type: this.formatString(d.type),
          name: d.fullName,
          logo: d.logo,
          price: ask,
          changePct,
          metrics
        };
      });
    }),
    shareReplay(1)
  );

  bySymbols$(symbols: string[]) {
    const set = new Set(symbols);
    return this.instruments$.pipe(
      map(list => list.filter(x => set.has(x.symbol)))
    );
  }

  searchInstruments$(term: string) {
  const q = term.trim().toLowerCase();

  return this.instruments$.pipe(
    map(list => {
      if (!q) return list.slice(0, 10);

      return list
        .filter(x =>
          x.symbol.toLowerCase().includes(q) ||
          x.name.toLowerCase().includes(q)   
        )
        .slice(0, 10);
    })
  );
}

  formatString(text: string) {
    switch (text.toLowerCase()) {
      case 'etf':
        return 'ETF' as const;
      case 'stock':
        return 'Stock' as const;
      case 'otc':
        return 'OTC' as const;
      default:
        return 'Stock' as const;
    }
  }

  /** Format market cap for display */
  private formatMarketCap(marketCap: number): string {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(1)}K`;
    }
    return `$${marketCap.toFixed(0)}`;
  }

  /** Format volume for display */
  private formatVolume(volume: number): string {
    if (volume >= 1e9) {
      return `${(volume / 1e9).toFixed(1)}B`;
    } else if (volume >= 1e6) {
      return `${(volume / 1e6).toFixed(1)}M`;
    } else if (volume >= 1e3) {
      return `${(volume / 1e3).toFixed(1)}K`;
    }
    return volume.toFixed(0);
  }

  trending$(limit = 10) {
    return this.cardViewModels$.pipe(
      map(list =>
        list
          .filter(x => x.price && x.logo)         
          .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
          .slice(0, limit)
      )
    );
  }

  topVolume$(limit = 3) {
    return this.details$.pipe(
      combineLatestWith(this.pricing$),
      map(([details, pricing]) => {
        const pMap = new Map(pricing.map(p => [p.symbol, p]));
        
        return details
          .filter(d => d.volume && d.volume > 0 && d.logo) 
          .sort((a, b) => (b.volume || 0) - (a.volume || 0)) 
          .slice(0, limit)
          .map<CardViewModel>(d => {
            const p = pMap.get(d.symbol);
            const open = p?.open ?? 0;
            const close = p?.close ?? 0;
            const ask = p?.ask ?? (close || open);
            const high = p?.high ?? 0;
            const low = p?.low ?? 0;

            const changePct = open ? ((close - open) / open) * 100 : 0;
            
            const metrics: CardMetric[] = [];
            
            if (d.marketCap && d.marketCap > 0) {
              metrics.push({
                icon: 'assets/icon/circle-dollar.svg',
                value: this.formatMarketCap(d.marketCap)
              });
            }
            
            metrics.push({
              icon: 'assets/icon/target.svg',
              value: this.formatVolume(d.volume!)
            });
            
            if (high > 0 && low > 0) {
              metrics.push({
                icon: 'assets/icon/square-dollar.svg',
                value: `$${low.toFixed(0)}-${high.toFixed(0)}`
              });
            }

            return {
              symbol: d.symbol,
              type: this.formatString(d.type),
              name: d.fullName,
              logo: d.logo,
              price: ask,
              changePct,
              metrics
            };
          })
        })
    );
  }
}