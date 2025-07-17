import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface OTPTimerProps {
  initialTime?: number; // بالثواني
  onResend: () => void;
  disabled?: boolean;
}

const OTPTimer: React.FC<OTPTimerProps> = ({
  initialTime = 120, // دقيقتان افتراضياً
  onResend,
  disabled = false
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {clearInterval(interval);}
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleResend = () => {
    if (!disabled && !isActive) {
      setTimeLeft(initialTime);
      setIsActive(true);
      onResend();
    }
  };

  const canResend = !isActive && !disabled;

  return (
    <View style={styles.container}>
      {isActive ? (
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>
            يمكنك إعادة الإرسال خلال
          </Text>
          <Text style={styles.timeText}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.resendButton,
            disabled ? styles.resendButtonDisabled : null
          ]}
          onPress={handleResend}
          disabled={disabled}
        >
          <Text style={[
            styles.resendButtonText,
            disabled ? styles.resendButtonTextDisabled : null
          ]}>
            إعادة إرسال الرمز
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 20,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  resendButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  resendButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  resendButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default OTPTimer;
