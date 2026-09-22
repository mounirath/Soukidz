import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAppTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const { theme } = useAppTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const displayImages = images && images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80'];

  return (
    <View style={styles.container}>
      {/* Main Image with Fullscreen touch */}
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => setIsFullscreen(true)}
        style={styles.mainImageWrapper}
      >
        <Image
          source={{ uri: displayImages[activeIndex] }}
          style={styles.mainImage}
          contentFit="cover"
          transition={300}
        />

        {/* Counter Badge */}
        <View style={styles.counterBadge}>
          <Ionicons name="images-outline" size={13} color="#FFFFFF" />
          <Text style={styles.counterText}>
            {activeIndex + 1} / {displayImages.length}
          </Text>
        </View>

        {/* Zoom Button */}
        <View style={styles.zoomButton}>
          <Ionicons name="scan-outline" size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>

      {/* Thumbnails strip if multiple */}
      {displayImages.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbnailContainer}
        >
          {displayImages.map((imgUri, idx) => (
            <TouchableOpacity
              key={`thumb_${idx}`}
              onPress={() => setActiveIndex(idx)}
              style={[
                styles.thumbnail,
                {
                  borderColor:
                    activeIndex === idx ? theme.primary : theme.border,
                  borderWidth: activeIndex === idx ? 2.5 : 1,
                },
              ]}
              activeOpacity={0.8}
            >
              <Image
                source={{ uri: imgUri }}
                style={styles.thumbImage}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Fullscreen Modal View */}
      <Modal
        visible={isFullscreen}
        transparent={false}
        animationType="fade"
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenModal}>
          <TouchableOpacity
            style={styles.closeModalBtn}
            onPress={() => setIsFullscreen(false)}
          >
            <Ionicons name="close" size={26} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.fullscreenContent}>
            <Image
              source={{ uri: displayImages[activeIndex] }}
              style={styles.fullscreenImage}
              contentFit="contain"
            />
          </View>

          {/* Fullscreen pagination controls */}
          <View style={styles.fullscreenControls}>
            <TouchableOpacity
              disabled={activeIndex === 0}
              onPress={() => setActiveIndex((prev) => Math.max(0, prev - 1))}
              style={[
                styles.navBtn,
                activeIndex === 0 && { opacity: 0.3 },
              ]}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.fullscreenCounter}>
              {activeIndex + 1} / {displayImages.length}
            </Text>

            <TouchableOpacity
              disabled={activeIndex === displayImages.length - 1}
              onPress={() =>
                setActiveIndex((prev) => Math.min(displayImages.length - 1, prev + 1))
              }
              style={[
                styles.navBtn,
                activeIndex === displayImages.length - 1 && { opacity: 0.3 },
              ]}
            >
              <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000000',
  },
  mainImageWrapper: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.72,
    position: 'relative',
    backgroundColor: '#1E293B',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  counterBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  zoomButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailContainer: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#0F172A',
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 30,
  },
  closeModalBtn: {
    alignSelf: 'flex-end',
    marginRight: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  fullscreenControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 30,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreenCounter: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
