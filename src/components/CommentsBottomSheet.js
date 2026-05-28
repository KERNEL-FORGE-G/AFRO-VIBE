// Comments Bottom Sheet Component
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Dimensions,
  Modal
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from './SVGIcon';
import { dbService } from '../services/apiService';

const { height } = Dimensions.get('window');

export const CommentsBottomSheet = ({ visible, onClose, videoId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && videoId) {
      loadComments();
    }
  }, [visible, videoId]);

  const loadComments = async () => {
    setLoading(true);
    const data = await dbService.getComments(videoId);
    setComments(data);
    setLoading(false);
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    
    const addedComment = await dbService.addComment(videoId, newComment);
    setComments(prev => [addedComment, ...prev]);
    setNewComment('');
  };

  const renderCommentItem = ({ item }) => (
    <View style={styles.commentItem}>
      <Image 
        source={require('../assets/images/logo.jpg')} // Fallback image setup
        style={styles.avatar} 
      />
      <View style={styles.commentContent}>
        <Text style={styles.username}>@{item.user?.username || 'user'}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
        <Text style={styles.timeText}>{item.time || '1m'}</Text>
      </View>
      <TouchableOpacity style={styles.likeCommentBtn}>
        <SVGIcon name="heart" size={12} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.flexFiller} onPress={onClose} />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{comments.length} commentaires</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <SVGIcon name="close" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {/* List */}
          <FlatList
            data={comments}
            keyExtractor={item => item.id}
            renderItem={renderCommentItem}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Soyez le premier à commenter ! 🔥</Text>
              </View>
            }
          />

          {/* Input Bar */}
          <View style={styles.inputContainer}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Ajouter un commentaire..."
              placeholderTextColor={COLORS.textSecondary}
              style={styles.input}
            />
            <TouchableOpacity onPress={handlePostComment} style={styles.sendBtn}>
              <Text style={styles.sendBtnText}>Publier</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  flexFiller: {
    flex: 1,
  },
  sheetContainer: {
    height: height * 0.6,
    backgroundColor: COLORS.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    padding: SPACING.md,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  commentContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  username: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  commentText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  timeText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  likeCommentBtn: {
    justifyContent: 'center',
    padding: 8,
  },
  emptyContainer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingBottom: Platform.OS === 'ios' ? 24 : SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.text,
    fontSize: 14,
    marginRight: SPACING.sm,
  },
  sendBtn: {
    paddingHorizontal: SPACING.md,
  },
  sendBtnText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default CommentsBottomSheet;
