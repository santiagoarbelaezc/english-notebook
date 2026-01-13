// Token Service - Gestiona almacenamiento de tokens
class TokenService {
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';

  // Guardar tokens
  saveTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
  }

  // Obtener access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  // Obtener refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Limpiar tokens
  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  // Verificar si hay tokens válidos
  hasTokens(): boolean {
    return !!this.getAccessToken();
  }
}

export const tokenService = new TokenService();
