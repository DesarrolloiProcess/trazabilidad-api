# FarmaTrack — Sistema de trazabilidad de entregas

**Entregable de presentación** · Sistema en producción, backend real (MySQL) sobre arquitectura hexagonal, frontend React desplegado públicamente.

**🔗 Demo en vivo:** **https://farmatrack.syncip.co**
**🔗 API en producción:** backend real (MySQL en Amazon RDS) desplegado en Railway.

---

## 1. Resumen ejecutivo

FarmaTrack es el sistema de trazabilidad de entregas para droguerías que despachan medicamentos directamente al domicilio del paciente. Resuelve un problema muy concreto: hoy la facturación se emite *antes* del despacho, sin evidencia real de que el pedido llegó a su destino. FarmaTrack invierte ese orden — la entrega se confirma con firma, foto, cédula de quien recibe y geolocalización, **y solo entonces se habilita la facturación** — mientras el paciente puede seguir su pedido, ver la evidencia de su propia entrega, y consultarlo sin necesidad de crear una cuenta.

El sistema cubre el flujo **droguería → paciente**: cada droguería despacha sus propios pedidos, un conductor los transporta y confirma la entrega en el domicilio del paciente. Cuando el pedido corresponde a una EPS o convenio, ese dato queda asociado a la entrega de forma opcional — el paciente sigue siendo siempre el destinatario real.

Cubre 4 experiencias, desplegadas públicamente y compartiendo datos en tiempo real entre dispositivos — no es una demo local aislada:

- **Portal Web** — administración completa (rol ADMIN) y operación diaria de cada droguería (rol CEDI).
- **App de verificación** — la droguería confirma que la planilla recibida coincide con lo despachado.
- **App del Conductor** — recibe la ruta, transporta y confirma cada entrega con evidencia.
- **Portal del Paciente** — consulta pública del estado de su pedido, sin necesidad de cuenta.

---

## 2. Flujo de una entrega

```
Creado ────────(droguería verifica cantidades/contenido)───────▶ Alistado
Alistado ──────(se asigna un conductor a la ruta)───────────────▶ Alistado + conductor asignado
Alistado ──────(conductor confirma "Recibir para transporte")──▶ Entregado a transportador
Entregado a transportador ──(firma + foto + receptor + geo)────▶ Entregado al paciente ──▶ Habilita facturación
Entregado a transportador ──(conductor marca no entregado)─────▶ No entregado
```

- La planilla llega al sistema en estado **Creado** (importación manual desde el Portal Web).
- La **droguería de origen** verifica desde su app móvil que el contenido físico coincide con lo declarado — cada punto de la planilla debe marcarse antes de habilitar la confirmación. Al verificar, la entrega pasa a **Alistado**.
- Desde el Portal Web se **asigna un conductor** a la ruta — cada droguería solo ve y asigna conductores de su propia sede.
- El conductor confirma que recibió la mercancía para transporte, y en el domicilio del paciente captura **firma, foto de soporte, nombre y cédula de quien recibe, y geolocalización real** del punto de entrega.
- Al confirmarse la entrega, el pedido queda **habilitado para facturación** con el timestamp exacto, y se genera automáticamente el acta de entrega descargable en PDF.
- Si el conductor no puede completar la entrega, la marca como **No entregado** con una observación obligatoria.

---

## 3. Pantallas del sistema

### Portal Web — Administración (rol ADMIN)

**1. Inicio de sesión**
![Inicio de sesión](screenshots/01-login.png)

**2. Entregas — listado, búsqueda y filtro por estado**
![Entregas](screenshots/03-panel-entregas.png)

**3. Importar planilla (TXT)** — con selector de droguería de destino
![Importar planilla](screenshots/04-panel-import-dialog.png)

**4. Detalle de entrega** — contenido del envío, mapa de ubicación, y evidencia de entrega (firma, foto, geolocalización) una vez confirmada
![Detalle de entrega](screenshots/07-panel-delivery-detail.png)

**5. Rutas** — asignar conductor y controlar el avance de cada ruta del día
![Rutas](screenshots/08-panel-rutas.png)

**6. Facturación** — entregas confirmadas, separadas entre pendientes y ya exportadas a facturación
![Facturación](screenshots/20-panel-facturacion.png)

**7. Droguerías** — crear, editar y desactivar sedes
![Droguerías](screenshots/09-panel-cedis.png)

**8. Usuarios** — crear, editar y desactivar cuentas (ADMIN, CEDI, CONDUCTOR)

**9. Reportes** — resumen por estado con filtro de rango de fecha y droguería

**10. Configuración** — datos de droguería y umbral de alertas

### App de verificación (rol CEDI — operación diaria de cada droguería)

**11. Planillas por verificar**
![Lista de verificación](screenshots/17-cdi-lista.png)

**12. Checklist de verificación** — cada punto de la planilla debe marcarse antes de habilitar la confirmación
![Checklist](screenshots/18-cdi-checklist.png)

### App del Conductor

**13. Mi ruta de hoy**
![Mi ruta](screenshots/10-conductor-mi-ruta.png)

**14. Captura de entrega** — recibir para transporte, luego firma, foto, datos de quien recibe y geolocalización real
![Captura de entrega](screenshots/12-conductor-captura-llena.png)

La firma se captura con un lienzo real (no una imagen genérica), la foto usa la cámara del dispositivo, y la ubicación usa la geolocalización real del navegador en el momento de la entrega — no hay coordenadas simuladas ni de relleno.

### Portal del Paciente (público, sin necesidad de cuenta)

**15. Consulta de pedido** — por número de guía + teléfono o documento
![Consulta de pedido](screenshots/13-portal-login.png)

**16. Mis pedidos**
![Mis entregas](screenshots/14-portal-mis-entregas.png)

**17. Detalle de guía** — con evidencia de entrega (firma y foto) una vez el pedido fue entregado
![Detalle con evidencia](screenshots/19-portal-evidencia.png)

---

## 4. Cobertura funcional

| Funcionalidad | Estado |
|---|---|
| Login unificado con redirección según rol (ADMIN / CEDI / CONDUCTOR) | ✅ |
| Verificación de planilla en la droguería de origen (Creado → Alistado) | ✅ |
| Selector de droguería de destino al importar planilla | ✅ |
| Asignar conductor a una ruta, acotado a la propia droguería | ✅ |
| Cambiar estado de ruta respetando las transiciones válidas | ✅ |
| Captura real de firma, foto, receptor y geolocalización | ✅ |
| Marcar entrega como no entregada, con observación obligatoria | ✅ |
| Habilitación automática de facturación al confirmar la entrega | ✅ |
| Exportación a facturación desde el Portal Web | ✅ |
| Descarga de acta de entrega en PDF (con código QR de la guía) | ✅ |
| Mapa de ubicación por entrega (destino declarado + punto real de entrega) | ✅ |
| Portal del paciente: consulta sin cuenta, historial completo por guía + teléfono/documento | ✅ |
| Campo opcional de EPS/convenio asociado a la entrega (paciente sigue siendo el destinatario) | ✅ |
| CRUD de usuarios y droguerías desde el panel | ✅ |
| Cambio de contraseña / recuperación por código (OTP en pantalla) | ✅ |
| Reportes por estado, con filtro de fecha y droguería | ✅ |
| Configuración de droguería y umbral de alertas | ✅ |
| Permisos por rol validados en backend (no solo ocultos en la interfaz) | ✅ |
| Notificación por WhatsApp al paciente | ⛔ Evento ya se dispara; falta conectar un proveedor real |
| Correo de confirmación de carga exitosa | ⛔ Pendiente, sin proveedor de correo conectado |
| Proveedor real de OTP/SMS | ⛔ El código de recuperación se muestra en pantalla, sin envío real |

---

## 5. Stack técnico

- **Backend**: Node.js + TypeScript, arquitectura hexagonal (casos de uso, entidades de dominio, repositorios), Express, Drizzle ORM sobre MySQL 8 (Amazon RDS), autenticación JWT (RS256).
- **Frontend**: Vite + React 18 + TypeScript estricto, React Router con *guards* por rol, TanStack Query (cache + actualización en vivo por polling), Zustand (sesión), Tailwind + Radix UI, React Hook Form + Zod.
- **Mapa**: `react-leaflet` + OpenStreetMap, sin necesidad de llave de API.
- **Despliegue**: backend y frontend en **Railway**, frontend servido bajo dominio propio (`farmatrack.syncip.co`).
- **Sistema de diseño propio**: "sello" hexagonal con muesca como elemento de firma visual; paleta anclada en el mundo farmacéutico; tipografía Barlow Condensed + Public Sans + IBM Plex Mono, autohospedadas.

---

## 6. Próximos pasos

1. **Proveedor real de WhatsApp Business API** (Twilio o Meta Cloud API) — el sistema ya dispara el evento de notificación al paciente en cada cambio de estado relevante, falta conectarlo a un proveedor real de envío.
2. **Proveedor real de correo y SMS** — para la confirmación de carga de planilla y el envío real del código de recuperación de contraseña (hoy se muestra en pantalla).
3. **Umbral de alertas configurable** — hoy se guarda desde la pantalla de Configuración pero aún no dispara ninguna alerta automática; falta conectarlo a una regla de negocio.

---

## Cómo acceder

**En producción:** https://farmatrack.syncip.co

Usuarios de prueba (contraseña `Farmatrack2026!` para todos):

| Rol | Nombre | Correo | Droguería |
|---|---|---|---|
| ADMIN | Anamaría Ángel | `admin@iprocess.co` | Acceso completo |
| CEDI | María Rodríguez | `maria.rodriguez@farmatrack.co` | Droguería Bogotá Norte |
| CONDUCTOR | Carlos Peña | `carlos.pena@farmatrack.co` | Droguería Bogotá Norte |
| CONDUCTOR | — | `conductor.medellin@test.com` | Droguería Medellín |

**Portal del paciente** (consulta por guía + teléfono, sin necesidad de contraseña):

| Guía | Teléfono | Estado |
|---|---|---|
| `FARMA-INTERMEDICA` | `3213344556` | Creado |
| `FARMA-90001` | `3101234567` | Entregado, con evidencia completa |
| `FARMA-00801` | `3151234513` | No entregado |
