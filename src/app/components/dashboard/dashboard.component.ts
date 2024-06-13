
import {
  Component,
  signal,
  computed,
} from '@angular/core';
import {NgStyle} from "@angular/common";

type Item = {
  name: string;
  price: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  itemsPaid: boolean = false;

  items: Item[] = [
    {
      name: 'FFVII: Rebirth',
      price: 70
    },
    {
      name: 'XIV: Dawntrail',
      price: 40
    },
    {
      name: 'Playstation 5',
      price: 500
    },
  ];

  noItems: Item[] = [
    {
      name: 'Thank you',
      price: 0
    },
  ];

  itemList = signal(this.items);

  totalPrice = computed(() => {
    return this.itemList().reduce((acc, curr) => acc + curr.price, 0);
  });

  removeItem(item: Item) {
    this.itemList.set(
      this.itemList().filter(
        (i) => i !== item
      )
    );
  }

  itemExists(item: Item) {
    return this.itemList().includes(item);
  }

  resetItems() {
    this.itemList.set(this.items);
    this.itemsPaid = false;
  }

  payItems() {
    this.itemList.set(this.noItems);
    this.itemsPaid = true;
  }

}
