import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration
const supabaseUrl = 'https://vmrhiqghvrgwvhyrerdp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtcmhpcWdodnJnd3ZoeXJlcmRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTk1NDYsImV4cCI6MjA3Mzg3NTU0Nn0.-HG6LWImMYm92vNVI_rj46yI6kxy0kySynB5asqBC20';

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database table types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          phone_number: string;
          created_at: string;
          updated_at: string;
          full_name: string | null;
          avatar_url: string | null;
          preferences: any | null;
        };
        Insert: {
          id: string;
          phone_number: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: any | null;
        };
        Update: {
          id?: string;
          phone_number?: string;
          created_at?: string;
          updated_at?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferences?: any | null;
        };
      };
      interview_sessions: {
        Row: {
          id: string;
          user_id: string;
          interview_type: string;
          role: string;
          duration: number;
          score: number | null;
          transcript: any;
          feedback: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          interview_type: string;
          role: string;
          duration: number;
          score?: number | null;
          transcript: any;
          feedback?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          interview_type?: string;
          role?: string;
          duration?: number;
          score?: number | null;
          transcript?: any;
          feedback?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Helper functions for authentication
export const authHelpers = {
  // Send OTP to phone number
  async sendOTP(phoneNumber: string) {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phoneNumber,
    });
    return { data, error };
  },

  // Verify OTP
  async verifyOTP(phoneNumber: string, token: string) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: phoneNumber,
      token,
      type: 'sms',
    });
    return { data, error };
  },

  // Get current session
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },
};
