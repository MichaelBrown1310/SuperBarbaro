# 📦 Gestor de Ventas

Aplicación web desarrollada para la gestión integral de ventas, inventario y análisis inteligente en un food truck, permitiendo optimizar la operación diaria y la toma de decisiones basada en datos.

## 🚀 Características

🛒 Módulo de Ventas
- ✅ Registro de ventas con: 
  - Fecha y hora
  - Productos y cantidades
  - Tipo de venta (presencial o domicilio)
- ✅ Buscador dinámico de productos para agilizar ventas.
- ✅ Modificación o cancelación de ventas en estado “Recibido”.
- ✅ Restricción de edición cuando la venta está en “Preparación”.
- ✅ Cálculo automático del total de la venta. 
- ✅ Historial completo de ventas almacenado. 

📦 Módulo de Inventarios
- ✅ Registro de entradas de insumos (producto, valor, cantidad).
- ✅ Descuento automático de inventario al confirmar ventas.
- ✅ Cancelación de ventas sin afectar inventario (estado “Recibido”).
- ✅ Visualización de stock en tiempo real.
- ✅ Alertas de stock mínimo.
- ✅ Historial de movimientos de inventario.

📊 Módulo de Análisis y Machine Learning
- ✅ Reportes de ventas diarias.
- ✅ Identificación de productos más y menos vendidos.
- ✅ Análisis de franjas horarias de mayor demanda.
- ✅ Comparación entre ventas presenciales y domicilios.
- ✅ Entrenamiento de modelo de Machine Learning con datos históricos.
- ✅ Predicción de demanda futura (día, hora, clima, festivos).
- ✅ Estimación de inventario necesario según predicciones.

## 🛠️ Tecnologías usadas

🔧 Backend
- Node.js
- Express.js

🎨 Frontend
- Ionic 
- HTML, CSS, TypeScript

🗄️ Base de Datos
- MySQL / SQL (archivo superbarbaro.sql)


## 📂 Estructura del proyecto


## ⚙️ Instalación y uso

1. Clona este repositorio:
   ```bash
   git clone https://github.com/MichaelBrown1310/SuperBarbaro
   cd superbarbaro

2. Ingresa a la carpeta del backend:
    ```bash
    cd backend

3. Ejecuta el servidor:
    ```bash
    node server.js

4. Abre una nueva terminal y ubícate en la carpeta del frontend:
    ```bash
    cd SuperBarbaro

5. Ejecuta la aplicación:
    ```bash
    ionic serve

6. Credenciales de acceso:
    Usuario: admin
    Contraseña: 1234

💡 Notas importantes
- Asegúrate de tener instalado:
  - Node.js
  - Ionic CLI (npm install -g @ionic/cli)
- El backend debe estar corriendo antes del frontend.
- Verificar que los puertos no estén en uso.


## 📸 Capturas de pantalla

- Mockups de bajo nivel 
  - Vistas de administrador 🧑‍💼
 <p align="center">
    <img src="mockups/Captura de pantalla 2026-03-20 200424.png" 

<p align="center">
    <img src="mockups/Captura de pantalla 2026-03-20 200502.png" 

<p align="center">
    <img src="mockups/Captura de pantalla 2026-03-20 200522.png"

<p align="center">
    <img src="mockups/Captura de pantalla 2026-03-20 200756.png" 
  
  - Vistas cajero💵
<p align="center">
    <img src="mockups/Captura de pantalla 2026-03-20 200816.png" 

  - Vistas cocinero 👨‍🍳
<p align="center">
    <img src="mockups/Captura de pantalla 2026-03-20 200836.png" 



## 👨‍💻 Autores

- Valeria Gonzalez
 📧[GitHub](https://github.com/ValeriaGonzalezE)

- Michael Moreno
 📧[GitHub](https://github.com/MichaelBrown1310)

- Juan Camilo Zapata
 📧[GitHub](https://github.com/juan-zapata12)