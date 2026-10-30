import * as Notifications from 'expo-notifications';
import {
  AndroidImportance,
  IosAuthorizationStatus,
  SchedulableTriggerInputTypes,
} from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configuración global del handler de notificaciones en primer plano (foreground).
 * Permite que las notificaciones locales se muestren con alerta y sonido aun con la app abierta.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Inicializa el canal de notificaciones en Android para alertas de alta prioridad.
 */
export async function setupAndroidNotificationChannel(): Promise<void> {
  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Recordatorios de Cobro',
        importance: AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#208AEF',
        enableVibrate: true,
      });
    } catch (error) {
      console.warn('[setupAndroidNotificationChannel] Canal por defecto administrado por el sistema:', error);
    }
  }
}

/**
 * Solicita permisos de notificación al sistema operativo.
 * Retorna true si fueron otorgados o si ya se encontraban activos.
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  await setupAndroidNotificationChannel();

  const currentPermissions = await Notifications.getPermissionsAsync();
  let isGranted =
    currentPermissions.granted ||
    currentPermissions.ios?.status ===
      IosAuthorizationStatus.PROVISIONAL;

  if (!isGranted) {
    const requestResult = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
      },
    });

    isGranted =
      requestResult.granted ||
      requestResult.ios?.status ===
        IosAuthorizationStatus.PROVISIONAL;
  }

  return isGranted;
}

/**
 * Programa una notificación local de recordatorio de cobro para una fecha y hora específica.
 *
 * @param clientName Nombre del cliente deudor.
 * @param debtAmount Monto total adeudado.
 * @param date Fecha y hora en la que debe sonar el recordatorio.
 * @returns El identificador de la notificación programada.
 */
export async function schedulePaymentReminder(
  clientName: string,
  debtAmount: number,
  date: Date
): Promise<string> {
  if (date.getTime() <= Date.now()) {
    throw new Error('La fecha y hora del recordatorio deben ser en el futuro.');
  }

  await setupAndroidNotificationChannel();

  const formattedAmount = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(debtAmount);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de Cobro - Slate',
      body: `Cobrar a ${clientName} - Saldo adeudado: $${formattedAmount}`,
      sound: true,
      data: {
        type: 'PAYMENT_REMINDER',
        clientName,
        debtAmount,
        scheduledAt: date.toISOString(),
      },
    },
    trigger: {
      type: SchedulableTriggerInputTypes.DATE,
      date,
    },
  });

  return notificationId;
}

/**
 * Cancela una notificación programada existente por su identificador.
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Obtiene la lista completa de notificaciones locales actualmente programadas.
 */
export async function getAllScheduledNotifications(): Promise<
  Notifications.NotificationRequest[]
> {
  return await Notifications.getAllScheduledNotificationsAsync();
}

export const notificationService = {
  requestNotificationPermissions,
  schedulePaymentReminder,
  cancelNotification,
  getAllScheduledNotifications,
  setupAndroidNotificationChannel,
};

export default notificationService;
