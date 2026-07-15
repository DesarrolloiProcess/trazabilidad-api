# FarmaTrack — Prototipo funcional

**Entregable de presentación** · Frontend desplegado en producción, contra un backend real (mínimo, en memoria) con los mismos contratos del backend hexagonal definitivo.

**🔗 Demo en vivo:** **https://farmatrack-iprocess.vercel.app**
**🔗 API del demo:** https://farmatrack-demo-server.onrender.com (el servidor gratuito de Render "duerme" tras inactividad — el primer request puede tardar ~30s en despertar)

---

## 1. Resumen ejecutivo

FarmaTrack es el sistema de trazabilidad de entregas para una empresa de distribución farmacéutica con varios CEDIs a nivel nacional. Resuelve un problema muy concreto: hoy la facturación se emite *antes* del despacho, sin evidencia real de que el pedido llegó a su destino. FarmaTrack invierte ese orden — la entrega se confirma con firma, foto, cédula del receptor y geolocalización, **y solo entonces se habilita la facturación** — mientras el destinatario final puede seguir su pedido, ver la evidencia de su propia entrega, y consultarlo sin necesidad de crear una cuenta.

Este prototipo cubre 4 experiencias (Portal Web del CEDI/Administración, App CDI móvil de verificación, App del Conductor, Portal del Cliente), desplegadas públicamente y compartiendo datos en tiempo real entre dispositivos — no es una demo local aislada.

---

## 2. Máquina de estados (actualizada con el feedback de gerencia)

```
Creado ──(CEDI móvil verifica cantidades/contenido)──▶ Alistado
Alistado ──(ADMIN asigna conductor en Portal Web)────▶ Alistado + conductor asignado
Alistado ──(Conductor confirma "Recibir para transporte")──▶ En tránsito
En tránsito ──(Conductor captura firma/foto/receptor/geo)──▶ Entregado cliente  ──▶ Habilita facturación
En tránsito ──(Conductor marca no entregado + observación)──▶ No entregado
```

- **"Verificado" y "Alistado" se unificaron en un solo estado.** El brief original ya definía "Alistado" como "verificación en el CEDI" — separar ambos habría creado dos timestamps para el mismo evento sin un actor distinto entre ellos. La verificación desde el móvil CDI *es* lo que produce el estado Alistado.
- **La asignación de conductor se queda en el Portal Web, exclusiva de ADMIN.** Asignar requiere comparar todas las rutas/conductores a la vez (una tabla) — es una tarea de escritorio, no de "una pantalla, un objetivo" como el móvil. El perfil CDI se enfoca 100% en verificar contenido.
- **El login ahora redirige a 3 experiencias distintas según rol**: ADMIN → Portal Web (`/panel`), CEDI → App de verificación (`/cdi`, nueva), CONDUCTOR → App de entregas (`/conductor`, sin cambios).

---

## 3. Pantallas construidas

### Portal Web (exclusivo ADMIN)

**1. Inicio de sesión** — Público (previo a autenticación) · `POST /api/users/login`
![Inicio de sesión](screenshots/01-login.png)

**2. Panel operativo (dashboard)** — ADMIN · `GET /api/deliveries`, `GET /api/routes`
![Panel operativo](screenshots/02-panel-dashboard.png)

**3. Entregas — listado y filtros** — ADMIN · `GET /api/deliveries`
![Entregas](screenshots/03-panel-entregas.png)

**4. Importar planilla (TXT) — con selector de CEDI destino** — ADMIN · `POST /api/txt-import`
![Importar planilla](screenshots/04-panel-import-dialog.png)

Como el Portal Web ya es exclusivo de ADMIN (que no pertenece a un CEDI específico), el diálogo ahora pide explícitamente **a qué CEDI** pertenece la planilla — antes se inferría automáticamente del usuario que la subía.

**5. Importar planilla — éxito** — ADMIN · `POST /api/txt-import`
![Importar planilla éxito](screenshots/05-panel-import-success.png)

**6. Importar planilla — error (TXT mal formado)** — ADMIN · `POST /api/txt-import`
![Importar planilla error](screenshots/06-panel-import-error.png)

**7. Detalle de entrega — con badge de facturación** — ADMIN · `GET /api/deliveries/:id`
![Detalle con facturación](screenshots/20-panel-facturacion.png)

Cuando la entrega pasa a "Entregado", aparece automáticamente **"✅ Habilitado para facturación"** con el timestamp exacto — el sistema deja visible el momento en que ese pedido queda listo para facturarse, tal como pidió gerencia.

**8. Rutas — asignar conductor / cambiar estado** — ADMIN · `GET /api/routes`, `GET /api/users`, `PATCH /api/routes/:id/assign-driver`, `PATCH /api/routes/:id/status`
![Rutas](screenshots/08-panel-rutas.png)

**9. Centros de distribución** — ADMIN · `GET /api/distribution-centers`
![CEDIs](screenshots/09-panel-cedis.png)

### App CDI móvil (verificación) — nueva

**10. Planillas por verificar** — CEDI · `GET /api/cdi/pending-verification`
![Lista de verificación](screenshots/17-cdi-lista.png)

**11. Checklist de verificación** — CEDI · `POST /api/cdi/routes/:id/verify`
![Checklist](screenshots/18-cdi-checklist.png)

El CEDI debe marcar cada punto de la planilla (cantidades y contenido) antes de que el botón de confirmación se habilite — no se puede verificar "en bloque" sin revisar cada entrega, siguiendo el mismo patrón operativo de Coopidrogas que pidió gerencia.

### App Conductor (sin cambios de flujo, mismo diseño)

**12. Mi ruta de hoy** — CONDUCTOR · `GET /api/routes?driverId=`, `GET /api/deliveries?routeId=`
![Mi ruta](screenshots/10-conductor-mi-ruta.png)

**13. Captura de entrega — recibir para transporte / formulario** — CONDUCTOR
![Captura inicial](screenshots/11-conductor-captura.png)
![Formulario de captura](screenshots/11b-conductor-captura-form.png)

**14. Captura de entrega — firma, foto, receptor, geo** — CONDUCTOR · `POST /api/deliveries/:id/evidence`
![Captura llena](screenshots/12-conductor-captura-llena.png)

La firma se captura con un canvas real (pointer events), la foto usa la cámara del dispositivo y se codifica como base64 (portable entre dispositivos — no un blob local), y la ubicación usa `navigator.geolocation` real del navegador.

### Portal Cliente (público, sin login)

**15. Consulta de pedido** — Público, verificado por guía + teléfono/documento
![Consulta de pedido](screenshots/13-portal-login.png)

**16. Mis entregas (historial del cliente)** — Público, verificado
![Mis entregas](screenshots/14-portal-mis-entregas.png)

**17. Detalle de guía — con evidencia de entrega** — Público, verificado
![Detalle con evidencia](screenshots/19-portal-evidencia.png)

Nuevo: cuando el pedido está "Entregado", el cliente ahora ve **la firma y la foto de su propia entrega** — antes solo veía el estado y el contenido, sin la prueba visual.

**18. Error — guía no encontrada** — Público
![Error guía no encontrada](screenshots/16-portal-error-guia.png)

---

## 4. El mock ahora es compartido entre dispositivos

Antes, cada pestaña del navegador tenía su propia copia de los datos en memoria — un cambio hecho en el móvil no se veía en el Portal Web de otro dispositivo. Se resolvió con:

- **`demo-server/`**: un backend Express mínimo (arrays en memoria, sin base de datos), desplegado en Render, que expone exactamente los mismos endpoints que espera el frontend (`httpApiClient.ts`, ya escrito desde el prototipo anterior).
- **Polling liviano** (`refetchInterval` de TanStack Query, cada 4 segundos) en las pantallas que deben sentirse "en vivo" — sin necesidad de meter websockets todavía.

Se verificó con 3 navegadores simultáneos (Portal Web ADMIN + App CDI + App Conductor) que una verificación de planilla o una entrega confirmada aparecen en las otras pantallas sin recargar la página.

---

## 5. Cobertura funcional

| Funcionalidad | Estado |
|---|---|
| Login unificado con redirección a 3 experiencias por rol | ✅ Construido |
| Perfil CDI móvil: verificación de planilla (Creado → Alistado) | ✅ Construido |
| Selector de CEDI destino al importar planilla (ADMIN) | ✅ Construido |
| Badge "Habilitado para facturación" con timestamp | ✅ Construido |
| Evidencia de entrega (firma + foto) visible en el Portal Cliente | ✅ Construido |
| Mock compartido entre dispositivos (demo-server + polling) | ✅ Construido |
| Despliegue público (Vercel + Render) | ✅ Construido |
| Dashboard con KPIs y alertas críticas | ✅ Construido |
| Listado de entregas con búsqueda y filtro por estado | ✅ Construido |
| Asignar conductor a una ruta (exclusivo ADMIN, Portal Web) | ✅ Construido |
| Cambiar estado de ruta respetando transiciones válidas | ✅ Construido |
| Captura real de firma, foto, receptor y geolocalización | ✅ Construido |
| Marcar entrega como no entregada (con observación) | ✅ Construido |
| Portal cliente: cuenta con historial completo por NIT/teléfono | ✅ Construido |
| Estados de error (login fallido, guía no encontrada, TXT mal formado) | ✅ Construido |
| Escaneo de código de guía por cámara (del mockup) | ⛔ No construido — el conductor ya tiene la lista de guías de su ruta |
| Mapa en vivo de rutas | ⛔ No construido — no hay librería de mapas integrada |
| Descarga de acta de entrega en PDF / etiqueta QR | ⛔ No construido — no hay generación de documentos |
| UI de facturación consolidada (`invoiceExport`) | ⛔ No construido — el endpoint existe en el backend real, falta la pantalla |
| CRUD de usuarios/CEDIs desde el panel | ⛔ No construido — solo lectura en este prototipo |
| Correo de confirmación de carga exitosa (brief 3.1) | ⛔ Pendiente también en el backend real (sin helper de email) |
| Notificación real por WhatsApp | ⛔ El backend real ya dispara el evento; falta conectar un proveedor |

---

## 6. Próximos pasos

1. **Backend real**: levantar MySQL 8.0 y las llaves RS256 para `trazabilidad-api` (el backend hexagonal completo, hoy sin desplegar). El `demo-server` actual es deliberadamente desechable — replicó el estado "Verificado/Alistado" y el selector de CEDI, pero esos mismos cambios deben portarse al backend real (entidad `Route`/`Delivery`, casos de uso) cuando se conecte de verdad.
2. **Frontend → backend real**: cambiar `VITE_API_BASE_URL` en Vercel de la URL de Render al backend real. Ningún componente cambia — el contrato ya es el mismo.
3. **WhatsApp Business API**: conectar un proveedor real (Twilio, Meta Cloud API) en el helper `whatsappNotifier` del backend.
4. **Email de confirmación de carga** (brief 3.1): pieza pendiente también en el backend real.
5. **Completar lo marcado como pendiente** en la tabla de cobertura, priorizando según lo que gerencia quiera ver primero (probablemente facturación consolidada y mapa de rutas).

---

## 7. Stack técnico y decisiones de arquitectura

- **Frontend**: Vite + React 18 + TypeScript estricto, React Router v6 con *guards* por rol, TanStack Query (cache + polling), Zustand (sesión), Tailwind + Radix UI, React Hook Form + Zod.
- **Capa de API mock/real** (`frontend/src/api/`): `apiClient.types.ts` define el contrato único; `mock/mockApiClient.ts` (en memoria, para desarrollo offline) e `httpApiClient.ts` (HTTP real) lo implementan; `client.ts` decide cuál usar vía `VITE_API_MODE`.
- **`demo-server/`** (nuevo): Express + JWT (HS256, simple porque es desechable) + arrays en memoria, con la misma forma de datos que el backend real. Es lo que permite que la demo se vea "en vivo" entre dispositivos sin esperar a MySQL.
- **Despliegue**: frontend en **Vercel** (cero configuración para Vite, CLI excelente); `demo-server` en **Render** (free tier, deploy directo desde GitHub vía blueprint `render.yaml`).
- **Sistema de diseño propio**, sin cambios: "sello" hexagonal con muesca como elemento de firma visual; paleta anclada en el mundo farmacéutico (teal de cadena de frío, naranja de alerta térmica, verde de dispensación, rojo de medicamento controlado); tipografía Barlow Condensed + Public Sans + IBM Plex Mono, autohospedadas.

---

## Cómo correr el prototipo

**En producción:** https://farmatrack-iprocess.vercel.app (recomendado — así se ve el mock compartido entre dispositivos)

**En local:**
```bash
# Backend mínimo compartido
cd demo-server && npm install && npm start   # puerto 3001

# Frontend (frontend/.env.local → VITE_API_MODE=real, VITE_API_BASE_URL=http://localhost:3001)
cd frontend && npm install && npm run dev     # puerto 5173
```

Usuarios de prueba (contraseña `farmatrack123` para todos):
- **ADMIN** (Portal Web completo): `admin@iprocess.co`
- **CEDI** (verificación móvil): `maria.rodriguez@farmatrack.co` — CEDI Bogotá Norte
- **CONDUCTOR** (entregas móvil): `carlos.pena@farmatrack.co`
- **Portal cliente**: guía `FARMA-00231` + teléfono `3011234567`
