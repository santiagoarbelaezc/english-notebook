// Token Service - Gestiona almacenamiento de tokens
class TokenService {
  private readonly accessTokenKey = 'accessToken';
  private readonly refreshTokenKey = 'refreshToken';

  // Validar si un token JWT tiene estructura básica
  private isValidTokenFormat(token: string): boolean {
    try {
      // Verificar que sea un JWT válido (tiene 3 partes separadas por .)
      const parts = token.split('.');
      if (parts.length !== 3) return false;

      // Intentar decodificar el payload (segunda parte)
      const payload = JSON.parse(atob(parts[1]));

      // Verificar que tenga campos básicos
      return payload && typeof payload === 'object' && payload.exp;
    } catch (error) {
      console.warn('Token con formato inválido:', error);
      return false;
    }
  }

  // Verificar si un token no ha expirado
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Si no se puede parsear, considerarlo expirado
    }
  }

  // Limpiar tokens corruptos automáticamente (sin recursión)
  private cleanCorruptedTokens(): void {
    const accessToken = localStorage.getItem(this.accessTokenKey);
    const refreshToken = localStorage.getItem(this.refreshTokenKey);

    let hasCorruptedTokens = false;

    // Verificar access token
    if (accessToken && !this.isValidTokenFormat(accessToken)) {
      console.warn('🧹 Eliminando access token corrupto');
      localStorage.removeItem(this.accessTokenKey);
      hasCorruptedTokens = true;
    }

    // Verificar refresh token
    if (refreshToken && !this.isValidTokenFormat(refreshToken)) {
      console.warn('🧹 Eliminando refresh token corrupto');
      localStorage.removeItem(this.refreshTokenKey);
      hasCorruptedTokens = true;
    }

    if (hasCorruptedTokens) {
      console.log('✅ Tokens corruptos eliminados automáticamente');
    }
  }

  // Obtener token crudo del localStorage (sin validación)
  private getRawAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }

  // Obtener refresh token crudo del localStorage (sin validación)
  private getRawRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // Guardar tokens
  saveTokens(accessToken: string, refreshToken?: string): void {
    // Validar tokens antes de guardar
    if (!this.isValidTokenFormat(accessToken)) {
      console.error('❌ Intentando guardar access token con formato inválido');
      return;
    }

    if (refreshToken && !this.isValidTokenFormat(refreshToken)) {
      console.error('❌ Intentando guardar refresh token con formato inválido');
      return;
    }

    localStorage.setItem(this.accessTokenKey, accessToken);
    if (refreshToken) {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    }
    console.log('💾 Tokens guardados correctamente');
  }

  // Obtener access token (con validación)
  getAccessToken(): string | null {
    this.cleanCorruptedTokens(); // Limpiar tokens corruptos automáticamente

    const token = this.getRawAccessToken();
    if (!token) return null;

    if (!this.isValidTokenFormat(token)) {
      console.warn('⚠️ Access token inválido encontrado, eliminando...');
      this.clearTokens();
      return null;
    }

    if (this.isTokenExpired(token)) {
      console.warn('⚠️ Access token expirado, eliminando...');
      this.clearTokens();
      return null;
    }

    return token;
  }

  // Obtener refresh token (con validación)
  getRefreshToken(): string | null {
    this.cleanCorruptedTokens(); // Limpiar tokens corruptos automáticamente

    const token = this.getRawRefreshToken();
    if (!token) return null;

    if (!this.isValidTokenFormat(token)) {
      console.warn('⚠️ Refresh token inválido encontrado, eliminando...');
      localStorage.removeItem(this.refreshTokenKey);
      return null;
    }

    return token;
  }

  // Limpiar tokens
  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    console.log('🗑️ Tokens eliminados');
  }

  // Verificar si hay tokens válidos
  hasTokens(): boolean {
    // Usar método raw para evitar recursión infinita
    const token = this.getRawAccessToken();
    return !!token && this.isValidTokenFormat(token) && !this.isTokenExpired(token);
  }

  // Forzar limpieza de todos los tokens (para debugging)
  forceCleanAllTokens(): void {
    console.log('🧹 Forzando limpieza de todos los tokens...');
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    console.log('✅ Todos los tokens eliminados');
  }

  // Verificar salud del servicio de tokens (para debugging)
  healthCheck(): { status: string; accessToken: boolean; refreshToken: boolean; corrupted: boolean } {
    const accessToken = this.getRawAccessToken();
    const refreshToken = this.getRawRefreshToken();

    const accessValid = accessToken ? this.isValidTokenFormat(accessToken) && !this.isTokenExpired(accessToken) : false;
    const refreshValid = refreshToken ? this.isValidTokenFormat(refreshToken) : false;

    return {
      status: 'healthy',
      accessToken: !!accessToken && accessValid,
      refreshToken: !!refreshToken && refreshValid,
      corrupted: !!(accessToken && !this.isValidTokenFormat(accessToken)) || !!(refreshToken && !this.isValidTokenFormat(refreshToken))
    };
  }
}

export const tokenService = new TokenService();
