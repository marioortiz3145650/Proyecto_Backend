FROM node:20-bookworm-slim

WORKDIR /app

# Cambiar las fuentes a HTTPS debido a bloqueos de red en puerto 80 e instalar dependencias
RUN sed -i 's/http:/https:/g' /etc/apt/sources.list.d/debian.sources && \
    apt-get -o Acquire::https::Verify-Peer=false update && \
    apt-get -o Acquire::https::Verify-Peer=false install -y --no-install-recommends \
    ca-certificates \
    python3 \
    python3-pip \
    python3-venv \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*


COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY requirements.txt .
RUN pip3 install --no-cache-dir --break-system-packages torch torchvision --index-url https://download.pytorch.org/whl/cpu && \
    pip3 install --no-cache-dir --break-system-packages -r requirements.txt

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 5000

CMD ["node", "dist/src/main"]

