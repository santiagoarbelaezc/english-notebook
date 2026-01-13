# Error de CORS - Solución

## El Problema

Estás obteniendo este error:
```
Access to XMLHttpRequest at 'http://localhost:3000/api/auth/login' from origin 'http://localhost:5175' 
has been blocked by CORS policy
```

## ¿Qué significa?

- **Frontend** corre en: `http://localhost:5173` (ahora configurado)
- **Backend** corre en: `http://localhost:3000`
- El backend rechaza requests de origen diferente

## Solución: Actualizar tu Backend

En tu backend (Node.js), necesitas actualizar la configuración de CORS para aceptar requests desde tu frontend.

### Opción 1: CORS permisivo (Desarrollo)

```javascript
// En tu archivo principal del backend (app.js o index.js)
const cors = require('cors');

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Opción 2: CORS para producción

```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Luego en tu `.env` del backend:
```
CORS_ORIGIN=http://localhost:5173
```

## Configuración del Frontend

El frontend ya está configurado para:
- **Puerto fijo**: `http://localhost:5173`
- **URL Backend**: `http://localhost:3000/api` (definida en `.env`)

## Puertos utilizados

- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3000`

## Pasos a seguir

1. ✅ Actualiza tu backend con la configuración CORS arriba
2. ✅ Reinicia tu backend
3. ✅ Verifica que el frontend esté en `http://localhost:5173`
4. ✅ Intenta login nuevamente
