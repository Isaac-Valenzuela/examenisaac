import { Component, OnInit } from '@angular/core';
import { getFirestore, collection, query, orderBy, getDocs } from 'firebase/firestore';
import { environment } from 'src/environments/environment';  // si necesitas inicializar Firebase
import { initializeApp } from 'firebase/app';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

const app = initializeApp(environment.firebaseConfig);
const firestore = getFirestore(app);

@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, HttpClientModule],
})
export class FeedPage implements OnInit {
  noticias: any[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  async ngOnInit() {
    await this.loadNoticias();
  }

  async loadNoticias() {
    try {
      const q = query(collection(firestore, 'noticias'), orderBy('fecha', 'desc'));
      const querySnapshot = await getDocs(q);
      this.noticias = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Noticias cargadas:', this.noticias);
    } catch (error) {
      console.error('Error al cargar noticias:', error);
    }
  }

  async cerrarSesion() {
    await this.auth.logout();
    this.router.navigate(['/login']); // Ajusta esta ruta según tu configuración
  }
}
