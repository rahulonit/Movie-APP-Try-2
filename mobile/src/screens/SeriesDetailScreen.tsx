import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SeriesDetailScreen({ route, navigation }: any) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Series Detail Screen (Similar to Movie)</Text>
      <Text style={styles.subtext}>Implement seasons and episodes list</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
  subtext: {
    color: '#808080',
    fontSize: 14,
    marginTop: 8,
  },
});
