import os

filepath = 'src/screens/FeedScreen.js'
with open(filepath, 'rb') as f:
    content = f.read()

# Define the new component for video items
new_component = b'''
const VideoItem = memo(({ item, index, isFocused, currentVisibleIndex, commentsVisible, userPaused, handleVideoTap, navigation, handleFollowCreator, handleLike, openComments, handleShare, handleBookmark, handleSaveOffline }) => {
    const isPlaying = isFocused && index === currentVisibleIndex;
    const isCurrentItem = index === currentVisibleIndex;
    const forcePaused = !isPlaying || commentsVisible || (isCurrentItem && userPaused);
    const canTapVideo = isCurrentItem && isFocused && !commentsVisible;

    const animValue = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      if (isCurrentItem) {
        animValue.setValue(0);
        Animated.spring(animValue, {
          toValue: 1,
          tension: 20,
          friction: 7,
          useNativeDriver: true,
        }).start();
      }
    }, [isCurrentItem, animValue]);

    const slideAnim = animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    const opacityAnim = animValue.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0, 1],
    });

    return (
      <View style={styles.videoContainer}>
        <VideoPlayerView
          videoUrl={item.videoUrl}
          paused={forcePaused}
          thumbnail={item.thumbnail}
          enableTapControls={false}
          showPauseIndicator={isCurrentItem && userPaused && !commentsVisible}
        />

        {canTapVideo && (
          <Pressable
            style={styles.tapOverlay}
            onPress={() => handleVideoTap(item.id)}
            accessibilityRole="button"
            accessibilityLabel={userPaused ? 'Lire la vidéo' : 'Mettre en pause'}
          />
        )}

        <Animated.View
          style={[
            styles.bottomInfoContainer,
            { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }
          ]}
          pointerEvents="box-none"
        >
          <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user.uid })}>
            <Text style={styles.username}>@{item.user.username}</Text>
          </TouchableOpacity>
          {item.user.isVerified && (
            <SVGIcon name="verified" size={14} style={styles.verifiedIcon} />
          )}
          <Text style={styles.caption} numberOfLines={3}>{item.caption}</Text>

          <View style={styles.musicContainer}>
            <SVGIcon name="music" size={14} color={COLORS.text} style={styles.musicIcon} />
            <Text style={styles.musicText} numberOfLines={1}>{item.audioName}</Text>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.rightButtonsPanel,
            { opacity: opacityAnim, transform: [{ translateX: slideAnim }] }
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.avatarContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: item.user.uid })}>
              <Image
                source={item.user?.avatar ? { uri: configService.fixMediaUrl(item.user.avatar) } : require('../assets/images/logo.jpg')}
                style={styles.creatorAvatar}
              />
            </TouchableOpacity>
            {!item.user.isFollowing && item.user.uid !== authService.getCurrentUser()?.uid && (
              <TouchableOpacity
                style={styles.followBtn}
                onPress={() => handleFollowCreator(item.user.uid)}
              >
                <Text style={styles.followBtnText}>+</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <SVGIcon
              name="heart"
              size={36}
              color={item.isLiked ? COLORS.secondary : COLORS.text}
            />
            <Text style={styles.actionText}>{item.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => openComments(item.id)}
          >
            <SVGIcon name="comment" size={34} color={COLORS.text} />
            <Text style={styles.actionText}>{item.commentsCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleShare(item)}
          >
            <SVGIcon name="share" size={32} color={COLORS.text} />
            <Text style={styles.actionText}>{item.shares}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleBookmark(item)}
          >
            <SVGIcon
              name="inbox"
              size={30}
              color={item.isBookmarked ? COLORS.accent : COLORS.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleSaveOffline(item)}
          >
            <SVGIcon name="settings" size={28} color={COLORS.text} />
          </TouchableOpacity>

          <SpinVinyl isPlaying={isPlaying && !commentsVisible && !(isCurrentItem && userPaused)} />
        </Animated.View>
      </View>
    );
});
'''

# Place the component after SpinVinyl
content = content.replace(b'  );\r\n});', b'  );\r\n});' + new_component)

# Replace the original renderVideoItem in FeedScreen
search_orig_render = b'''  const renderVideoItem = ({ item, index }) => {\r\n    const isPlaying = isFocused && index === currentVisibleIndex;\r\n    const isCurrentItem = index === currentVisibleIndex;\r\n    const forcePaused = !isPlaying || commentsVisible || (isCurrentItem && userPaused);\r\n    const canTapVideo = isCurrentItem && isFocused && !commentsVisible;\r\n\r\n    // Entrance animation for content\r\n    const animValue = useRef(new Animated.Value(0)).current;\r\n    useEffect(() => {\r\n      if (isCurrentItem) {\r\n        animValue.setValue(0);\r\n        Animated.spring(animValue, {\r\n          toValue: 1,\r\n          tension: 20,\r\n          friction: 7,\r\n          useNativeDriver: true,\r\n        }).start();\r\n      }\r\n    }, [isCurrentItem, animValue]);\r\n\r\n    const slideAnim = animValue.interpolate({\r\n      inputRange: [0, 1],\r\n      outputRange: [50, 0],\r\n    });\r\n\r\n    const opacityAnim = animValue.interpolate({\r\n      inputRange: [0, 0.5, 1],\r\n      outputRange: [0, 0, 1],\r\n    });\r\n    \r\n    return (\r\n      <View style={styles.videoContainer}>\r\n        <VideoPlayerView \r\n          videoUrl={item.videoUrl} \r\n          paused={forcePaused} \r\n          thumbnail={item.thumbnail}\r\n          enableTapControls={false}\r\n          showPauseIndicator={isCurrentItem && userPaused && !commentsVisible}\r\n        />\r\n\r\n        {canTapVideo && (\r\n          <Pressable\r\n            style={styles.tapOverlay}\r\n            onPress={() => handleVideoTap(item.id)}\r\n            accessibilityRole="button"\r\n            accessibilityLabel={userPaused ? \'Lire la vidéo\' : \'Mettre en pause\'}\r\n          />\r\n        )}\r\n\r\n        <Animated.View \r\n          style={[\r\n            styles.bottomInfoContainer, \r\n            { opacity: opacityAnim, transform: [{ translateY: slideAnim }] }\r\n          ]} \r\n          pointerEvents="box-none"\r\n        >\r\n          <TouchableOpacity onPress={() => navigation.navigate(\'Profile\', { userId: item.user.uid })}>\r\n            <Text style={styles.username}>@{item.user.username}</Text>\r\n          </TouchableOpacity>\r\n          {item.user.isVerified && (\r\n            <SVGIcon name="verified" size={14} style={styles.verifiedIcon} />\r\n          )}\r\n          <Text style={styles.caption} numberOfLines={3}>{item.caption}</Text>\r\n          \r\n          <View style={styles.musicContainer}>\r\n            <SVGIcon name="music" size={14} color={COLORS.text} style={styles.musicIcon} />\r\n            <Text style={styles.musicText} numberOfLines={1}>{item.audioName}</Text>\r\n          </View>\r\n        </Animated.View>\r\n\r\n        <Animated.View \r\n          style={[\r\n            styles.rightButtonsPanel,\r\n            { opacity: opacityAnim, transform: [{ translateX: slideAnim }] }\r\n          ]} \r\n          pointerEvents="box-none"\r\n        >\r\n          {/* Creator Profile Bubble */}\r\n          <View style={styles.avatarContainer}>\r\n            <TouchableOpacity onPress={() => navigation.navigate(\'Profile\', { userId: item.user.uid })}>\r\n              <Image \r\n                source={item.user?.avatar ? { uri: configService.fixMediaUrl(item.user.avatar) } : require(\'../assets/images/logo.jpg\')}\r\n                style={styles.creatorAvatar} \r\n              />\r\n            </TouchableOpacity>\r\n            {!item.user.isFollowing && item.user.uid !== authService.getCurrentUser()?.uid && (\r\n              <TouchableOpacity \r\n                style={styles.followBtn}\r\n                onPress={() => handleFollowCreator(item.user.uid)}\r\n              >\r\n                <Text style={styles.followBtnText}>+</Text>\r\n              </TouchableOpacity>\r\n            )}\r\n          </View>\r\n\r\n          {/* Like Button */}\r\n          <TouchableOpacity \r\n            style={styles.actionButton} \r\n            onPress={() => handleLike(item.id)}\r\n          >\r\n            <SVGIcon \r\n              name="heart" \r\n              size={36} \r\n              color={item.isLiked ? COLORS.secondary : COLORS.text} \r\n            />\r\n            <Text style={styles.actionText}>{item.likes}</Text>\r\n          </TouchableOpacity>\r\n\r\n          {/* Comment Button */}\r\n          <TouchableOpacity \r\n            style={styles.actionButton} \r\n            onPress={() => openComments(item.id)}\r\n          >\r\n            <SVGIcon name="comment" size={34} color={COLORS.text} />\r\n            <Text style={styles.actionText}>{item.commentsCount}</Text>\r\n          </TouchableOpacity>\r\n\r\n          {/* Share Button */}\r\n          <TouchableOpacity \r\n            style={styles.actionButton}\r\n            onPress={() => handleShare(item)}\r\n          >\r\n            <SVGIcon name="share" size={32} color={COLORS.text} />\r\n            <Text style={styles.actionText}>{item.shares}</Text>\r\n          </TouchableOpacity>\r\n\r\n          {/* Bookmark Button */}\r\n          <TouchableOpacity\r\n            style={styles.actionButton}\r\n            onPress={() => handleBookmark(item)}\r\n          >\r\n            <SVGIcon\r\n              name="inbox"\r\n              size={30}\r\n              color={item.isBookmarked ? COLORS.accent : COLORS.text}\r\n            />\r\n          </TouchableOpacity>\r\n\r\n          {/* Save Offline Button */}\r\n          <TouchableOpacity\r\n            style={styles.actionButton}\r\n            onPress={() => handleSaveOffline(item)}\r\n          >\r\n            <SVGIcon name="settings" size={28} color={COLORS.text} />\r\n          </TouchableOpacity>\r\n\r\n          {/* Rotating Vinyl Record */}\r\n          <SpinVinyl isPlaying={isPlaying && !commentsVisible && !(isCurrentItem && userPaused)} />\r\n        </Animated.View>\r\n      </View>\r\n    );\r\n  };'''

# Since the previous replace might have varied slightly, I'll use a more flexible regex-like match if needed, but let's try direct first.
replace_with_call = b'''  const renderVideoItem = useCallback(({ item, index }) => (
    <VideoItem
      item={item}
      index={index}
      isFocused={isFocused}
      currentVisibleIndex={currentVisibleIndex}
      commentsVisible={commentsVisible}
      userPaused={userPaused}
      handleVideoTap={handleVideoTap}
      navigation={navigation}
      handleFollowCreator={handleFollowCreator}
      handleLike={handleLike}
      openComments={openComments}
      handleShare={handleShare}
      handleBookmark={handleBookmark}
      handleSaveOffline={handleSaveOffline}
    />
  ), [isFocused, currentVisibleIndex, commentsVisible, userPaused, handleVideoTap, navigation, handleFollowCreator, handleLike, openComments, handleShare, handleBookmark, handleSaveOffline]);'''

content = content.replace(search_orig_render, replace_with_call)

with open(filepath, 'wb') as f:
    f.write(content)
