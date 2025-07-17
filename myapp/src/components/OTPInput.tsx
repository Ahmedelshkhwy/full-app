import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

interface OTPInputProps {
  length: number;
  onComplete: (otp: string) => void;
  onChangeText?: (otp: string) => void;
  autoFocus?: boolean;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');

const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  onComplete,
  onChangeText,
  autoFocus = true,
  disabled = false
}) => {
  const [otp, setOtp] = useState<string[]>(new Array(length).fill(''));
  const refs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (autoFocus && refs.current[0]) {
      refs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChangeText = (text: string, index: number) => {
    // تجاهل النص إذا كان أكثر من رقم واحد
    if (text.length > 1) {return;}

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // استدعاء onChangeText إذا كان متوفراً
    onChangeText?.(newOtp.join(''));

    // الانتقال للحقل التالي إذا تم إدخال رقم
    if (text && index < length - 1) {
      refs.current[index + 1]?.focus();
    }

    // استدعاء onComplete إذا تم إكمال جميع الأرقام
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // الانتقال للحقل السابق عند الضغط على Backspace
      refs.current[index - 1]?.focus();
    }
  };

  const handlePress = (index: number) => {
    refs.current[index]?.focus();
  };

  const clear = () => {
    setOtp(new Array(length).fill(''));
    refs.current[0]?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handlePress(index)}
            style={[
              styles.digitContainer,
              digit ? styles.digitContainerFilled : null,
              disabled ? styles.digitContainerDisabled : null
            ]}
          >
            <TextInput
              ref={(ref) => {
                refs.current[index] = ref;
              }}
              style={[
                styles.digitInput,
                disabled ? styles.digitInputDisabled : null
              ]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
              editable={!disabled}
              textAlign="center"
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: width * 0.8,
    maxWidth: 300,
  },
  digitContainer: {
    width: 45,
    height: 55,
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  digitContainerFilled: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  digitContainerDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#D1D5DB',
  },
  digitInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  digitInputDisabled: {
    color: '#9CA3AF',
  },
});

export default OTPInput;
