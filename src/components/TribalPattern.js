// Tribal Geometric Pattern Border Component using SVG
import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Polygon, Rect } from 'react-native-svg';
import { COLORS } from '../styles/theme';

const { width } = Dimensions.get('window');

export const TribalPattern = ({ height = 15, position = 'bottom' }) => {
  // Let's create a repeating tribal pattern using simple geometric paths:
  // A series of triangles (chevrons) and diamonds in gold, orange, and purple.
  const segmentWidth = 60;
  const repeats = Math.ceil(width / segmentWidth);
  
  const renderPattern = () => {
    let elements = [];
    for (let i = 0; i < repeats; i++) {
      const xOffset = i * segmentWidth;
      elements.push(
        <React.Fragment key={`seg_${i}`}>
          {/* Background strip */}
          <Rect x={xOffset} y={0} width={segmentWidth} height={height} fill={COLORS.background} />
          
          {/* Chevron Gold */}
          <Polygon 
            points={`${xOffset},${height} ${xOffset + 15},0 ${xOffset + 30},${height}`} 
            fill={COLORS.accent} 
            opacity={0.8}
          />
          {/* Chevron Orange */}
          <Polygon 
            points={`${xOffset + 15},0 ${xOffset + 30},${height} ${xOffset + 45},0`} 
            fill={COLORS.primary} 
          />
          {/* Chevron Purple */}
          <Polygon 
            points={`${xOffset + 30},${height} ${xOffset + 45},0 ${xOffset + 60},${height}`} 
            fill={COLORS.secondary} 
          />
          
          {/* Little Center Diamond inside the shapes */}
          <Polygon 
            points={`${xOffset + 30},${height / 2 - 3} ${xOffset + 33},${height / 2} ${xOffset + 30},${height / 2 + 3} ${xOffset + 27},${height / 2}`} 
            fill={COLORS.text} 
          />
        </React.Fragment>
      );
    }
    return elements;
  };

  return (
    <View style={[
      styles.container, 
      { height }, 
      position === 'top' ? styles.topBorder : styles.bottomBorder
    ]}>
      <Svg height={height} width={width}>
        {renderPattern()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  topBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bottomBorder: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});

export default TribalPattern;
