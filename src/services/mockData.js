// Mock Data Service for Afro Vibe

export const MOCK_USERS = {
  kingMoves: {
    username: 'King_Moves',
    fullName: 'Christian Mboa',
    avatar: 'logo.jpg', // falls back to local logo asset
    followers: '24.6K',
    following: '128',
    likes: '512.3K',
    bio: 'Danseur | Créateur de vibes 🕺🏾\nFaisons rayonner notre culture 🌍🔥\n🇨🇲🇨🇮🇳🇬',
    isVerified: true,
  },
  queenLafo: {
    username: 'Queen_Lafo',
    fullName: 'Amina Lafo',
    avatar: 'avatar_mock.jpg',
    followers: '85.2K',
    following: '342',
    likes: '1.2M',
    bio: 'Reine du Mapouka moderne 👑✨\nDanse ta culture, aime ton identité!',
    isVerified: true,
  },
  misterK: {
    username: 'Mister_K',
    fullName: 'Kevin Kouamé',
    avatar: 'logo_main.jpg',
    followers: '12.5K',
    following: '410',
    likes: '98.4K',
    bio: 'Beatmaker & Chorégraphe 🎶\nCoupé-Décalé vibes only ⚡',
    isVerified: false,
  },
  afroSteezy: {
    username: 'AfroSteezy',
    fullName: 'Yao Steezy',
    avatar: 'avatar_mock.jpg',
    followers: '105K',
    following: '150',
    likes: '2.1M',
    bio: 'Vibe & Style AFRO 🌍\n#AfroVibeChallenge',
    isVerified: true,
  },
};

export const MOCK_VIDEOS = [
  {
    id: 'vid_1',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-young-woman-dancing-in-front-of-wall-with-neon-lights-42289-large.mp4',
    user: MOCK_USERS.kingMoves,
    caption: 'La danse c’est la langue du coeur ❤️🌍 Danse traditionnelle revisité ! #AfroVibe #DanseTaCulture #Afrique #Cameroon',
    likes: '12.5K',
    commentsCount: '342',
    shares: '1.2K',
    audioName: 'Afro Vibe Original - King_Moves',
    category: 'Danse',
    views: '128K',
    thumbnail: 'banner_mock.jpg',
  },
  {
    id: 'vid_2',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-man-dancing-under-neon-lights-in-slow-motion-42288-large.mp4',
    user: MOCK_USERS.queenLafo,
    caption: 'Qui est prêt pour le nouveau Mapouka Challenge ? 🍑🔥 Montrez-moi vos pas ! #MapoukaVibes #TraditionalFusion #Challenge',
    likes: '45.2K',
    commentsCount: '896',
    shares: '4.8K',
    audioName: 'Mapouka Beats - AfroVibe Team',
    category: 'Défis',
    views: '345K',
    thumbnail: 'avatar_mock.jpg',
  },
  {
    id: 'vid_3',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dance-challenge-in-a-studio-41484-large.mp4',
    user: MOCK_USERS.misterK,
    caption: 'Coupé Décalé nouvelle génération. Ça chauffe à Abidjan 🇨🇮⚡ #CoupeDecale #Abidjan #CoteIvoire #Dance',
    likes: '8.3K',
    commentsCount: '154',
    shares: '680',
    audioName: 'Coupé Décalé Mix 2026 - Mister_K',
    category: 'Musique',
    views: '45K',
    thumbnail: 'logo_main.jpg',
  },
  {
    id: 'vid_4',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-woman-performing-choreographed-dance-move-41584-large.mp4',
    user: MOCK_USERS.afroSteezy,
    caption: 'Tuto de la semaine : comment faire le Logoby dance. Likez et partagez ! 👍🏾🕺🏾 #TutoDanse #Logoby #AfroSteeze',
    likes: '18.4K',
    commentsCount: '412',
    shares: '950',
    audioName: 'Afro Vibe Original - AfroSteezy',
    category: 'Danse',
    views: '98K',
    thumbnail: 'logo.jpg',
  },
];

export const MOCK_CHALLENGES = [
  {
    id: 'c_1',
    title: 'Afro Move Challenge',
    views: '56.2M vues',
    description: 'Partage ton style, fais vibrer l’Afrique !',
    videosCount: '15.4K vidéos',
  },
  {
    id: 'c_2',
    title: 'Mapouka Vibes',
    views: '32.8M vues',
    description: 'Le rythme traditionnel dans tes hanches !',
    videosCount: '8.3K vidéos',
  },
  {
    id: 'c_3',
    title: 'Coupé Décalé Dance',
    views: '18.4M vues',
    description: 'L’héritage de la joie ivoirienne 🇨🇮',
    videosCount: '6.7K vidéos',
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    id: 'not_1',
    type: 'like',
    user: MOCK_USERS.queenLafo,
    message: 'a aimé votre vidéo.',
    time: '2m',
    videoThumb: 'banner_mock.jpg',
  },
  {
    id: 'not_2',
    type: 'message',
    user: MOCK_USERS.misterK,
    message: 'Wesh ça vibe fort ! 🔥💪🏾',
    time: '5m',
    unread: true,
  },
  {
    id: 'not_3',
    type: 'mention',
    user: MOCK_USERS.afroSteezy,
    message: 'vous a mentionné dans son défi.',
    time: '15m',
    videoThumb: 'avatar_mock.jpg',
  },
  {
    id: 'not_4',
    type: 'system',
    user: { username: 'AfroVibe_Team', fullName: 'Équipe AfroVibe', avatar: 'logo.jpg' },
    message: 'Bienvenue dans la communauté AfroVibe ! 🎉🌍',
    time: '1j',
  },
];

export const MOCK_COMMENTS = {
  vid_1: [
    { id: 'com_1_1', user: MOCK_USERS.queenLafo, text: 'Ça glisse trop bien ! La culture vibre 🌍🔥', time: '1h' },
    { id: 'com_1_2', user: MOCK_USERS.misterK, text: 'Ce beat est lourd, bravo mon frère ! 🙌🏾🔥', time: '4h' },
    { id: 'com_1_3', user: { username: 'Ama_225', fullName: 'Amadou', avatar: 'logo.jpg' }, text: 'La fierté africaine ! 🦁🇨🇮', time: '12h' },
  ],
  vid_2: [
    { id: 'com_2_1', user: MOCK_USERS.kingMoves, text: 'Impressionnant ! Les hanches ne mentent pas 😂💪🏾', time: '30m' },
    { id: 'com_2_2', user: MOCK_USERS.afroSteezy, text: 'C’est trop fort ! Je relève le défi direct.', time: '2h' },
  ],
};

export const MOCK_LIVE_COMMENTS = [
  { id: 'l_1', username: 'Ama_225', message: 'Ça chauffe ! 🔥🇨🇮' },
  { id: 'l_2', username: 'Blaise_Dance', message: 'Trop fort ! 💪🏾💥' },
  { id: 'l_3', username: 'Sweet_Melody', message: 'Wooooow 🔥🔥🔥' },
  { id: 'l_4', username: 'Kmer_Vibe', message: 'Le rythme dans la peau !!' },
  { id: 'l_5', username: 'Afro_Queen', message: 'J’adore les vêtements traditionnels 😍' },
];
