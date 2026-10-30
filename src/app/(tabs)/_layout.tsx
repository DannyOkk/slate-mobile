import { NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabsLayout() {
  return (
    <NativeTabs backgroundColor="#0F172A" indicatorColor="#1E293B">
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Inicio</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="clients">
        <NativeTabs.Trigger.Icon sf="person.2.fill" md="people" />
        <NativeTabs.Trigger.Label>Clientes</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="debtors">
        <NativeTabs.Trigger.Icon sf="creditcard.fill" md="account_balance_wallet" />
        <NativeTabs.Trigger.Label>Quién me debe</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
