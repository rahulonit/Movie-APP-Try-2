import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { fetchProfiles, setActiveProfile } from '../store/slices/profileSlice';

export default function ProfileSelectionScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { profiles } = useSelector((state: RootState) => state.profile);

  useEffect(() => {
    dispatch(fetchProfiles());
  }, []);

  const handleSelectProfile = (profile: any) => {
    dispatch(setActiveProfile(profile));
  };

  const renderProfile = ({ item }: any) => (
    <TouchableOpacity
      style={styles.profileCard}
      onPress={() => handleSelectProfile(item)}
    >
      <Image
        source={{ uri: item.avatar }}
        style={styles.avatar}
      />
      <Text style={styles.profileName}>{item.name}</Text>
      {item.isKids && <Text style={styles.kidsLabel}>Kids</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Who's watching?</Text>
      <FlatList
        data={profiles}
        renderItem={renderProfile}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.list}
      />
      {profiles.length < 5 && (
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 40,
  },
  list: {
    alignItems: 'center',
  },
  profileCard: {
    alignItems: 'center',
    margin: 20,
    width: 120,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginBottom: 12,
  },
  profileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  kidsLabel: {
    color: '#808080',
    fontSize: 12,
    marginTop: 4,
  },
  addButton: {
    alignSelf: 'center',
    marginTop: 20,
    padding: 16,
  },
  addButtonText: {
    color: '#808080',
    fontSize: 16,
  },
});
