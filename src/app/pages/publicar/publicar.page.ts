// src/app/pages/publicar/publicar.page.ts
import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { AuthService } from 'src/app/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
const firestore = getFirestore();

@Component({
  selector: 'app-publicar',
  templateUrl: './publicar.page.html',
  styleUrls: ['./publicar.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, HttpClientModule],
})
export class PublicarPage {
  titulo = '';
  contenido = '';
  imageUrl: string | null = null;
  fotoBlob: Blob | null = null;
  ubicacion: string | null = null;
  apiData: string | null = null;
  mostrarBuscador = false;
  terminoBusqueda = '';
  resultados: any[] = [];

  constructor(private auth: AuthService, private http: HttpClient, private router: Router) {}

  async capturarFoto() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 90,
    });

    this.imageUrl = photo.dataUrl!;
    this.fotoBlob = this.dataURLtoBlob(photo.dataUrl!);
  }

  dataURLtoBlob(dataUrl: string): Blob {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  async obtenerUbicacion() {
    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location === 'denied') {
        const permRequest = await Geolocation.requestPermissions();
        if (permRequest.location === 'denied') {
          alert('Permiso de ubicación denegado');
          return;
        }
      }
      const position = await Geolocation.getCurrentPosition();
      this.ubicacion = `Lat: ${position.coords.latitude}, Lng: ${position.coords.longitude}`;
    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);
      alert('No se pudo obtener la ubicación. Intenta de nuevo.');
    }
  }

  consultarApi() {
    this.mostrarBuscador = true;
    this.resultados = [];
    this.terminoBusqueda = '';
  }

  buscarPersonaje() {
    if (!this.terminoBusqueda.trim()) return;

    this.http
      .get(`https://rickandmortyapi.com/api/character/?name=${this.terminoBusqueda}`)
      .subscribe(
        (res: any) => {
          this.resultados = res.results || [];
        },
        () => {
          this.resultados = [];
        }
      );
  }

  seleccionarPersonaje(personaje: any) {
    this.apiData = personaje.name;
    this.mostrarBuscador = false;
  }

  async publicar() {
    try {
      // Obtener usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        console.error('Usuario no logueado');
        return;
      }

      // Subir imagen a bucket "fotos"
      let fotoUrl = '';
      if (this.fotoBlob) {
        const fileName = `${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('fotos')
          .upload(fileName, this.fotoBlob, {
            contentType: 'image/jpeg',
            upsert: false,
          });

        if (uploadError) {
          console.error('Error al subir foto:', uploadError.message);
          return;
        }

        // Construir URL pública
        fotoUrl = `${environment.supabaseUrl}/storage/v1/object/public/fotos/${fileName}`;
      }

      // Guardar en Firebase Firestore
      await addDoc(collection(firestore, 'noticias'), {
        email: user.email,
        titulo: this.titulo,
        descripcion: this.contenido,
        ubicacion: this.ubicacion || '',
        apiInfo: this.apiData || '',
        fotoUrl: fotoUrl,
        fecha: new Date(),
      });

      console.log('✅ Noticia publicada correctamente');

      // Limpiar campos
      this.titulo = '';
      this.contenido = '';
      this.ubicacion = '';
      this.apiData = '';
      this.imageUrl = '';
      this.fotoBlob = null;
    } catch (error) {
      console.error('❌ Error al publicar noticia:', error);
    }
  }

  volverFeed() {
  this.router.navigate(['/feed']);
}
}
