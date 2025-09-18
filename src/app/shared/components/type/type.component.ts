import { Component, Input, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';  

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html',
  styleUrls: ['./type.component.scss'],
  imports: [NgClass],
  standalone: true,
})
export class TypeComponent  implements OnInit {
  @Input() text: string = '';
  @Input() color: 'black' | 'blue' | 'green' | 'red' | 'gray' = 'gray';
  @Input() size: 'sm' | 'md' | 'lg' = 'lg';

  get chipClasses() {
    switch (this.color) {
      case 'black':
        return 'border-black text-black';
      case 'blue':
        return 'border-blue-500 text-blue-500';
      case 'green':
        return 'border-green-500 text-green-500';
      case 'red':
        return 'border-red-500 text-red-500';
      default:
        return 'border-slate-300 text-slate-600';
    }
  }

    get chipSize() {
    switch (this.size) {
      case 'sm':
        return 'h-[18px]';
      case 'md':
        return 'h-[18px]';
      case 'lg':
        return 'h-[18px]';
      default:
        return 'h-[18px]';
    }
  }
  
  constructor() { }

  ngOnInit() {}


}
