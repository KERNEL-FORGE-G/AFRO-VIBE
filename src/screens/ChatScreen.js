import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
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
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, SPACING } from '../styles/theme';
import SVGIcon from '../components/SVGIcon';
import apiService, { authService } from '../services/apiService';
import Haptics from '../utils/haptics';

const MessageItem = memo(({ item, currentUserId }) => {
    const isMine = item.sender_id === currentUserId;
    const slideAnim = useRef(new Animated.Value(20)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true })
      ]).start();
    }, [slideAnim, opacityAnim]);

    return (
      <Animated.View style={{ opacity: opacityAnim, transform: [{ translateX: isMine ? slideAnim : slideAnim.interpolate({ inputRange: [0, 20], outputRange: [0, -20] }) }] }}>
        <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
          <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>{item.text}</Text>
          <Text style={styles.messageTime}>{new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </Animated.View>
    );
});

export const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { otherUser } = route.params;
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef();
  const currentUserId = authService.getCurrentUser()?.uid;
  const otherUserId = otherUser.uid || otherUser.id;

  useEffect(() => {
    const unsubscribe = apiService.db.subscribeToMessages(otherUserId, (data) => {
      setMessages(data);
      setLoading(false);
    });
    return () => { if (typeof unsubscribe === 'function') unsubscribe(); };
  }, [otherUserId]);

  const handleSend = async () => {
    if (!inputText.trim() || sending) return;
    Haptics.medium();
    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);
    try {
      await apiService.db.sendMessage(otherUserId, textToSend);
    } catch (err) {
      console.error('Error sending message:', err);
      setInputText(textToSend);
      Alert.alert('Erreur', 'Impossible d\'envoyer le message.');
    } finally {
      setSending(false);
    }
  };

  const renderMessageItem = useCallback(({ item }) => (
    <MessageItem item={item} currentUserId={currentUserId} />
  ), [currentUserId]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><SVGIcon name="back" size={24} color={COLORS.text} /></TouchableOpacity>
        <View style={styles.headerUser}>
          <Image source={require('../assets/images/logo.jpg')} style={styles.headerAvatar} />
          <View><Text style={styles.headerUsername}>{otherUser.username}</Text><Text style={styles.headerStatus}>Messagerie</Text></View>
        </View>
        <TouchableOpacity style={styles.headerAction}><SVGIcon name="discover" size={24} color={COLORS.text} /></TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.chatContainer} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        {loading ? <View style={styles.loadingContainer}><ActivityIndicator color={COLORS.primary} /></View> : (
          <FlatList ref={flatListRef} data={messages} keyExtractor={item => item.id} renderItem={renderMessageItem} contentContainerStyle={styles.messagesList} onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={<View style={styles.emptyChat}><Text style={styles.emptyChatText}>Envoyez le premier message à @{otherUser.username}</Text></View>} />
        )}
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachBtn}><SVGIcon name="edit" size={20} color={COLORS.textSecondary} /></TouchableOpacity>
          <TextInput style={styles.input} placeholder="Envoyer un message..." placeholderTextColor={COLORS.textSecondary} value={inputText} onChangeText={setInputText} multiline />
          <TouchableOpacity style={[styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]} onPress={handleSend} disabled={!inputText.trim() || sending}>
            <SVGIcon name="send" size={20} color={inputText.trim() && !sending ? COLORS.primary : COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { padding: 8, marginRight: 8 },
  headerUser: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  headerUsername: { color: COLORS.text, fontSize: 16, fontWeight: 'bold' },
  headerStatus: { color: COLORS.textSecondary, fontSize: 12 },
  headerAction: { padding: 8 },
  chatContainer: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyChatText: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
  messagesList: { padding: SPACING.md, paddingBottom: SPACING.lg, flexGrow: 1 },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 18, marginBottom: 10 },
  myMessage: { alignSelf: 'flex-end', backgroundColor: COLORS.primary, borderBottomRightRadius: 4 },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: COLORS.cardBackground, borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: COLORS.text },
  theirMessageText: { color: COLORS.text },
  messageTime: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'right' },
  inputArea: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, backgroundColor: COLORS.background },
  attachBtn: { padding: 8 },
  input: { flex: 1, backgroundColor: COLORS.cardBackground, borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginHorizontal: 8, color: COLORS.text, maxHeight: 100 },
  sendBtn: { padding: 8 },
  sendBtnDisabled: { opacity: 0.5 },
});

export default ChatScreen;
