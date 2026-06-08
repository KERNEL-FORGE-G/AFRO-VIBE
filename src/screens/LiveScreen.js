// Live Stream Screen (LIVE)
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  Animated,
  StatusBar
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import { authService } from '../services/apiService';

const { width, height } = Dimensions.get('window');

export const LiveScreen = ({ navigation }) => {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [hearts, setHearts] = useState([]);
  const listRef = useRef();
  const currentUser = authService.getCurrentUser();

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const userComment = {
      id: 'live_c_' + Date.now(),
      username: currentUser?.username || 'Moi',
      message: commentText.trim(),
    };
    setComments(prev => [...prev, userComment]);
    setCommentText('');
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Trigger floating heart
  const addHeart = () => {
    const newHeart = {
      id: 'heart_' + Date.now(),
      left: Math.random() * 80 + 20, // random offset
      animValue: new Animated.Value(0),
    };
    setHearts(prev => [...prev, newHeart]);

    Animated.timing(newHeart.animValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      // Remove heart after animation complete
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    });
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentRow}>
      <Text style={styles.commentUser}>@{item.username}</Text>
      <Text style={styles.commentMessage}>{item.message}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Live — simulation UI (streaming réel à intégrer via YouTube/Agora) */}
      <Image 
        source={require('../assets/images/logo_main.jpg')} // Fallback backdrop
        style={styles.backdrop}
        resizeMode="cover"
      />
      <View style={styles.overlayColor} />

      {/* Top HUD */}
      <View style={styles.topHud}>
        <View style={styles.leftBadge}>
          <Text style={styles.liveTag}>LIVE</Text>
          <View style={styles.viewersBadge}>
            <SVGIcon name="profile" size={10} color={COLORS.text} style={styles.profileBadgeIcon} />
            <Text style={styles.viewersText}>Démo</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <SVGIcon name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Floating Hearts Area */}
      {hearts.map(heart => {
        const yVal = heart.animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -300],
        });
        const opacityVal = heart.animValue.interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 0.8, 0],
        });
        const scaleVal = heart.animValue.interpolate({
          inputRange: [0, 0.2, 1],
          outputRange: [0.5, 1.2, 0.8],
        });

        return (
          <Animated.View
            key={heart.id}
            style={[
              styles.floatingHeart,
              {
                right: heart.left,
                opacity: opacityVal,
                transform: [
                  { translateY: yVal },
                  { scale: scaleVal }
                ]
              }
            ]}
          >
            <SVGIcon name="heart" size={32} color={COLORS.secondary} />
          </Animated.View>
        );
      })}

      {/* Bottom Layout: Chat & Reactions */}
      <View style={styles.bottomSection}>
        {/* Comments scrolling box */}
        <View style={styles.commentsBox}>
          <FlatList
            ref={listRef}
            data={comments}
            keyExtractor={item => item.id}
            renderItem={renderComment}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              <Text style={styles.emptyLiveComments}>
                Soyez le premier à commenter ce live !
              </Text>
            }
          />
        </View>

        {/* Input & Gift Buttons */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.chatInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Ajouter un commentaire..."
            placeholderTextColor={COLORS.textSecondary}
            onSubmitEditing={handleSendComment}
          />

          <TouchableOpacity style={styles.giftBtn} onPress={addHeart}>
            <SVGIcon name="heart" size={24} color={COLORS.accent} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  overlayColor: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(19,9,27,0.4)',
  },
  topHud: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: SPACING.md,
  },
  leftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveTag: {
    color: COLORS.text,
    backgroundColor: COLORS.liveBadge,
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 6,
  },
  viewersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileBadgeIcon: {
    marginRight: 4,
  },
  viewersText: {
    color: COLORS.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 6,
  },
  floatingHeart: {
    position: 'absolute',
    bottom: 90,
    zIndex: 100,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: SPACING.md,
  },
  commentsBox: {
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  commentRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  commentUser: {
    color: COLORS.accent,
    fontWeight: 'bold',
    fontSize: 12,
    marginRight: 6,
  },
  commentMessage: {
    color: COLORS.text,
    fontSize: 12,
    flex: 1,
  },
  emptyLiveComments: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 40,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 22,
    paddingHorizontal: SPACING.md,
    color: COLORS.text,
    fontSize: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  giftBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
});

export default LiveScreen;
