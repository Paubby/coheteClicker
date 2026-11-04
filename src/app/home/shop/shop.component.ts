import { Component, Input, OnInit } from '@angular/core';
import { IonButton, IonCol, IonGrid, IonRow, IonIcon, PopoverController, ModalController, IonContent,} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { rocketSharp } from 'ionicons/icons';
import itemsData from '../../../assets/data/items.json';


@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.scss'],
  imports: [IonButton, IonCol, IonGrid, IonRow, IonIcon, IonContent],
})
export class ShopComponent implements OnInit {

  @Input() moneda: string = 'hierro';

  itemsData: any = [];
  numClics: number = 0;

  constructor(public popoverController: PopoverController, public modalCtrl: ModalController) {
    addIcons({ rocketSharp });
  }

  ngOnInit() {
    // PARA QUE SE VEA EN CADA PAGINA SUS MEJORAS

    // solo las mejoras de esta moneda
    this.itemsData = itemsData.upgrade.filter((c: any) =>
      c.currency.toLowerCase() === this.moneda.toLowerCase()
    );

    // leer el saldo correcto
    const claves: any = {
      hierro:  'numCont',
      chatarra:'chatarra',
      dinero:  'clicksCV',
    };

    this.numClics = Number(localStorage.getItem(claves[this.moneda] ?? 'numCont')) || 0;
  }

  buyUpgrade(upgrade: any){
    return this.modalCtrl.dismiss(upgrade, 'upgrade');
  }
}