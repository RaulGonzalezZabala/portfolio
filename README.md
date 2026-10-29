# Portfolio personal

Base de un portfolio personal orientado a presentar proyectos y tecnologías. Está construido con React + Vite en el frontend, una API REST JSON en PHP sin framework y MySQL como base de datos.

> Estado actual: portfolio y demo TicketPulse conectados a una API REST PHP y a MySQL/MariaDB local.

## Estructura

```text
portfolio/
├── frontend/              # Interfaz React con Vite
│   └── src/
│       ├── components/    # Componentes reutilizables de interfaz
│       ├── pages/         # Vistas principales y detalle de proyecto
│       ├── services/      # Cliente centralizado de la API
│       ├── data/          # Datos mock temporales
│       ├── styles/        # CSS global y CSS por componente
│       └── assets/        # Recursos visuales propios
├── backend/               # API REST JSON en PHP
│   ├── public/            # Entrada HTTP: index.php
│   ├── config/            # Configuración y conexión PDO
│   ├── routes/            # Declaración y resolución de rutas /api
│   ├── controllers/       # Respuestas HTTP y JSON
│   └── repositories/      # Consultas PDO preparadas
├── database/              # Esquema, seed y migraciones SQL
├── .gitignore
└── README.md
```

## API REST

El frontend no ejecuta funciones PHP directamente. Envía peticiones HTTP a rutas REST y recibe JSON:

```text
React → GET /api/projects → index.php → routes → controller → repository (PDO/MySQL) → JSON
```

Rutas disponibles en la primera versión:

- `GET /api/health`
- `GET /api/projects`
- `GET /api/projects/{slug}`
- `GET /api/technologies`

TicketPulse añade rutas CRUD para desarrollo local:

- `GET /api/ticket-events`
- `POST /api/ticket-events`
- `GET /api/ticket-events/{id}`
- `PUT /api/ticket-events/{id}`
- `DELETE /api/ticket-events/{id}`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/verify`
- `POST /api/auth/resend-verification`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`
- `POST /api/auth/logout`

Las rutas responden JSON. Los listados se devuelven dentro de `data` y los errores dentro de `error`. La API solo publica proyectos cuyo valor `is_published` sea `1`. Las rutas de TicketPulse requieren sesión; registro, inicio, verificación, recuperación y cierre de sesión usan endpoints separados. Las escrituras de eventos usan token CSRF y cada consulta se limita al usuario autenticado.

## Requisitos

- Node.js 20 o superior y npm.
- PHP con las extensiones `pdo`, `pdo_mysql` y `curl`.
- MySQL o MariaDB.
- Apache o el servidor PHP integrado para servir el backend.
- Git.

En este equipo se han comprobado Node.js `20.18.0`, npm `10.8.2` y Git `2.47.0`. PHP aún debe instalarse o configurarse en `PATH`; XAMPP es una opción válida para ello y para MySQL/Apache.

## Configuración local

### Frontend

El frontend está creado con Vite y consume la API REST. Copia `frontend/.env.example` a `frontend/.env`; para el entorno local usa `VITE_API_BASE_URL=http://localhost:8000/api`. La variable contiene únicamente una URL pública, nunca secretos.

Para iniciarlo:

```bash
cd frontend
npm install
npm run dev
```

Vite mostrará una URL local, normalmente `http://localhost:5173`. La primera pantalla incluye presentación, sobre mí, tecnologías, tarjetas de proyectos ficticios y un detalle seleccionable de cada proyecto.

### Backend

Copia `backend/.env.example` a `backend/.env` y reemplaza los valores de ejemplo con una cuenta local de MySQL. Ese archivo está ignorado por Git.

En esta instalación, MySQL de XAMPP usa el puerto `3307`, que ya está configurado en el archivo de ejemplo. Crea una cuenta local de MySQL para el proyecto o utiliza una cuenta local existente; no guardes su contraseña en Git.

Para iniciar la API durante el desarrollo, ejecuta desde la raíz del proyecto:

```powershell
C:\xampp\php\php.exe -S localhost:8000 -t backend/public
```

Con el servidor activo, prueba `http://localhost:8000/api/health`. El punto de entrada `backend/public/index.php` recibe las peticiones y `backend/routes/api.php` resuelve las rutas. En una configuración de Apache posterior, se deberá configurar `backend/public` como directorio público y reenviar las solicitudes al mismo `index.php`.

## Base de datos

El esquema inicial está en `database/schema.sql`, los datos de demostración en `database/seed.sql`, la migración de TicketPulse en `database/ticket-pulse.sql`, la migración de usuarios en `database/auth.sql` y la ampliación de verificación/recuperación en `database/auth-security.sql`. Todos los datos del seed son ficticios y no representan experiencia profesional, clientes ni métricas.

En phpMyAdmin, crea una base de datos llamada `portfolio` con cotejamiento `utf8mb4_unicode_ci` e importa primero el esquema, después los datos de ejemplo, `ticket-pulse.sql`, `auth.sql` y finalmente `auth-security.sql`. También puedes utilizar una consola MySQL:

```bash
mysql -u root -p -e "CREATE DATABASE portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p portfolio < database/schema.sql
mysql -u root -p portfolio < database/seed.sql
mysql -u root -p portfolio < database/ticket-pulse.sql
mysql -u root -p portfolio < database/auth.sql
mysql -u root -p portfolio < database/auth-security.sql
```

Importa cada migración una sola vez y en ese orden. `auth.sql` añade usuarios y una relación de propiedad a los eventos; `auth-security.sql` añade verificación de correo, recuperación, invalidación de sesiones y límites de intentos. Los eventos antiguos sin usuario no se mostrarán a ninguna cuenta. Ejecuta `auth-security.sql` también si ya habías aplicado `auth.sql`. Ajusta usuario y puerto a tu configuración local.

### Cuentas TicketPulse y correo

TicketPulse requiere PHP con la extensión `curl`. Para verificación de correo y recuperación de contraseña configura en `backend/.env` una clave API de Brevo, un remitente/dominio verificado y la URL pública del frontend:

```dotenv
FRONTEND_BASE_URL=http://localhost:5173
EMAIL_PROVIDER=brevo
BREVO_API_KEY=
MAIL_FROM_EMAIL=
MAIL_FROM_NAME=TicketPulse
```

No guardes la clave real en Git. En local, el registro crea una cuenta pendiente y devuelve un error explícito si falta la configuración de correo. El usuario debe verificar su email antes de iniciar sesión. Los enlaces de verificación caducan en 24 horas y los de recuperación en 1 hora; ambos son de un solo uso. La API limita intentos de registro, inicio de sesión, verificación y recuperación por IP/cuenta.

Los documentos de [términos de uso](./frontend/public/legal/terms.html) y [privacidad](./frontend/public/legal/privacy.html) son únicamente borradores con campos entre corchetes. Antes de publicar el registro, completa la identidad y contacto del responsable, proveedores, bases jurídicas, plazos de conservación, procedimiento de baja y demás datos reales, y solicita revisión legal/RGPD. No publiques los textos con los marcadores de borrador.

## Pruebas manuales

Con MySQL en marcha, la base de datos importada y la API iniciada, abre estas URLs o ejecútalas con el navegador:

- `http://localhost:8000/api/health` devuelve `{"status":"ok"}`.
- `http://localhost:8000/api/projects` devuelve los proyectos publicados, ordenados por `display_order`.
- `http://localhost:8000/api/projects/catalogo-local-ficticio` devuelve el proyecto público de ejemplo.
- `http://localhost:8000/api/projects/api-notas-ficticia` devuelve HTTP `404`, pues el seed lo marca como no publicado.
- `http://localhost:8000/api/technologies` devuelve las tecnologías disponibles.
- `http://localhost:8000/api/ticket-events` devuelve los eventos de TicketPulse después de importar la migración.

Con la API activa, inicia también el frontend con `npm run dev` dentro de `frontend`. Vite se ejecuta habitualmente en `http://localhost:5173` y la API permite peticiones únicamente desde ese origen local.

## Limitaciones actuales

- La autenticación requiere completar la migración `auth-security.sql` y configurar Brevo; no despliegues el registro públicamente hasta completar y revisar los textos legales.
- No incluye panel de administración ni roles.
- No incluye subida de archivos, pagos, Docker ni servicios externos.
- Al entrar en TicketPulse aparece una invitación propia para activar notificaciones; al continuar, Chrome solicita el permiso real. También puedes pulsar «Ahora no» y activarlas después desde el aviso de la página. Antes de la venta, abre el evento en una pestaña o en una ventana separada desde su tarjeta. Al empezar la venta, la notificación permite volver a TicketPulse y abrir el evento. El navegador puede bloquear ventanas emergentes, retrasar avisos o impedir que una ventana minimizada pase al frente; el equipo debe permanecer despierto y TicketPulse abierto.
