# Senavicola - Backend API

Este proyecto es el **Backend** de la plataforma integral de gestión de gallinas ponedoras **Senavicola**. Está desarrollado con **NestJS** y TypeORM, con una base de datos **PostgreSQL** y un microservicio de visión por computadora en **Python** (para el peso de huevos) totalmente integrado en el contenedor de Docker.

## 🏗️ Arquitectura

```
Backend/
├── src/
│   ├── auth/                     # Autenticación JWT y autorización por roles
│   ├── usuarios/                 # Gestión de usuarios (CRUD + validación de login)
│   ├── roles/                    # Gestión de roles (Administrador, Aprendiz, Visitante)
│   ├── galpones/                 # CRUD de galpones (galpones de gallinas)
│   ├── lotes/                    # CRUD de lotes (grupos de gallinas)
│   ├── alimentos/                # CRUD de alimentos
│   ├── tipo_de_alimento/         # CRUD de tipos de alimento
│   ├── unidades_de_medida/       # CRUD de unidades de medida
│   ├── produccion/               # Registro de producción diaria
│   ├── movimientos_insumo/       # Movimientos de insumos (alimentos, etc.)
│   ├── alertas/                  # Sistema de alertas automáticas
│   ├── muertes/                  # Registro de.muertes de gallinas
│   ├── tratamientos/             # Tratamientos veterinarios
│   ├── reportes/                 # Reportes y estadísticas
│   ├── settings/                 # Configuración del sistema
│   ├── seed/                     # Datos semilla (usuarios, roles, settings)
│   ├── vision/                   # Microservicio de visión (Python - peso de huevos)
│   ├── database/                 # Configuración de TypeORM
│   └── migrations/               # Migraciones de base de datos
├── test/                         # Tests E2E (Jest)
├── Microservicio_IA/             # Archivos de visión por computadora
├── src/vision/weight_detector.py  # Script Python para detección de peso
├── requirements.txt              # Dependencias de Python
├── Dockerfile                    # Imagen con Node.js + Python + dependencias
├── docker-compose.yml            # Orquestación de contenedores
└── vision_config.json            # Configuración de ROI para visión
```

## 📋 Requisitos Previos

| Herramienta | Versión | Uso |
|---|---|---|
| **Docker** | 20.10+ | Ejecución del backend + PostgreSQL + Python |
| **Docker Compose** | 2.0+ | Orquestación con un solo comando |
| **Node.js** | v20.x LTS | Desarrollo local (opcional) |
| **npm** | 10+ | Instalación de dependencias |
| **Python 3** | 3.10+ | Solo para visión (incluido en Docker) |

## 🚀 Instrucciones de Instalación y Ejecución

### Opción 1: Con Docker (recomendado)

El `docker-compose.yml` orquesta la ejecución simultánea de:

- 🐘 **PostgreSQL 14.3** — Base de datos
- 🟢 **Backend NestJS** — API y lógica de negocio
- 🐍 **Python 3** — Microservicio de visión (peso de huevos)

#### Pasos:

```bash
# 1. Clonar el repositorio
git clone https://github.com/marioortiz3145650/Proyecto_Backend.git
cd Proyecto_Backend

# 2. Crear el archivo de configuración de variables de entorno
#    (instrucciones abajo)

# 3. Levantar todos los contenedores
docker-compose up -d --build
```

La primera vez toma ~5-10 minutos mientras descarga la imagen de PostgreSQL, construye la imagen de Node.js + Python y ejecuta `npm install` y `pip3 install`.

#### Variables de entorno

Crea un archivo de configuración en la raíz del backend con las siguientes variables:

```env
DB_HOST=db
DB_PORT=5434
DB_NAME=LayingHens
USER_NAME=postgres
DB_PASSWORD=tu_contraseña_para_postgres
JWT_SECRET=una_clave_secreta_segura
PORT=3000
```

| Variable | Descripción | Valor de ejemplo |
|---|---|---|
| `DB_HOST` | Host de PostgreSQL. Usa `db` para Docker | `db` |
| `DB_PORT` | Puerto de PostgreSQL en el host | `5434` |
| `DB_NAME` | Nombre de la base de datos | `LayingHens` |
| `USER_NAME` | Usuario de PostgreSQL | `postgres` |
| `DB_PASSWORD` | Contraseña de PostgreSQL | `tu_password` |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | `mi_clave_secreta` |
| `PORT` | Puerto donde corre la API | `3000` |

> **Importante**: Para Docker, `DB_HOST` debe ser `db` (nombre del servicio en docker-compose). Para desarrollo local, usa `DB_HOST=localhost`.

### Opción 2: Desarrollo local (sin Docker para la app)

```bash
# 1. Levantar solo PostgreSQL con Docker
docker-compose up -d db

# 2. Instalar dependencias de Node.js
npm install --legacy-peer-deps

# 3. (Opcional) Instalar dependencias de Python para visión
pip3 install -r requirements.txt

# 4. Crear el archivo de configuración con DB_HOST=localhost

# 5. Ejecutar en modo desarrollo (con hot-reload)
npm run start:dev
```

> **Nota sobre `--legacy-peer-deps`**: Algunas dependencias del proyecto (`@types/bcrypt`, `bcrypt`) tienen conflictos de versiones con Node 20. El flag `--legacy-peer-deps` resuelve estos conflictos. El `Dockerfile` ya lo incluye por defecto.

## 🌐 Puertos y Accesos

| Servicio | Puerto | Descripción |
|---|---|---|
| **Backend API (NestJS)** | **3000** | `http://localhost:3000` — API REST |
| **PostgreSQL** | **5434** | `localhost:5434` — Base de datos |

## 📜 Scripts Disponibles

```bash
# Docker
docker-compose up -d --build          # Levantar todo
docker-compose down                    # Detener todo
docker-compose logs -f app             # Ver logs del backend

# Node.js
npm run start:dev                      # Desarrollo (hot-reload)
npm run start                          # Ejecución normal
npm run start:prod                     # Producción (usa dist/)
npm run build                          # Compilar TypeScript → dist/
npm run lint                           # Linter (eslint --fix)
npm run format                        # Formatear con Prettier

# Tests
npm run test                           # Tests unitarios (Jest)
npm run test:watch                    # Tests en modo watch
npm run test:cov                      # Tests con cobertura
npm run test:e2e                      # Tests E2E

# Migraciones (se ejecutan automáticamente al iniciar)
npm run migration:run                  # Aplicar migraciones
npm run migration:revert               # Revertir última migración
```

## 👤 Usuarios de Prueba (semilla automática)

Al iniciar la aplicación, el `SeedService` crea automáticamente estos usuarios:

| Rol | Usuario | Contraseña |
|---|---|---|
| **Administrador** | `Instructor` | `admin123` |
| **Aprendiz** | `Aprendiz` | `aprendiz123` |
| **Visitante** | `visitante` | `visitante123` |

### Login

```bash
# Login con credenciales
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "nombre_usuario=Instructor" \
  -d "password=admin123"

# Login como visitante (sin credenciales)
curl -X POST http://localhost:3000/auth/visitante
```

## 🌐 API Endpoints

### Auth
```
POST   /auth/login      → Login con nombre_usuario + password
POST   /auth/visitante  → Login como invitado
GET    /auth/profile    → Perfil del usuario autenticado (requiere JWT)
```

### Módulos CRUD (todos requieren JWT)
```
GET,POST,PUT,DELETE /usuarios
GET,POST,PUT,DELETE /roles
GET,POST,PUT,DELETE /razas
GET,POST,PUT,DELETE /lotes
GET,POST,PUT,DELETE /galpones
GET,POST,PUT,DELETE /alimentos
GET,POST,PUT,DELETE /tipo-de-alimento
GET,POST,PUT,DELETE /unidades-de-medida
GET,POST,PUT,DELETE /produccion
GET,POST,PUT,DELETE /movimientos-insumo
GET,POST,PUT,DELETE /alertas
GET,POST,PUT,DELETE /muertes
GET,POST,PUT,DELETE /tratamientos
GET,POST,PUT,DELETE /reportes
GET,POST,PUT,DELETE /settings
```

### Visión (requiere Python + cámara)
```
POST /vision/start   → Iniciar cámara (body: { cameraIndex: 0 })
POST /vision/stop    → Detener cámara
```

> El microservicio de visión (`weight_detector.py`) se ejecuta como proceso hijo de Node.js. Requiere Python 3 con las dependencias de `requirements.txt`. En Docker, Python y todas las dependencias (incluyendo `torch`, `opencv`, `numpy`, `easyocr`) se instalan automáticamente durante el build.

## 🔧 Tecnologías

- **NestJS 11** — Framework backend
- **TypeScript 5** — Lenguaje
- **TypeORM 0.3** — ORM para PostgreSQL
- **PostgreSQL 14.3** — Base de datos
- **JWT / Passport** — Autenticación
- **bcrypt** — Hash de contraseñas
- **Docker** — Containerización
- **Python 3 + OpenCV** — Visión por computadora
- **Docker Compose** — Orquestación

## 🛑 Detener la Aplicación

```bash
# Detener todo (contenedores)
docker-compose down

# Detener y limpiar volúmenes (elimina datos de PostgreSQL)
docker-compose down -v

# Detener solo la app (mantener PostgreSQL)
docker-compose stop app
```

> Los datos de PostgreSQL persisten en `./postgres/` gracias a los volúmenes de Docker. `docker-compose down` sin `-v` conserva los datos.
