# Reglas del proyecto new_year

Página estática (GitHub Pages): `index.html` + `data.json`, sin backend.
Todo cambio debe respetar este checklist. Si algo no aplica, decirlo explícitamente en vez de saltearlo.

## 1. Privacidad (`privacidad.html`)
Mantener la política al día cada vez que cambie qué datos se tocan:
- Qué datos se recolectan de los usuarios y para qué.
- Si se usa IA: avisarlo siempre (para qué se usa y si procesa datos del usuario).
- A quién se envían los datos recolectados (Google Analytics, GitHub, X, WhatsApp…).
- Borrado: si un usuario pide borrar su información, se borra de verdad (máx. 30 días, también en Analytics) y se le confirma. Nunca dejar datos que se pidió borrar.
- Nada de testimonios ni reseñas falsas.
- Google Analytics se carga SOLO con consentimiento (aviso de cookies). Nada nuevo que envíe datos a terceros sin pedir permiso y sin agregarlo a la política.

## 2. Seguridad
- Validar todo input del usuario y todo lo que se lee de `localStorage` o `data.json` (tipo, rango, largo, valores permitidos).
- Todo texto que vaya a `innerHTML` pasa por `escapeHtml` (escapa también comillas).
- Usar `store.get/set/remove` en vez de `localStorage` directo (no rompe si está bloqueado).
- Mantener la Content-Security-Policy del `<head>`; si se agrega un recurso externo, sumarlo ahí y a la política de privacidad.
- Rate limiting, sesiones/tokens, rutas de API y CORS: hoy no aplican (no hay servidor ni login). Si algún día se agrega un backend, revisar los cuatro antes de publicar.

## 3. Errores, escalabilidad y pruebas
- Ningún error debe dejar la página en blanco: mostrar un aviso entendible al usuario y registrar el detalle en la consola.
- Pensar en escala: los datos van en `data.json` (no hardcodeados), y el código no debe asumir una cantidad fija de zonas o ciudades.
- **Siempre probar antes de publicar:** `npm test` (valida `data.json` y prueba la página en Chromium). Cada arreglo o función nueva suma su prueba en `tests/`. GitHub Actions corre las pruebas en cada push.
