import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

type InstrumentMode = 'owned' | 'not-owned';

@Component({
  selector: 'app-instrument',
  templateUrl: './instrument.component.html',
  styleUrls: ['./instrument.component.scss'],
  standalone: true,
  imports: [DecimalPipe, CurrencyPipe]
})
export class InstrumentComponent  implements OnInit {
  @Input() mode: InstrumentMode = 'not-owned';

  @Input() ticker = 'TIK';
  @Input() price!: number;

  @Input() delta?: number | null;      
  @Input() quantity?: string | number;  

  @Input() description?: string;        

  @Input() currencyCode: string = 'USD';

  constructor() { }

  ngOnInit() {}

}
