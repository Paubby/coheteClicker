import { Component, OnInit, ChangeDetectorRef, signal } from '@angular/core';
import { IonCol, IonGrid, IonRow ,IonHeader, IonToolbar, IonTitle, IonContent, ToastController, IonButton } from '@ionic/angular';
import { ModalController } from '@ionic/angular';
import { ShopComponent } from './shop/shop.component';
import { trashBin } from 'ionicons/icons';
import { IonProgressBar } from '@ionic/angular';


interface Flotante {
  id: number;
  x: number;
  y: number;
  monedas: string;
  dano: string;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent,IonButton,IonCol, IonGrid, IonRow, IonProgressBar],
})
export class HomePage implements OnInit{
  constructor(private toastController: ToastController, private modalCtrl: ModalController, private cdr: ChangeDetectorRef) {}

  // ------ NÚMEROS FLOTANTES ------
  readonly flotantes = signal<Flotante[]>([]);
  private idFlotante = 0;

  mumero_conta:number = 0;
  x2:boolean = false;
  available_upgrades: string[] = []; // item from JSON
  enable_upgrades: string[] = []; // bought items
  extraClicks: number = 0;
  cantidadReforPic: number = 0;
  cantidadCarretillas: number = 0;
  private intervalId: any = null;

  cantidadReforTaladro: number = 0;
  cantidadHorno: number = 0;

  // Varibles horno
  num_lingotes: number = 0;

  HornoMejorado: number = 0;

  // ------ VISTAS ------
  vistaActual: string = 'mina';     // mina, cohete o gasolinera

  // ------ COHETE ------
  num_chatarra: number = 0;
  get progresoCohete(): number {
    const maxChatarra = 1000; // límite provisional
    const porcentaje = (this.num_chatarra / maxChatarra) * 100;
    return Math.min(Math.floor(porcentaje), 100); // nunca pasa de 100
}

cantidadHerramienta: number = 0;
extraClicksCohete: number = 0;

cantidadBrazoRobotico: number = 0;
private intervalIdBrazo: any = null;

cantidadHerraAhorradora: number = 0;


  // ------ GASOLINERA ------

  clicksCV: number = 0;
  precioGasolina: number = 3; // Precio Provisional
  clicksGasolina: number = 0;

get progresoGasolina(): number {
    const maxGasolina = 2000; // límite provisional
    const porcentaje = (this.clicksGasolina / maxGasolina) * 100;
    return Math.min(Math.floor(porcentaje), 100); // nunca pasa de 100
}

  curriculumMejor: number = 0;
  extraClicksCV: number = 0;

  experienciaLaboral: number = 0;

  ayudaGobiero: number = 0;

  bombaCombustible: number = 0;

  
  async MostratMensaje(txt:string) {
    const toast = await this.toastController.create({
      message: txt,
      duration: 1500,
      position: 'top',
    });

    await toast.present();
  }

  ngOnInit() {
    this.mumero_conta = Number(localStorage.getItem('numCont')) || 0;

    
    this.extraClicks = Number(localStorage.getItem("extraClicks")) || 0;

    // Reforzar Pico
    this.cantidadReforPic = Number(localStorage.getItem("cantidadReforPic")) || 0;

    // Carretilla de hierro
    this.cantidadCarretillas = Number(localStorage.getItem("carretillas")) || 0;
    if (this.cantidadCarretillas > 0){
    this.iniciarCarretillaHierro();
    }

    // Taladro industrial
    this.cantidadReforTaladro = Number(localStorage.getItem("cantidadReforTaladro")) || 0;

    // Horno
    this.cantidadHorno = Number(localStorage.getItem("horno")) || 0;
    this.num_lingotes = Number(localStorage.getItem("lingotes")) || 0; 

    this.HornoMejorado = Number(localStorage.getItem("HornoMejorado")) || 0;

    // --------- Vistas ---------
    this.vistaActual = localStorage.getItem("vista") || 'mina';

    // --------- Cohete ---------
    this.num_chatarra = Number(localStorage.getItem("chatarra")) || 0;

    // Herramienta
    this.cantidadHerramienta = Number(localStorage.getItem('cantidadHerramienta')) || 0;
    this.extraClicksCohete = Number(localStorage.getItem('extraClicksCohete')) || 0;

    // Brazo Robotico
    this.cantidadBrazoRobotico = Number(localStorage.getItem("cantidadBrazoRobotico")) || 0;
    if (this.cantidadBrazoRobotico > 0){
    this.iniciarBrazoRobotico();
    }

    // Herramienta Ahorradora
    this.cantidadHerraAhorradora = Number(localStorage.getItem('cantidadHerraAhorradora')) || 0;

    // --------- Gasolinera ---------

    this.clicksCV = Number(localStorage.getItem('clicksCV')) || 0;
    this.clicksGasolina = Number(localStorage.getItem('clicksGasolina')) || 0;

    // Curriculum Mejorado

    this.curriculumMejor = Number(localStorage.getItem('curriculumMejor')) || 0;
    this.extraClicksCV = Number(localStorage.getItem('extraClicksCV')) || 0;

    // Ayuda del Goierno

    this.ayudaGobiero = Number(localStorage.getItem('ayudaGobiero')) || 0;
    this.precioGasolina = Number(localStorage.getItem('precioGasolina')) || 3;

    // Bomba Combustible

    this.bombaCombustible = Number(localStorage.getItem('bombaCombustible')) || 0;
  }

  async openShop(moneda: string = 'hierro') {
    const modal = await this.modalCtrl.create({
      component: ShopComponent,
      componentProps: { moneda: moneda },
    });
    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role !== 'upgrade' || !data) {
      return;
    }

    // ------ contra qué saldo comprobamos ------
  let saldo = this.mumero_conta;
  if (moneda === 'chatarra') saldo = this.num_chatarra;
  if (moneda === 'dinero')   saldo = this.clicksCV;

  if (data.price <= saldo) {


    // ---------- MEJORAS DE HIERRO ----------
    if (data.name == "Reforzar Pico"){
      if (this.cantidadReforPic <= 3){
        this.cantidadReforPic++
        localStorage.setItem("cantidadReforPic", String(this.cantidadReforPic));
        this.extraClicks++;
        localStorage.setItem("extraClicks", String(this.extraClicks));
        this.restarClicks(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya has alcanzado el nivel máximo de esta mejora')
      }

    } else if (data.name == "Carretilla Para Hierro"){
      if(this.cantidadCarretillas < 1){
        this.cantidadCarretillas++
        localStorage.setItem("carretillas", String(this.cantidadCarretillas));
        this.restarClicks(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
        this.iniciarCarretillaHierro();
      } else {
        this.MostratMensaje('Ya lo tienes')
      }

    } else if (data.name == "Taladro industrial"){
      if (this.cantidadReforTaladro <= 3){
        this.cantidadReforTaladro++
        localStorage.setItem("cantidadReforTaladro", String(this.cantidadReforTaladro));
        this.extraClicks = this.extraClicks + 4;
        localStorage.setItem("extraClicks", String(this.extraClicks));
        this.restarClicks(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya has alcanzado el nivel máximo de esta mejora')
      }

    } else if (data.name == "Horno de fundición"){
      if (this.cantidadHorno < 1){
        this.cantidadHorno++
        localStorage.setItem("horno", String(this.cantidadHorno));
        this.restarClicks(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya lo tienes')
      }

      } else if (data.name == "Horno Mejorado"){
      if (this.HornoMejorado < 1){
        this.HornoMejorado++
        localStorage.setItem('HornoMejorado', String(this.HornoMejorado));
        this.restarClicks(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya lo tienes')
      }

    // ---------- MEJORAS DE CHATARRA ----------

    } else if (data.name == "Herramientas"){

        if (this.cantidadHerramienta <= 3){
        this.cantidadHerramienta++
        localStorage.setItem("cantidadHerramienta", String(this.cantidadHerramienta));
        this.extraClicksCohete++;
        localStorage.setItem("extraClicksCohete", String(this.extraClicksCohete));
        this.restarClicksChatarra(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya has alcanzado el nivel máximo de esta mejora')
      }

    } else if (data.name == "Brazo robótico"){

      if(this.cantidadBrazoRobotico < 1){
        this.cantidadBrazoRobotico++
        localStorage.setItem("cantidadBrazoRobotico", String(this.cantidadBrazoRobotico));
        this.restarClicksChatarra(data.price);
        this.iniciarBrazoRobotico();
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya lo tienes')
      }

    } else if (data.name == "Herramienta Ahorradora"){
      if(this.cantidadHerraAhorradora < 1){
        this.cantidadHerraAhorradora++;
        localStorage.setItem("cantidadHerraAhorradora", String(this.cantidadHerraAhorradora));
        this.restarClicksChatarra(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      }

      // ---------- MEJORAS DE GASOLINERA ----------
    } else if (data.name == "Currículum mejorado"){
      if (this.curriculumMejor <= 3){
        this.curriculumMejor++
        localStorage.setItem("curriculumMejor", String(this.curriculumMejor));
        this.extraClicksCV++;
        localStorage.setItem("extraClicksCV", String(this.extraClicksCV));
        this.restarClicksGasolinera(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya has alcanzado el nivel máximo de esta mejora')
      }
      

    } else if (data.name == "Experiencia laboral"){
      if (this.experienciaLaboral <= 3){
        this.experienciaLaboral++
        localStorage.setItem("experienciaLaboral", String(this.experienciaLaboral));
        this.extraClicksCV++;
        localStorage.setItem("extraClicksCV", String(this.extraClicksCV));
        this.restarClicksGasolinera(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya has alcanzado el nivel máximo de esta mejora')
      }

    } else if (data.name == "Ayuda del Gobierno"){
      // ---- TU EFECTO AQUÍ ----
      if (this.ayudaGobiero == 0) {
        this.ayudaGobiero++
        localStorage.setItem("ayudaGobiero", String(this.ayudaGobiero));
        this.precioGasolina = 1;
        localStorage.setItem("precioGasolina", String(this.precioGasolina));
        this.restarClicksGasolinera(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya has alcanzado el nivel máximo de esta mejora')
      }
      

    } else if (data.name == "Bomba de combustible avanzada"){
      if (this.bombaCombustible == 0){
        this.bombaCombustible++
        localStorage.setItem("bombaCombustible", String(this.bombaCombustible));
        this.restarClicksGasolinera(data.price);
        // ----- SONIDO DE COMPRA -----
    this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
      } else {
        this.MostratMensaje('Ya has alcanzado el nivel máximo de esta mejora')
      }
      
    }

    // ----- SONIDO DE COMPRA -----
    // this.reproducirSonido('../../assets/img/SonidoApplePay.mp3', 20);
  } else {
    console.log("estas pobre");
  }

  setTimeout(() => window.location.reload(), 1000);
}

  contador(evento?: MouseEvent){
  this.mumero_conta = this.mumero_conta + 1 + this.extraClicks;
  this.updateLocalStorageClicks();

  if (evento) {
    this.crearFlotante(evento.clientX, evento.clientY, '+' + (1 + this.extraClicks));
  }
}

  restarClicks(numCont: number) {
    this.mumero_conta = this.mumero_conta - numCont;
    this.updateLocalStorageClicks();
  }

  updateLocalStorageClicks(){
    localStorage.setItem("numCont", String(this.mumero_conta));
  }

  iniciarCarretillaHierro() {
  // if (this.intervalId !== null) return; // ya hay un intervalo corriendo
  // if (this.cantidadCarretillas <= 0) return; // no hay nada que producir

  this.intervalId = setInterval(() => {
    this.mumero_conta++
    this.updateLocalStorageClicks();
    this.cdr.detectChanges();
  }, 1000);
}

// funciones horno

restarClicksHorno() {
    this.mumero_conta = this.mumero_conta - 5;
    this.updateLocalStorageClicks();
  }


quemarHierro(evento?: MouseEvent){
  if (this.cantidadHorno < 1) { 
    this.MostratMensaje('Compra el Horno de fundición en la tienda');
   }

  if(this.mumero_conta >= 5){
    let ganancia = 1;
    if (this.HornoMejorado === 1) {
      ganancia = 5;
    }
    this.num_lingotes = this.num_lingotes + ganancia;
    localStorage.setItem("lingotes", String(this.num_lingotes));
    this.restarClicksHorno();

    if (evento) {                                            // ✅ NUEVO
      this.crearFlotante(evento.clientX, evento.clientY, '+' + ganancia + ' lingote', '-5 hierro');
    }
  }
}

// ----------------------- FUNCIONES DE VISTA -----------------------
irACohete() {
  this.vistaActual = 'cohete';
  localStorage.setItem("vista", this.vistaActual);
}

irAMina() {
  this.vistaActual = 'mina';
  localStorage.setItem("vista", this.vistaActual);
}

irAGasolinera() {
  this.vistaActual = 'gasolinera';
  localStorage.setItem("vista", this.vistaActual);
}
// ------------------------------------------------------------------

// Fnciones Cohete

// FUNCIÓN TEMPORAL PARA VER
construirCohete(evento?: MouseEvent) {
  const precioLingotes = 10;
  const precioLingotesReducido = 5;

  if (this.cantidadHerraAhorradora === 0) {
    if (this.num_lingotes >= precioLingotes) {
      this.num_chatarra = this.num_chatarra + 1 + this.extraClicksCohete;
      localStorage.setItem("chatarra", String(this.num_chatarra));
      this.num_lingotes = this.num_lingotes - precioLingotes;
      localStorage.setItem("lingotes", String(this.num_lingotes));
      if (evento) {                                            // ✅ NUEVO
        this.crearFlotante(evento.clientX, evento.clientY, '+' + (1 + this.extraClicksCohete));
      }
    } else {
      this.MostratMensaje('Te faltan lingotes, ve a minar');
    }
  } else if (this.cantidadHerraAhorradora >= 1) {
      if (this.num_lingotes >= precioLingotesReducido) {
      this.num_chatarra = this.num_chatarra + 1 + this.extraClicksCohete;
      localStorage.setItem("chatarra", String(this.num_chatarra));
      this.num_lingotes = this.num_lingotes - precioLingotesReducido;
      localStorage.setItem("lingotes", String(this.num_lingotes));
      if (evento) {                                            // ✅ NUEVO
        this.crearFlotante(evento.clientX, evento.clientY, '+' + (1 + this.extraClicksCohete));
      }
    } else {
      this.MostratMensaje('Te faltan lingotes, ve a minar');
    }
    }
}


restarClicksChatarra(numContCha: number){
    this.num_chatarra = this.num_chatarra - numContCha
    this.updateLocalStorageChatarra();
  }

  updateLocalStorageChatarra(){
  localStorage.setItem("chatarra", String(this.num_chatarra));
}

iniciarBrazoRobotico() {

  this.intervalIdBrazo = setInterval(() => {
    this.num_chatarra++
    this.updateLocalStorageChatarra();
    this.cdr.detectChanges();
  }, 1000);
}


// ------------------------------------------------------------------

// Funciones Gasolinera

// le das a CV para conseguir dinero Y de ahí compras gasolina
chambear(evento?: MouseEvent){
  this.clicksCV = this.clicksCV + 1 + this.extraClicksCV;
  this.updateLocalStorageClicksGasolinera();

  if (evento) {
    this.crearFlotante(evento.clientX, evento.clientY, '+' + (1 + this.extraClicksCV));
  }
}

pagarGasolina(evento?: MouseEvent){
  if (this.clicksCV >= this.precioGasolina) {
    if (this.bombaCombustible == 1) { 
      this.clicksGasolina = this.clicksGasolina + 3
      this.clicksCV = this.clicksCV - this.precioGasolina;
      this.updateLocalStorageClicksGasolinera();

      if (evento) {
        this.crearFlotante(evento.clientX, evento.clientY,
                           '+3 gasolina', '-' + this.precioGasolina + ' dinero');
      }
    }else {
    this.clicksGasolina++
    this.clicksCV = this.clicksCV - this.precioGasolina;
    this.updateLocalStorageClicksGasolinera();

    if (evento) {
      this.crearFlotante(evento.clientX, evento.clientY,
                         '+1 gasolina', '-' + this.precioGasolina + ' dinero');
    }
  }

  // ===== VÍDEO FINAL: gasolina al MÁXIMO (2000) =====
    if (this.clicksGasolina >= 2000 && this.vistaActual !== 'final') {
      this.vistaActual = 'final';
      localStorage.setItem("vista", this.vistaActual);
    }
    
  }
}

restarClicksGasolinera(dinero: number) {
    this.clicksCV = this.clicksCV - dinero;
    this.updateLocalStorageClicksGasolinera();
  }

  updateLocalStorageClicksGasolinera(){
    localStorage.setItem("clicksCV", String(this.clicksCV));
    localStorage.setItem("clicksGasolina", String(this.clicksGasolina));
  }



// -------------------------- MOSTRAR DINERO -----------------------------

MostrarMoneda(valor: number): string {
    if (valor < 1e3) {
      return valor.toLocaleString(); 
    } else if (valor >= 1e3 && valor < 1e6) {
      return Math.floor(valor / 1e2) / 10 + 'k';
    } else if (valor >= 1e6 && valor < 1e9) {
      return Math.floor(valor / 1e5) / 10 + 'M';
    } else if (valor >= 1e9 && valor < 1e12) {
      return Math.floor(valor / 1e8) / 10 + 'B';
    } else if (valor >= 1e12 && valor < 1e15) {
      return Math.floor(valor / 1e11) / 10 + 'T';
    } else if (valor >= 1e15 && valor < 1e18) {
      return Math.floor(valor / 1e14) / 10 + 'Qa';
    } else if (valor >= 1e18 && valor < 1e21) {
      return Math.floor(valor / 1e17) / 10 + 'Qi';
    } else if (valor >= 1e21 && valor < 1e24) {
      return Math.floor(valor / 1e20) / 10 + 'Sx';
    } else if (valor >= 1e24 && valor < 1e27) {
      return Math.floor(valor / 1e23) / 10 + 'Sp';
    } else if (valor >= 1e27 && valor < 1e30) {
      return Math.floor(valor / 1e26) / 10 + 'Oc';
    } else if (valor >= 1e30 && valor < 1e33) {
      return Math.floor(valor / 1e29) / 10 + 'No';
    } else {
      return Math.floor(valor / 1e32) / 10 + 'Dc';
    }
  }


// ------------- NUMERITOS VOLANTES -------------

crearFlotante(x: number, y: number, texto: string, texto2: string = '') {
    const id = ++this.idFlotante;

    // Desvía un poco el número para que no salga siempre en el mismo píxel
    const desvio = (max: number) => Math.round(Math.random() * max - max / 2);

    this.flotantes.update((lista) => [
      ...lista,
      { id, x: x + desvio(24), y: y + desvio(12), monedas: texto, dano: texto2 },
    ]);

    // Desaparece a los 0,9 segundos
    setTimeout(() => {
      this.flotantes.update((lista) => lista.filter((f) => f.id !== id));
    }, 900);
  }


// ------------- REPRODUCIR SONIDO -------------
  // reproducirSonido(ruta: string) {
  //   const audio = new Audio(ruta);
  //   audio.play();
  // }

  // ===== SONIDO CON VOLUMEN =====
  async reproducirSonido(ruta: string, volumen: number = 1) {
    const ctx: any = new (window.AudioContext || (window as any).webkitAudioContext)();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const respuesta = await fetch(ruta);
    const datos = await respuesta.arrayBuffer();
    const buffer = await ctx.decodeAudioData(datos);

    const fuente = ctx.createBufferSource();
    fuente.buffer = buffer;                     // UN solo sonido

    const ganancia = ctx.createGain();
    ganancia.gain.value = volumen;              // 1 = normal, 3 = TRIPLE de fuerte

    fuente.connect(ganancia);
    ganancia.connect(ctx.destination);
    fuente.start();                             // suena una vez, bien sincronizado
  }
}



