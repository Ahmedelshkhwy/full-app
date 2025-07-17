import React from 'react';
import { StyleSheet, Text, TextProps } from 'react-native';

type ThemedTextProps = TextProps & {
  children: React.ReactNode;
  type?: 'title' | 'link' | 'default';
};

export const ThemedText: React.FC<ThemedTextProps> = ({ children, style, type = 'default', ...props }) => {
  let textStyle = styles.text;
  if (type === 'title') {textStyle = styles.title;}
  else if (type === 'link') {textStyle = styles.link;}

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#23b7c9',
    fontSize: 16,
  },
  title: {
    color: '#23b7c9',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  link: {
    color: '#007aff',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
});
export default ThemedText;