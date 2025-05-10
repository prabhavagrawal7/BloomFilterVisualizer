import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define enum for focus targets for better type safety and standardization
export enum FocusTarget {
  ADD = 'add',
  CHECK = 'check',
  NONE = 'none'
}

interface AnimationContextType {
  // Animation status
  isAnimating: boolean;
  setIsAnimating: (isAnimating: boolean) => void;
  
  // Which component should receive focus when animation ends
  focusTarget: FocusTarget;
  setFocusTarget: (target: FocusTarget) => void;
  
  // Animation speed
  animationSpeed: number;
  setAnimationSpeed: (speed: number) => void;
}

// Create the context with default values
const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

// Custom hook to use the animation context
export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

// Provider component
interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  // Animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [focusTarget, setFocusTarget] = useState<FocusTarget>(FocusTarget.NONE);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  
  // Context value
  const value = {
    isAnimating,
    setIsAnimating,
    focusTarget,
    setFocusTarget,
    animationSpeed,
    setAnimationSpeed
  };
  
  return (
    <AnimationContext.Provider value={value}>
      {children}
    </AnimationContext.Provider>
  );
};
