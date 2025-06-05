// src/app/pages/perfil/perfil.page.ts (ejemplo)
import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { createClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';

const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  imports: [CommonModule, FormsModule, IonicModule]
})
export class PerfilPage {
  imageUrl: string | null = null;
  fotoBlob: Blob | null = null;
  userId = ''; // Aquí debes tener el ID del usuario logueado

  async capturarFoto() {
    const photo = await Camera.getPhoto({
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      quality: 90,
    });
    this.imageUrl = photo.dataUrl!;
    // Convertir dataUrl a Blob para subir
    this.fotoBlob = this.dataUrlToBlob(this.imageUrl);
  }

  dataUrlToBlob(dataUrl: string) {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async subirFotoPerfil() {
    if (!this.fotoBlob || !this.userId) {
      alert('No hay foto o usuario');
      return;
    }
    const fileName = `profile_${this.userId}.jpg`;
    const { error } = await supabase.storage
      .from('archivos')
      .upload(fileName, this.fotoBlob, {
        contentType: 'image/jpeg',
        upsert: true,
      });
    if (error) {
      console.error('Error subiendo foto perfil:', error);
      return;
    }
    const url = `${environment.supabaseUrl}/storage/v1/object/public/archivos/${fileName}`;
    // Guardar URL en tabla users
    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_url: url })
      .eq('id', this.userId);
    if (updateError) {
      console.error('Error actualizando perfil:', updateError);
      return;
    }
    alert('Foto de perfil actualizada');
  }
}
