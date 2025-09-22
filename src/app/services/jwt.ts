import { Injectable } from '@angular/core';
import { JwtPayload, UserRole } from '../models/user.model';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class JwtService {
  private readonly ACCESS_TOKEN_KEY = 'electrostore_access_token';
  private readonly REFRESH_TOKEN_KEY = 'electrostore_refresh_token';
  private readonly TOKEN_EXPIRY_KEY = 'electrostore_token_expiry';

  constructor() {
    console.log('🔐 JwtService inicializado');
  }

  /**
   * Decodifica un JWT sin verificar la firma (solo para uso local)
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded as JwtPayload;
    } catch (error) {
      console.error('❌ Error decodificando token:', error);
      return null;
    }
  }

  /**
   * Verifica si un token ha expirado
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Obtiene el tiempo restante del token en segundos
   */
  getTokenTimeRemaining(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload) return 0;

    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, payload.exp - currentTime);
  }

  /**
   * Guarda el access token de forma segura
   */
  async saveAccessToken(token: string): Promise<void> {
    try {
      await Preferences.set({
        key: this.ACCESS_TOKEN_KEY,
        value: token
      });
      
      // Guardar tiempo de expiración
      const payload = this.decodeToken(token);
      if (payload) {
        await Preferences.set({
          key: this.TOKEN_EXPIRY_KEY,
          value: payload.exp.toString()
        });
      }
      
      console.log('💾 Access token guardado');
    } catch (error) {
      console.error('❌ Error guardando access token:', error);
    }
  }

  /**
   * Guarda el refresh token de forma segura
   */
  async saveRefreshToken(token: string): Promise<void> {
    try {
      await Preferences.set({
        key: this.REFRESH_TOKEN_KEY,
        value: token
      });
      console.log('💾 Refresh token guardado');
    } catch (error) {
      console.error('❌ Error guardando refresh token:', error);
    }
  }

  /**
   * Obtiene el access token almacenado
   */
  async getAccessToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.ACCESS_TOKEN_KEY });
      return value;
    } catch (error) {
      console.error('❌ Error obteniendo access token:', error);
      return null;
    }
  }

  /**
   * Obtiene el refresh token almacenado
   */
  async getRefreshToken(): Promise<string | null> {
    try {
      const { value } = await Preferences.get({ key: this.REFRESH_TOKEN_KEY });
      return value;
    } catch (error) {
      console.error('❌ Error obteniendo refresh token:', error);
      return null;
    }
  }

  /**
   * Verifica si hay tokens válidos almacenados
   */
  async hasValidTokens(): Promise<boolean> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) return false;

    return !this.isTokenExpired(accessToken);
  }

  /**
   * Limpia todos los tokens almacenados
   */
  async clearTokens(): Promise<void> {
    try {
      await Promise.all([
        Preferences.remove({ key: this.ACCESS_TOKEN_KEY }),
        Preferences.remove({ key: this.REFRESH_TOKEN_KEY }),
        Preferences.remove({ key: this.TOKEN_EXPIRY_KEY })
      ]);
      console.log('🗑️ Tokens limpiados');
    } catch (error) {
      console.error('❌ Error limpiando tokens:', error);
    }
  }

  /**
   * Obtiene información del usuario desde el token
   */
  async getCurrentUserFromToken(): Promise<JwtPayload | null> {
    const token = await this.getAccessToken();
    if (!token) return null;

    return this.decodeToken(token);
  }

  /**
   * Genera un token mock para desarrollo (simula un JWT real)
   */
  generateMockToken(userId: string, email: string, nombre: string, rol: UserRole): string {
    const header = {
      "alg": "HS256",
      "typ": "JWT"
    };

    const payload: JwtPayload = {
      sub: userId,
      email: email,
      nombre: nombre,
      rol: rol,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = 'mock_signature_for_development';

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }
}