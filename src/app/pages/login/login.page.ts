import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  standalone: true,
  selector: 'app-login',
  template: `
  <ion-header><ion-toolbar><ion-title>Login</ion-title></ion-toolbar></ion-header>
  <ion-content class="ion-padding">
    <ion-input [(ngModel)]="email" placeholder="Email"></ion-input>
    <ion-input [(ngModel)]="password" type="password" placeholder="Password"></ion-input>
    <ion-button expand="full" (click)="login()">Iniciar sesión</ion-button>
    <ion-button fill="clear" (click)="nav.navigateForward('/register')">Registrarse</ion-button>
  </ion-content>
  `,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class LoginPage {
  email = '';
  password = '';

  constructor(private supabase: SupabaseService, public nav: NavController) {}

  async login() {
    const { data, error } = await this.supabase.signIn(this.email, this.password);
    if (!error) this.nav.navigateRoot('/feed');
    else alert('Error: ' + error.message);
  }

  
}