// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { SupabaseService } from './supabase.service';

const supabase: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseKey);

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private supabase: SupabaseService) {}
  async signUp(email: string, password: string) {
    return await supabase.auth.signUp({ email, password });
  }

  async signIn(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  }
  

  async getUser() {
    return supabase.auth.getUser();
  }

  getClient() {
    return supabase;
  }

  login(email: string, password: string) {
    return this.supabase.signIn(email, password);
  }

  register(email: string, password: string) {
    return this.supabase.signUp(email, password);
  }

  logout() {
    return this.supabase.signOut();
  }

  getSession() {
    return this.supabase.getSession();
  }
}
