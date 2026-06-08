// Custom SVG Icon Collection for Afro Vibe
import React from 'react';
import Svg, { Path, Circle, Rect, Path as SvgPath, Polygon, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { COLORS } from '../styles/theme';

export const SVGIcon = ({ name, size = 24, color = COLORS.text, style }) => {
  switch (name) {
    case 'home':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z" fill={color} />
        </Svg>
      );
      
    case 'discover':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" fill={color} />
        </Svg>
      );
      
    case 'plus':
      return (
        <Svg width={45} height={30} viewBox="0 0 45 30" fill="none" style={style}>
          <Defs>
            <LinearGradient id="plus_grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={COLORS.primary} />
              <Stop offset="100%" stopColor={COLORS.secondary} />
            </LinearGradient>
          </Defs>
          <G>
            {/* Blue-ish/Cyan left wing */}
            <Rect x={3} y={2} width={38} height={26} rx={8} fill="#00f2fe" opacity={0.8} />
            {/* Red-ish/Magenta right wing */}
            <Rect x={7} y={2} width={38} height={26} rx={8} fill="#fe0979" opacity={0.8} />
            {/* White center pill with custom gradient overlay */}
            <Rect x={5} y={2} width={35} height={26} rx={8} fill={COLORS.text} />
            <Path d="M22.5 9v12M16.5 15h12" stroke={COLORS.background} strokeWidth={3} strokeLinecap="round" />
          </G>
        </Svg>
      );
      
    case 'inbox':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill={color} />
        </Svg>
      );
      
    case 'profile':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill={color} />
        </Svg>
      );
      
    case 'heart':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill={color} />
        </Svg>
      );
      
    case 'comment':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" fill={color} />
        </Svg>
      );
      
    case 'share':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" fill={color} />
        </Svg>
      );
      
    case 'music':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" fill={color} />
        </Svg>
      );
      
    case 'back':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
        </Svg>
      );
      
    case 'pause':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill={color} />
        </Svg>
      );
      
    case 'search':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill={color} />
        </Svg>
      );
      
    case 'settings':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill={color} />
        </Svg>
      );
      
    case 'verified':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#00b0ff" />
        </Svg>
      );

    case 'google':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...style}>
          <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </Svg>
      );

    case 'github':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" {...style}>
          <Path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.43 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.02c-3.33.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.08-.74.08-.72.08-.72 1.2.08 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.41-1.3.76-1.6-2.66-.3-5.46-1.33-5.46-5.91 0-1.31.47-2.38 1.23-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.31 1.23.96-.27 1.99-.4 3.01-.4 1.02 0 2.05.13 3.01.4 2.3-1.55 3.31-1.23 3.31-1.23.66 1.65.24 2.87.12 3.17.76.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.47 5.91.42.36.81 1.08.81 2.18v3.23c0 .33.22.71.82.58C20.57 21.8 24 17.31 24 12c0-6.63-5.37-12-12-12z" fill={color}/>
        </Svg>
      );

    case 'live':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Circle cx="12" cy="12" r="3" fill={COLORS.liveBadge} />
          <Path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill={COLORS.liveBadge} />
        </Svg>
      );

    case 'close':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill={color} />
        </Svg>
      );

    case 'flash':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M7 2v11h3v9l7-12h-4l4-8z" fill={color} />
        </Svg>
      );

    case 'speed':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 12 6a8 8 0 0 1 7.15 4.42l1.23-1.85A10 10 0 0 0 2 16a10 10 0 0 0 10 10 10 10 0 0 0 10-10 10 10 0 0 0-1.62-7.43zM12 10a4 4 0 0 0-4 4h2a2 2 0 0 1 2-2V10zm5.18-.18L13.41 14l1.42 1.42 3.77-4.24-1.42-1.36z" fill={color} />
        </Svg>
      );

    case 'beauty':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M7.5 5.6L5 7 6.4 4.5 5 2l2.5 1.4L10 2 8.6 4.5 10 7zM19.5 15.4l-2.5 1.4 1.4-2.5-1.4-2.5 2.5 1.4 2.5-1.4-1.4 2.5 1.4 2.5zm0-10l-2.5 1.4 1.4-2.5-1.4-2.5 2.5 1.4 2.5-1.4-1.4 2.5 1.4 2.5zM14.1 7.4L3 18.5V21h2.5L16.6 9.9l-2.5-2.5z" fill={color} />
        </Svg>
      );

    case 'timer':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0 0 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill={color} />
        </Svg>
      );

    // Traditional Adinkra geometric patterns
    case 'adinkra1': // Gye Nyame symbol (represents supremacy of God, stylized)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          {/* Central Pillar */}
          <Rect x="11.2" y="2" width="1.6" height="20" rx="0.8" fill={color} />
          {/* Left Wing and Spikes */}
          <Path d="M11.2 5.5 C8 5.5, 6 7.5, 6 12 C6 16.5, 8 18.5, 11.2 18.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <Path d="M6 12 H3.5 M6.3 9.5 L4.3 8.3 M6.3 14.5 L4.3 15.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          {/* Right Wing and Spikes */}
          <Path d="M12.8 5.5 C16 5.5, 18 7.5, 18 12 C18 16.5, 16 18.5, 12.8 18.5" stroke={color} strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <Path d="M18 12 H20.5 M17.7 9.5 L19.7 8.3 M17.7 14.5 L19.7 15.7" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          {/* Center Swirls */}
          <Path d="M12 8.5 A1.5 1.5 0 1 1 12 11.5 A1.5 1.5 0 1 1 12 8.5" fill="none" stroke={color} strokeWidth="1.2" />
          <Path d="M12 12.5 A1.5 1.5 0 1 1 12 15.5 A1.5 1.5 0 1 1 12 12.5" fill="none" stroke={color} strokeWidth="1.2" />
        </Svg>
      );

    case 'adinkra2': // Dwennimmen symbol (ram's horns - strength and humility, stylized)
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          {/* Left Horn Spiral */}
          <Path d="M12 18 C9 18, 6.5 16, 6.5 12.5 C6.5 9, 8.5 7, 11 7 C13 7, 14.5 8.5, 14.5 10 C14.5 11.5, 13.5 12.5, 12 12.5 C11 12.5, 10.5 12, 10.5 11" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
          {/* Right Horn Spiral */}
          <Path d="M12 18 C15 18, 17.5 16, 17.5 12.5 C17.5 9, 15.5 7, 13 7 C11 7, 9.5 8.5, 9.5 10 C9.5 11.5, 10.5 12.5, 12 12.5 C13 12.5, 13.5 12, 13.5 11" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
        </Svg>
      );

    case 'edit':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill={color} />
        </Svg>
      );

    case 'send':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
          <Path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill={color} />
        </Svg>
      );

    default:
      return null;
  }
};

export default SVGIcon;
