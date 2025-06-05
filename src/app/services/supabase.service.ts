import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
  );

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey
    );
  }

  signUp(email: string, password: string) {
    return this.supabase.auth.signUp({ email, password });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({ email, password });
  }

  getUser() {
    return this.supabase.auth.getUser();
  }

  signOut() {
    return this.supabase.auth.signOut();
  }
  getSession() {
    return this.supabase.auth.getSession();
  }
  getClient(): SupabaseClient {
    return this.supabase;
  }
}