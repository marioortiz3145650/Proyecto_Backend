# Laying Hens - Backend API

API REST desarrollada con **NestJS** para la gestión de un sistema de producción de gallinas ponedoras. Incluye módulos de autenticación JWT, gestión de galpones, lotes, alimentos, producción, alertas, tratamientos, y un microservicio de visión por computadora para el peso de huevos.

## Arquitectura

```
Backend/
├── src/                    # Código fuente de la API (NestJS)
│   ├── auth/               # Autenticación JWT y roles
│   ├── usuarios/           # CRUD de usuarios
│   ├── roles/              # Gestión de roles
│   ├── galpones/           # CRUD de galpones
│   ├── lotes/              # CRUD de lotes
│   ├── alimentos/          # CRUD de alimentos
│   ├── tipo_de_alimento/   # CRUD de tipos de alimento
│   ├── unidades_de_medida/ # CRUD de unidades de medida
│   ├── produccion/         # Registro de producción
│   ├── movimientos_insumo/ # Movimientos de insumos
│   ├── alertas/            # Sistema de alertas
│   ├── muertes/            # Registro de muertes
│   ├── tratamientos/       # Tratamientos veterinarios
│   ├── reportes/           # Reportes y estadísticas
│   ├── settings/           # Configuración del sistema
│   ├── seed/               # Datos semilla (usuarios, roles, settings)
│   ├── vision/             # Microservicio de visión (Python)
│   ├── database/           # Configuración de TypeORM
│   └── migrations/         # Migraciones de base de datos
├── test/                   # Tests E2E (Jest)
├── Microservicio_IA/       # Archivos de visión por computadora
├── requirements.txt        # Dependencias de Python
├── Dockerfile              # Imagen con Node.js + Python integrado
├── docker-compose.yml      # Orquestación de contenedores
└── vision_config.json      # Configuración de ROI para visión
```

## Prerrequisitos

| Herramienta | Versión | Uso |
|---|---|---|
| Docker | 20.10+ | Ejecución en contenedores (recomendado) |
| Docker Compose | 2.0+ | Orquestación con un solo comando |
| Node.js | v20.x | Desarrollo local sin Docker |
| npm | 10+ | Instalación de dependencias |
| PostgreSQL | 14.3 | Base de datos (se levanta con Docker) |
| Python 3 | 3.10+ | Microservicio de visión (incluido en Docker) |

---

## 🐳 Ejecución con Docker (recomendado)

Todo el stack (Node.js + Python + PostgreSQL) se levanta con un solo comando. El `Dockerfile` instala automáticamente Node.js v20, Python 3, `opencv-python-headless`, `numpy`, `easyocr`, y `torch` (CPU).

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/marioortiz3145650/Proyecto_Backend.git
cd Proyecto_Backend

# 2. Levantar todo (construcción inicial toma ~5-10 min)
docker-compose up -d --build

# 3. Listo. La API estará en http://localhost:3000
```

### Comandos útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f app

# Ver logs solo de la base de datos
docker-compose logs -f db

# Detener todo
docker-compose down

# Reconstruir después de cambiar dependencias
docker-compose up -d --build --force-recreate
```

### Puertos

| Servicio | Puerto Host | Puerto Contenedor | Descripción |
|---|---|---|---|
| Backend (NestJS) | 3000 | 3000 | API REST |
| PostgreSQL | 5434 | 5432 | Base de datos |

---

## 💻 Ejecución local (sin Docker)

### 1. Instalar dependencias

```bash
npm install --legacy-peer-deps
```

> **Nota**: El flag `--legacy-peer-deps` es necesario porque algunas dependencias del proyecto (`@types/bcrypt`, `bcrypt`) tienen conflictos de versiones con Node 20. El `Dockerfile` ya lo incluye por defecto.

### 2. Iniciar PostgreSQL

Puedes usar Docker solo para la base de datos:

```bash
docker-compose up -d db
```

O instalar PostgreSQL 14.3 localmente y crear la base de datos `LayingHens`.

### 3. Ejecutar el servidor

```bash
# Desarrollo (con hot-reload)
npm run start:dev

# Producción
npm run build
npm run start:prod
```

### 4. Instalar dependencias de Python (solo para visión)

```bash
pip3 install -r requirements.txt
```

> El servicio de visión (`src/vision/weight_detector.py`) se lanza como proceso hijo desde Node.js. Necesita Python 3 con `flask`, `opencv-python-headless`, `numpy`, `easyocr` y (en Windows) `pygrabber`.

---

## 📜 Scripts disponibles

```bash
npm run start:dev      # Desarrollo con hot-reload
npm run start          # Ejecución normal
npm run start:prod     # Producción (usa dist/)
npm run build          # Compilar TypeScript → dist/
npm run lint           # Linter (eslint --fix)
npm run format         # Formatear con Prettier
npm run test           # Tests unitarios (Jest)
npm run test:watch     # Tests en modo watch
npm run test:cov       # Tests con cobertura
npm run test:e2e       # Tests E2E

# Migraciones (ejecutadas automáticamente al iniciar)
npm run migration:run     # Aplicar migraciones
npm run migration:revert  # Revertir última migración
```

---

## 👤 Usuarios por defecto

Al iniciar la aplicación, el `SeedService` crea automáticamente estos usuarios:

| Rol | Usuario | Contraseña |
|---|---|---|
| Administrador | `Instructor` | `admin123` |
| Aprendiz | `Aprendiz` | `aprendiz123` |
| Visitante | `visitante` | `visitante123` |

Para obtener un token de visitante sin credenciales:

```bash
curl -X POST http://localhost:3000/auth/visitante
```

---

## 🌐 API Endpoints

### Auth
```
POST   /auth/login      → Login con nombre_usuario + password
POST   /auth/visitante  → Login como invitado
GET    /auth/profile    → Perfil del usuario autenticado (requiere JWT)
```

### Módulos CRUD (requieren JWT)
```
GET,POST,PUT,DELETE /usuarios
GET,POST,PUT,DELETE /roles
GET,POST,PUT,DELETE /razas
GET,POST,PUT,DELETE /lotes
GET,POST,PUT,DELETE /galpones
GET,POST,PUT,DELETE /alimentos
GET,POST,PUT,DELETE /tipo-de-alimento
GET,POST,PUT,DELETE /produccion
GET,POST,PUT,DELETE /movimientos-insumo
GET,POST,PUT,DELETE /alertas
GET,POST,PUT,DELETE /muertes
GET,POST,PUT,DELETE /tratamientos
GET,POST,PUT,DELETE /reportes
GET,POST,PUT,DELETE /settings
```

### Visión (requiere Python)
```
POST /vision/start   → Iniciar cámara (body: { cameraIndex: 0 })
POST /vision/stop    → Detener cámara
```

---

## 🔧 Tecnologías

- **NestJS 11** — Framework backend
- **TypeScript 5** — Lenguaje
- **TypeORM 0.3** — ORM para PostgreSQL
- **PostgreSQL 14** — Base de datos
- **JWT / Passport** — Autenticación
- **bcrypt** — Hash de contraseñas
- **Docker** — Containerización
- **Python 3 + OpenCV** — Visión por computadora

---

## 📁 Estructura de base de datos

El proyecto incluye migraciones en `src/migrations/`:

| Archivo | Descripción |
|---|---|
| `1782867387441-InitialMigrationAndUUIDSetup.ts` | Migración inicial con UUIDs |
| `1782868306921-DropEstadoTable.ts` | Elimina tabla `estado` |
| `1782870058415-UpdateUUIDPrimaryKeys.ts` | Actualiza PKs a UUID |
| `1783640902738-CreateSettingsTable.ts` | Crea tabla de settings |

Las migraciones se ejecutan **automáticamente** al iniciar la aplicación (`migrationsRun: true` en `app.module.ts`).

---

## 🐳 Docker Compose

El `docker-compose.yml` define dos servicios:

- **`db`** — PostgreSQL 14.3 con datos persistentes en `./postgres/`
- **`app`** — Aplicación NestJS construida desde el `Dockerfile` (incluye Python3 + dependencias)

El servicio `app` depende de `db` y se conecta a la base de datos mediante el nombre del servicio (`db`) usando comunicación interna de Docker.
