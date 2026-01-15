import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import apiService from '../services/api';

const { width, height } = Dimensions.get('window');

export default function VideoPlayerScreen({ route, navigation }: any) {
  const { playbackId, title, contentId, contentType, episodeId } = route.params;
  const { activeProfile } = useSelector((state: RootState) => state.profile);
  
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isBuffering, setIsBuffering] = useState(true);
  const progressIntervalRef = useRef<any>(null);

  const streamUrl = `https://stream.mux.com/${playbackId}.m3u8`;

  useEffect(() => {
    // Update progress every 5 seconds
    progressIntervalRef.current = setInterval(() => {
      if (status.isPlaying && activeProfile) {
        updateProgress();
      }
    }, 5000);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Save final progress on unmount
      if (status.positionMillis && activeProfile) {
        updateProgress();
      }
    };
  }, [status, activeProfile]);

  const updateProgress = async () => {
    try {
      await apiService.updateProgress({
        profileId: activeProfile._id,
        contentId,
        contentType,
        episodeId,
        progress: Math.floor(status.positionMillis / 1000),
        duration: Math.floor(status.durationMillis / 1000),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Video
        ref={videoRef}
        source={{ uri: streamUrl }}
        style={styles.video}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        onPlaybackStatusUpdate={(status) => setStatus(status)}
        onLoadStart={() => setIsBuffering(true)}
        onLoad={() => setIsBuffering(false)}
      />

      {isBuffering && (
        <View style={styles.bufferingContainer}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.bufferingText}>Loading...</Text>
        </View>
      )}

      {title && (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
  },
  video: {
    width,
    height,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  bufferingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  bufferingText: {
    color: '#fff',
    marginTop: 12,
    fontSize: 16,
  },
  titleContainer: {
    position: 'absolute',
    top: 50,
    left: 70,
    right: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
