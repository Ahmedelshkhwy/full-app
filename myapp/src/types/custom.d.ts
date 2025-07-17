declare module '@/components/ThemedText' {
  import { TextProps } from 'react-native';
  export const ThemedText: React.FC<TextProps & { type?: string }>;
}

declare module '@/components/ThemedView' {
  import { ViewProps } from 'react-native';
  export const ThemedView: React.FC<ViewProps>;
}

declare module '@/hooks/useColorScheme' {
  export function useColorScheme(): 'light' | 'dark';
}