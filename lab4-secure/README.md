# Lab 4: Angular Frontend

## 🎯 Objetivo
Crear una aplicación Angular con interfaz de chat que se conecte al API Gateway del Lab 3 y se despliegue en S3 como sitio web estático.

## 🏗️ Arquitectura
- **Angular App**: Interfaz web moderna y responsive
- **S3 Static Website**: Hosting simple y económico
- **Config JSON**: URL del API Gateway configurable sin recompilar

## 📋 Prerequisitos
- Node.js 18+ y npm
- Angular CLI: `npm install -g @angular/cli`
- AWS CLI configurado con profile `default`
- Terraform instalado
- Lab 3 desplegado (API Gateway funcionando)

## 🚀 Despliegue

### Despliegue automático:
```bash
./deploy.sh
```

### Despliegue manual:
```bash
# 1. Instalar dependencias
npm install

# 2. Construir aplicación
npm run build:prod

# 3. Crear infraestructura S3
terraform init
terraform apply

# 4. Subir archivos
BUCKET_NAME=$(terraform output -raw bucket_name)
aws s3 sync dist/aje-delivery-assistant/ s3://$BUCKET_NAME --delete --profile default
```

## ⚙️ Configuración

### Cambiar URL del API Gateway:
Edita `src/config.json`:
```json
{
  "apiGatewayUrl": "https://tu-nueva-url.execute-api.us-east-1.amazonaws.com/prod/query"
}
```

Luego sube solo el archivo de configuración:
```bash
aws s3 cp src/config.json s3://bucket-name/config.json --profile default
```

**¡No necesitas recompilar Angular!**

## 🎨 Características de la UI

### Interfaz Moderna:
- 💬 Chat conversacional en tiempo real
- 🎨 Diseño gradient moderno
- 📱 Responsive (desktop y móvil)
- ⚡ Carga rápida y optimizada

### Funcionalidades:
- **Sugerencias iniciales**: Preguntas predefinidas
- **Historial de chat**: Mantiene conversación
- **Indicadores visuales**: Loading spinners
- **Manejo de errores**: Mensajes informativos
- **Fuentes de información**: Muestra documentos utilizados

### Ejemplos de Preguntas:
- "¿Qué productos de abarrotes tienen disponibles?"
- "¿Cuáles son los precios de los productos?"
- "¿Cómo funciona el servicio de delivery?"
- "¿Cómo puedo hacer un pedido?"

## 🔧 Desarrollo Local

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start

# La app estará en http://localhost:4200
```

## 📊 Estructura del Proyecto

```
src/
├── app/
│   └── app.component.ts    # Componente principal con lógica de chat
├── config.json             # Configuración del API Gateway
├── index.html              # HTML principal
├── main.ts                 # Bootstrap de Angular
└── styles.css              # Estilos globales
```

## 💰 Costos

### S3 Static Website:
- **Almacenamiento**: ~$0.023/GB/mes
- **Requests**: ~$0.0004/1000 requests
- **Transferencia**: ~$0.09/GB

**Costo estimado mensual**: < $1 USD para una demo

## 🔍 Troubleshooting

### Error de CORS:
- Verificar que el API Gateway tenga CORS habilitado
- Comprobar que la URL en `config.json` sea correcta

### App no carga:
```bash
# Verificar bucket policy
aws s3api get-bucket-policy --bucket bucket-name --profile default

# Verificar website configuration
aws s3api get-bucket-website --bucket bucket-name --profile default
```

### Actualizar solo configuración:
```bash
# Cambiar URL en config.json y subir
aws s3 cp src/config.json s3://bucket-name/config.json --profile default
```

## 🧹 Limpieza

```bash
# Eliminar recursos AWS
terraform destroy

# Limpiar node_modules
rm -rf node_modules dist
```

## 📁 Archivos Clave

- `src/config.json` - **URL del API Gateway (configurable)**
- `src/app/app.component.ts` - Lógica principal del chat
- `main.tf` - Infraestructura S3
- `deploy.sh` - Script de despliegue automático

## 🌐 URL Final

Después del despliegue:
```
http://aje-delivery-assistant-xxxxxxxx.s3-website-us-east-1.amazonaws.com
```

**¡Interfaz moderna, económica y fácil de mantener!**
