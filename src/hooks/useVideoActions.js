import { useCallback } from 'react';
import { Share, Alert, useCallback } from 'react-native';
import { dbService, authService } from '../services/apiService';
import offlineService from '../services/offlineService';
import outboxService from '../services/outboxService';
import Haptics from '../utils/haptics';

export const useVideoActions = (setVideos) => {

  const handleLike = useCallback(async (videoId) => {
    Haptics.light();
    let previousVideos;
    setVideos(prev => {
      previousVideos = prev;
      return prev.map(v => {
        if (v.id === videoId) {
          const isLiked = !v.isLiked;
          const currentLikesStr = v.likes.toString();
          let numericLikes = parseFloat(currentLikesStr);
          if (currentLikesStr.includes('K')) {
            numericLikes = numericLikes * 1000;
          }
          const newLikes = isLiked ? numericLikes + 1 : numericLikes - 1;
          const newLikesStr = newLikes >= 1000 ? (newLikes / 1000).toFixed(1) + 'K' : newLikes.toString();

          return {
            ...v,
            likes: newLikesStr,
            isLiked,
          };
        }
        return v;
      });
    });

    try {
      await dbService.likeVideo(videoId);
    } catch (err) {
      console.log('Like error, saving to outbox:', err.message);
      // Au lieu de rollback direct, on tente l'outbox
      await outboxService.addAction('LIKE', { videoId });
    }
  }, [setVideos]);

  const handleShare = useCallback(async (video) => {
    try {
      const result = await Share.share({
        message: `Regarde cette vidéo sur Afro Vibe !`,
        url: video.videoUrl,
        title: 'Partager la vidéo',
      });

      if (result.action === Share.sharedAction) {
        await dbService.shareVideo(video.id);
        setVideos(prev => prev.map(v => {
          if (v.id === video.id) {
            const currentSharesStr = v.shares.toString();
            let numericShares = parseFloat(currentSharesStr);
            if (currentSharesStr.includes('K')) {
              numericShares = numericShares * 1000;
            }
            const newShares = numericShares + 1;
            const newLikesStr = newShares >= 1000 ? (newShares / 1000).toFixed(1) + 'K' : newShares.toString();

            return {
              ...v,
              shares: newLikesStr,
            };
          }
          return v;
        }));
      }
    } catch (err) {
      console.error('Share error:', err);
      Alert.alert('Erreur', 'Impossible de partager la vidéo.');
    }
  }, [setVideos]);

  const handleBookmark = useCallback(async (video) => {
    Haptics.light();
    try {
      const result = await dbService.toggleBookmark(video.id);
      setVideos(prev => prev.map(v =>
        v.id === video.id ? { ...v, isBookmarked: result.bookmarked } : v,
      ));
    } catch (err) {
      console.log('Bookmark error, saving to outbox:', err.message);
      await outboxService.addAction('BOOKMARK', { videoId: video.id });
    }
  }, [setVideos]);

  const handleSaveOffline = useCallback(async (video) => {
    try {
      await offlineService.saveVideoOffline({
        id: video.id,
        videoUri: video.videoUrl,
        caption: video.caption,
        category: video.category,
        audioName: video.audioName,
      });
      Alert.alert('Hors ligne', 'Vidéo sauvegardée pour lecture hors ligne.');
    } catch (err) {
      console.error('Offline save error:', err);
    }
  }, []);

  const handleFollowCreator = useCallback(async (creatorId) => {
    let previousVideos;
    setVideos(prev => {
      previousVideos = prev;
      return prev.map(v => {
        if (v.user.uid === creatorId) {
          return {
            ...v,
            user: { ...v.user, isFollowing: true }
          };
        }
        return v;
      });
    });

    try {
      await dbService.followUser(creatorId);
    } catch (err) {
      console.log('Follow error, saving to outbox:', err.message);
      await outboxService.addAction('FOLLOW', { userId: creatorId });
    }
  }, [setVideos]);

  return {
    handleLike,
    handleShare,
    handleBookmark,
    handleSaveOffline,
    handleFollowCreator
  };
};

export default useVideoActions;
