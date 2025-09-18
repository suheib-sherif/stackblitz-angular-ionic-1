import { Component, Input, OnInit } from '@angular/core';
import { IonCard } from '@ionic/angular/standalone';
import { TypeComponent } from '../type/type.component';
import { CurrencyPipe } from '@angular/common'; 

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports: [IonCard, TypeComponent, CurrencyPipe],
  standalone: true,
  host: { class: 'inline-block align-top' } 
})
export class CardComponent  implements OnInit {
  @Input() logo: string = 'assets/placeholder.png';
  @Input() ticker!: string;
  @Input() name!: string;
  @Input() price!: number;
  @Input() type: string = 'Stock';  
  @Input() size: 'lg' | 'md' | 'sm' = 'lg';
  @Input() metrics: { icon: string, value: string }[] = [];
  
  constructor() { }

  ngOnInit() {
    console.log(this.size, this.type, this.metrics);
    
  }

}
