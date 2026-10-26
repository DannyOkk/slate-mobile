# Slate Mobile 📱

> **Libreta de Fiado Digital y Gestión de Clientes para Comercios de Barrio y Kioscos**

**Slate Mobile** es la aplicación móvil complementaria de la plataforma **Slate**, diseñada para sustituir el cuaderno de fiados tradicional de papel por una solución digital moderna, rápida y confiable. Permite a pequeños comerciantes registrar fiados y cobros en tiempo real, visualizar el scoring de riesgo de cada cliente, consultar rápidamente la lista priorizada de deudores y programar recordatorios de cobro con notificaciones locales en el teléfono.

---

## 🌟 Características Principales

- 👥 **Gestión Completa de Clientes**: Registro, edición, eliminación y búsqueda reactiva de clientes por nombre, teléfono o dirección. Accesos rápidos para llamadas telefónicas y contacto vía WhatsApp.
- 📒 **Libreta Digital y Cuenta Corriente**: Registro instantáneo de movimientos de **Fiado** (ventas a crédito) y **Pagos** (cobros), con cálculo automático del saldo acumulado.
- 💰 **Módulo "Quién me debe"**: Pantalla consolidada que lista a todos los clientes con saldo deudor pendiente, ordenados automáticamente de mayor a menor monto, con métricas globales del total por cobrar.
- 🛡️ **Indicador de Nivel de Riesgo**: Evaluación en tiempo real del riesgo crediticio del cliente categorizado en tres niveles visuales con etiquetas e íconos:
  - 🟢 **Riesgo Bajo**: Cliente sin deuda o al día.
  - 🟡 **Riesgo Medio**: Deuda moderada y reciente.
  - 🔴 **Riesgo Alto**: Deuda superior a $50.000 o inactividad en pagos mayor a 30 días.
- ⏰ **Recordatorios de Cobro (Notificaciones Locales)**: Programación de alarmas y notificaciones con sonido en el dispositivo para clientes con saldo pendiente, con selector interactivo de fecha/hora y atajos rápidos (*"Mañana 09:00"*, *"En 3 días"*, etc.).
- 🔐 **Autenticación Segura**: Flujo completo de Registro e Inicio de Sesión con tokens JWT almacenados de forma segura mediante `expo-secure-store`.

---

## 🛠️ Stack Tecnológico

| Capa / Módulo | Tecnología | Versión / Detalle |
| :--- | :--- | :--- |
| **Framework Base** | [React Native](https://reactnative.dev/) | `0.88.0` |
| **Plataforma Mobile** | [Expo](https://expo.dev/) (Managed Workflow) | SDK `^58.0.19` |
| **Enrutamiento** | [Expo Router](https://docs.expo.dev/router/introduction/) | `~58.0.26` (File-based Routing) |
| **Lenguaje** | [TypeScript](https://www.typescriptlang.org/) | `~6.0.3` (Strict Mode) |
| **Cliente HTTP** | [Axios](https://axios-http.com/) | `^1.20.0` (Con interceptores JWT y manejo de red) |
| **Almacenamiento Seguro** | [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/) | `~58.0.2` |
| **Notificaciones Locales** | [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/) | `~58.1.6` |
| **Selectores de Fecha/Hora** | [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) | `9.2.1` |
| **Estilos e Iconografía** | Vanilla StyleSheet & `@expo/vector-icons` | Sistema de diseño Dark Slate (`#0F172A`, `#1E293B`, `#38BDF8`) |

---

## 📋 Requisitos Previos

Antes de ejecutar la aplicación, asegurate de contar con lo siguiente:

1. **Node.js**: Versión **18.0.0 o superior** instalada en tu equipo ([Descargar Node.js](https://nodejs.org/)).
2. **Gestor de paquetes**: `npm` (incluido con Node.js).
3. **Dispositivo Móvil**:
   - Teléfono físico con **Android** o **iOS**.
   - Aplicación **Expo Go** instalada:
     - [Expo Go en Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
     - [Expo Go en App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)
4. **Conexión de Red**: Tu computadora (donde corre el backend y Expo) y tu teléfono celular **deben estar conectados a la misma red Wi-Fi local**.
5. **Backend en Ejecución**: Tener corriendo el servidor backend Spring Boot ([slate-backend](https://github.com/DannyOkk/slate-backend)) en el puerto `8080`.

---

## ⚙️ Configuración de Variables de Entorno

La aplicación móvil necesita comunicarse con la API REST del backend a través de la red local.

### 1. Duplicar la plantilla de entorno
En la raíz del proyecto `slate-mobile`, copiá el archivo `.env.example` para generar tu archivo `.env`:

```bash
# En Windows (PowerShell):
Copy-Item .env.example .env

# En Linux o macOS / Git Bash:
cp .env.example .env
```

### 2. Obtener la dirección IP local de tu computadora

> [!IMPORTANT]
> **No utilices `localhost` ni `127.0.0.1`**: Tu celular es un dispositivo independiente dentro de la red. Si ponés `localhost`, el celular intentará conectarse a sí mismo y la conexión fallará. Debés configurar la dirección IP local (IPv4) de la máquina donde corre el backend.

- **En Windows**:
  1. Abrí una terminal de PowerShell o CMD.
  2. Ejecutá el comando:
     ```bash
     ipconfig
     ```
  3. Buscá el adaptador de red Wi-Fi activo y localizá la línea:
     `Dirección IPv4. . . . . . . . . . . : 192.168.X.X`

- **En macOS / Linux**:
  1. Abrí la terminal.
  2. Ejecutá:
     ```bash
     # macOS:
     ipconfig getifaddr en0
     
     # Linux:
     hostname -I
     ```

### 3. Configurar `.env`
Abrí el archivo `.env` y asigná la IP local obtenida junto con el puerto `8080`:

```env
EXPO_PUBLIC_API_URL=http://192.168.100.13:8080/api
```
*(Reemplazá `192.168.100.13` por la IP real de tu máquina).*

---

## 🚀 Pasos de Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/DannyOkk/slate-mobile.git
cd slate-mobile
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo de Expo
```bash
npx expo start
```

Si realizaste cambios recientes en variables de entorno o dependencias, podés iniciar limpiando la caché:
```bash
npx expo start -c
```

---

## 📲 Instrucciones de Uso y Prueba en Celular

Una vez que ejecutes `npx expo start`, la terminal mostrará un código QR y los controles del Metro Bundler:

```text
Waiting on http://localhost:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
› Press r │ reload app
› Press m │ toggle menu
```

### Para probar en Android:
1. Abrí la app **Expo Go** en tu celular.
2. Tocá la opción **"Scan QR code"**.
3. Apuntá la cámara a la terminal para escanear el código QR.
4. La aplicación compilará los bundles JavaScript y abrirá la pantalla de bienvenida.

### Para probar en iOS:
1. Abrí la app nativa de **Cámara** en tu iPhone.
2. Escaneá el código QR mostrado en la terminal.
3. Tocá el banner superior que dice **"Abrir en Expo Go"**.

---

## 🧪 Flujo de Prueba Recomendado

Para verificar todas las funcionalidades integradas:

1. **Autenticación**:
   - Registrá una nueva cuenta de comerciante (Nombre, Email, Teléfono, Contraseña) o iniciá sesión si ya contás con credenciales.
2. **Cartera de Clientes**:
   - Desde la pantalla principal, ingresá a **"Clientes"**.
   - Presioná el botón **"+ Nuevo"** o el botón flotante (FAB) para dar de alta a tu primer cliente.
   - Probá la barra de búsqueda en tiempo real.
3. **Libreta de Fiados y Cuenta Corriente**:
   - Tocá la tarjeta de un cliente para acceder a su ficha detallada.
   - Presioná **"+ Registrar Fiado"** para asentar una venta a crédito (por ejemplo: `$ 2.500,00`).
   - Verificá que el saldo acumulado se actualice al instante y que el badge de riesgo se recalcule automáticamente.
   - Presioná **"- Registrar Pago"** para asentar un cobro parcial o total.
4. **Recordatorios de Cobro**:
   - En un cliente con deuda pendiente, presioná **"Programar Recordatorio de Cobro"** (o el ícono de campana en la cabecera).
   - Autorizá los permisos de notificación en tu celular.
   - Elegí un atajo rápido (ej. *"Mañana 09:00"*) o personalizá fecha y hora con el selector nativo.
   - Confirmá la programación y recibirás la notificación local con sonido y alerta en pantalla.
5. **Módulo "Quién me debe"**:
   - Regresá a la pantalla principal o presioná el botón **"Deudores"** en la cabecera de clientes.
   - Consultá la tarjeta global de total adeudado y utilizá los accesos directos para llamar o enviar mensaje de WhatsApp al deudor.

---

## 🔧 Solución de Problemas Frecuentes (Troubleshooting)

### 1. `[API Error de Red] No se pudo conectar con el servidor`
- **Causa común**: El Firewall de Windows está bloqueando las conexiones entrantes al puerto `8080`, o la IP del archivo `.env` es incorrecta.
- **Solución**:
  1. Verificá que la PC y el celular estén conectados a la **misma red Wi-Fi** (evitá redes públicas o datos móviles con aislamiento de clientes).
  2. En Windows Defender Firewall, creá una regla de entrada permitiendo conexiones TCP en el puerto `8080` (o permití el ejecutable `java.exe` de tu JDK).
  3. Probá abrir el navegador de tu celular e ingresar a: `http://<TU_IP_LOCAL>:8080/api/health` o `/api/clients`. Si no carga desde el navegador del celular, es un bloqueo de red o firewall.

### 2. Cambios de IP por DHCP
- Si reiniciás tu router Wi-Fi o te reconectás, tu computadora puede recibir una nueva IP local (ej. cambiar de `192.168.100.13` a `192.168.100.25`).
- Actualizá la variable en el archivo `.env` y reiniciá Expo con:
  ```bash
  npx expo start -c
  ```

### 3. Las notificaciones no se muestran
- Asegurate de haber concedido permisos de notificación a la app Expo Go en los ajustes de tu sistema operativo (`Ajustes > Aplicaciones > Expo Go > Notificaciones > Permitir`).

---

## 📁 Estructura del Proyecto

```text
slate-mobile/
├── assets/                     # Íconos, splash screen y recursos estáticos
├── src/
│   ├── api/                    # Configuración base del cliente HTTP
│   ├── app/                    # Rutas y pantallas de Expo Router (_layout, index, login, clients, etc.)
│   ├── components/             # Componentes reutilizables
│   │   ├── clients/            # ClientCard, ClientFormModal
│   │   ├── debtors/            # DebtorCard
│   │   ├── reminders/          # ReminderModal (DateTimePicker & Presets)
│   │   ├── transactions/       # TransactionItem, AddTransactionModal
│   │   └── RiskBadge.tsx       # Insignia dinámica de nivel de riesgo crediticio
│   ├── context/                # Contextos globales (AuthContext)
│   ├── screens/                # Vistas principales (HomeScreen, ClientListScreen, ClientDetailScreen, etc.)
│   ├── services/               # Capa de servicios (api, authService, clientService, debtorService, notificationService)
│   └── types/                  # Definiciones e interfaces de TypeScript (client, debtor, transaction)
├── .env.example                # Plantilla de variables de entorno
├── app.json                    # Configuración de Expo y plugins nativos
├── package.json                # Dependencias y scripts de ejecución
├── ROADMAP.md                  # Estado y avance de sprints del proyecto
└── tsconfig.json               # Configuración estricta de TypeScript
```

---

## 📜 Scripts Disponibles

En la raíz del proyecto podés ejecutar:

| Comando | Descripción |
| :--- | :--- |
| `npm run start` | Inicia el servidor de desarrollo de Metro Bundler. |
| `npm run android` | Inicia el servidor e intenta abrir en emulador Android local. |
| `npm run ios` | Inicia el servidor e intenta abrir en simulador iOS local. |
| `npm run lint` | Ejecuta el linter estático oficial de Expo (`npx expo lint`). |
| `npx tsc --noEmit` | Valida tipos de TypeScript en todo el proyecto sin generar archivos. |

---

## 📄 Licencia

Este proyecto se distribuye bajo los términos de la licencia MIT.