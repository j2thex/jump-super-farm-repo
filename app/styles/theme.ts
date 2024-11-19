export const theme = {
  colors: {
    // Backgrounds
    background: '#1a1a1a',  // Dark background
    surfaceLight: 'rgba(255, 255, 255, 0.1)',  // Light overlay for cards
    surfaceMedium: 'rgba(255, 255, 255, 0.15)', // Medium overlay for interactive elements
    surfaceDark: 'rgba(0, 0, 0, 0.3)',  // Dark overlay for contrast

    // Text
    textPrimary: 'white',
    textSecondary: '#ccc',
    textMuted: 'rgba(255, 255, 255, 0.6)',

    // Accents
    primary: '#4CAF50',
    primaryHover: '#45a049',
    gold: '#FFD700',
    silver: '#C0C0C0',
    error: '#ff4444',
    success: '#4CAF50',

    // Borders
    border: 'rgba(255, 255, 255, 0.1)',
    borderLight: 'rgba(255, 255, 255, 0.2)',

    // Status colors
    locked: '#666',
    ready: '#4CAF50',
    growing: '#8B4513'
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.2)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.3)',
    large: '0 8px 16px rgba(0, 0, 0, 0.4)'
  },
  transitions: {
    default: 'all 0.3s ease'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    pill: '20px'
  }
};

export type Theme = typeof theme; 