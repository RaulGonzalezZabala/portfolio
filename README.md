# Portfolio personal

Base de un portfolio personal orientado a presentar proyectos y tecnologías. Está construido con React + Vite en el frontend, una API REST JSON en PHP sin framework y MySQL como base de datos.

> Estado actual: frontend React conectado a una API REST PHP de solo lectura y a MySQL/MariaDB local.

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
├── database/              # schema.sql y seed.sql
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

Las rutas responden JSON. Los listados se devuelven dentro de `data` y los errores dentro de `error`. La API solo publica proyectos cuyo valor `is_published` sea `1`.

## Requisitos

- Node.js 20 o superior y npm.
- PHP con las extensiones `pdo` y `pdo_mysql`.
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

El esquema está en `database/schema.sql` y los datos de demostración en `database/seed.sql`. Todos los datos del seed son ficticios y no representan experiencia profesional, clientes ni métricas.

En phpMyAdmin, crea una base de datos llamada `portfolio` con cotejamiento `utf8mb4_unicode_ci` e importa primero el esquema y después los datos de ejemplo. También puedes utilizar una consola MySQL:

```bash
mysql -u root -p -e "CREATE DATABASE portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p portfolio < database/schema.sql
mysql -u root -p portfolio < database/seed.sql
```

Estos comandos son instrucciones para ejecutar manualmente: no se han ejecutado desde este proyecto. Si tu instalación de XAMPP usa otro usuario o puerto, ajusta los comandos y `backend/.env` a tu configuración local.

## Pruebas manuales

Con MySQL en marcha, la base de datos importada y la API iniciada, abre estas URLs o ejecútalas con el navegador:

- `http://localhost:8000/api/health` devuelve `{"status":"ok"}`.
- `http://localhost:8000/api/projects` devuelve los proyectos publicados, ordenados por `display_order`.
- `http://localhost:8000/api/projects/catalogo-local-ficticio` devuelve el proyecto público de ejemplo.
- `http://localhost:8000/api/projects/api-notas-ficticia` devuelve HTTP `404`, pues el seed lo marca como no publicado.
- `http://localhost:8000/api/technologies` devuelve las tecnologías disponibles.

Con la API activa, inicia también el frontend con `npm run dev` dentro de `frontend`. Vite se ejecuta habitualmente en `http://localhost:5173` y la API permite peticiones únicamente desde ese origen local.

## Limitaciones de la primera versión

- No incluye panel de administración, login, roles ni endpoints de escritura.
- No incluye subida de archivos, pagos, Docker ni servicios externos.
- La interfaz empezará con datos mock y posteriormente consumirá la API REST.
