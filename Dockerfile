FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero para cachear la capa de Docker
COPY package*.json ./

RUN npm install --legacy-peer-deps

# Copiar el resto de los archivos de la aplicación
COPY . .

# Compilar la aplicación de NestJS
RUN npm run build

EXPOSE 3000

# Comando para arrancar el servidor en producción
CMD ["node", "dist/main"]
