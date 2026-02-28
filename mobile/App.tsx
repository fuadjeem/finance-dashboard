import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import DashboardMock from './screens/DashboardMock';

export default function App() {
  return (
    <View style={styles.container}>
      <DashboardMock />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
