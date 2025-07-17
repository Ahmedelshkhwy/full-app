import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';

const PRIMARY = '#23B6C7';
const PINK = '#E94B7B';
const BG = '#E6F3F7';

export default function TeleMedicineScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [age, setAge] = useState('');
    const [nationality, setNationality] = useState('');
    const [loading, setLoading] = useState(false);

    // للتحقق من صحة البيانات
    const validateForm = () => {
        if (!name.trim()) { return 'الرجاء إدخال الاسم'; }
        if (!mobile.trim() || mobile.length !== 10) { return 'الرجاء إدخال رقم جوال صحيح'; }
        if (!idNumber.trim() || idNumber.length !== 10) { return 'الرجاء إدخال رقم هوية صحيح'; }
        if (!age.trim() || isNaN(Number(age))) { return 'الرجاء إدخال عمر صحيح'; }
        if (!nationality.trim()) { return 'الرجاء تحديد الجنسية'; }
        return null;
    };

    // إرسال طلب الكشف الطبي
    const handleSubmitRequest = async () => {
        // التحقق من صحة البيانات
        const error = validateForm();
        if (error) {
            Alert.alert('خطأ في البيانات', error);
            return;
        }

        // عرض حالة التحميل
        setLoading(true);

        // محاكاة عملية الإرسال
        setTimeout(() => {
            setLoading(false);
            // عرض خيارات الدفع
            Alert.alert(
                'تأكيد الطلب',
                'تم استلام طلبك بنجاح. الرجاء اختيار وسيلة الدفع لإكمال العملية.',
                [
                    {
                        text: 'الدفع الآن',
                        onPress: () => handlePayment(),
                        style: 'default',
                    },
                    {
                        text: 'إلغاء',
                        style: 'cancel',
                    },
                ]
            );
        }, 1500);
    };

    // محاكاة عملية الدفع
    const handlePayment = () => {
        Alert.alert('اختر وسيلة الدفع', '', [
            {
                text: 'بطاقة ائتمانية',
                onPress: () => processPayment('بطاقة ائتمانية'),
            },
            {
                text: 'مدى',
                onPress: () => processPayment('مدى'),
            },
            {
                text: 'آبل باي/سامسونج باي',
                onPress: () => processPayment('محفظة إلكترونية'),
            },
            {
                text: 'إلغاء',
                style: 'cancel',
            },
        ]);
    };

    // إتمام عملية الدفع
    const processPayment = (method: string) => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            Alert.alert(
                'تمت العملية بنجاح',
                `تم إتمام طلبك بنجاح باستخدام ${method}. سيتم التواصل معك قريباً من قبل الطبيب المختص على رقم الجوال ${mobile}.`,
                [{ text: 'حسناً', onPress: () => resetForm() }]
            );
        }, 1500);
    };

    // إعادة تعيين النموذج
    const resetForm = () => {
        setName('');
        setMobile('');
        setIdNumber('');
        setAge('');
        setNationality('');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={PRIMARY} />
                    </TouchableOpacity>
                    <Ionicons name="medkit" size={30} color={PRIMARY} />
                    <Text style={styles.title}>خدمة الطب الاتصالي</Text>
                    <View style={styles.headerSpacer} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>طلب استشارة طبية عن بعد</Text>
                    <Text style={styles.cardDescription}>
                        استشر طبيباً مختصاً عبر مكالمة فيديو دون الحاجة للزيارة الشخصية
                    </Text>

                    <View style={styles.priceTag}>
                        <Text style={styles.priceText}>15 ر.س</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <Text style={styles.formLabel}>البيانات الشخصية</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>الاسم الكامل</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="أدخل الاسم كاملاً"
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>رقم الجوال</Text>
                            <TextInput
                                style={styles.input}
                                value={mobile}
                                onChangeText={setMobile}
                                placeholder="05xxxxxxxx"
                                placeholderTextColor="#aaa"
                                keyboardType="phone-pad"
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>رقم الهوية / الإقامة</Text>
                            <TextInput
                                style={styles.input}
                                value={idNumber}
                                onChangeText={setIdNumber}
                                placeholder="أدخل رقم الهوية أو الإقامة"
                                placeholderTextColor="#aaa"
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>العمر</Text>
                            <TextInput
                                style={styles.input}
                                value={age}
                                onChangeText={setAge}
                                placeholder="أدخل العمر"
                                placeholderTextColor="#aaa"
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>الجنسية</Text>
                            <TextInput
                                style={styles.input}
                                value={nationality}
                                onChangeText={setNationality}
                                placeholder="أدخل الجنسية"
                                placeholderTextColor="#aaa"
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmitRequest}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>طلب استشارة الآن</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoSection}>
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={24} color={PRIMARY} style={styles.infoIcon} />
                        <View>
                            <Text style={styles.infoTitle}>استجابة سريعة</Text>
                            <Text style={styles.infoDesc}>تواصل مع الطبيب خلال 30 دقيقة</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="shield-checkmark-outline" size={24} color={PRIMARY} style={styles.infoIcon} />
                        <View>
                            <Text style={styles.infoTitle}>استشارة آمنة</Text>
                            <Text style={styles.infoDesc}>بياناتك الطبية محمية ومشفرة</Text>
                        </View>
                    </View>

                    <View style={styles.infoItem}>
                        <Ionicons name="card-outline" size={24} color={PRIMARY} style={styles.infoIcon} />
                        <View>
                            <Text style={styles.infoTitle}>دفع مريح</Text>
                            <Text style={styles.infoDesc}>طرق دفع متعددة ومضمونة</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'ios' ? 60 : 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    backButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
    },
    headerSpacer: {
        width: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: PRIMARY,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#222',
        marginBottom: 8,
        textAlign: 'center',
    },
    cardDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
        lineHeight: 20,
    },
    priceTag: {
        backgroundColor: PRIMARY,
        alignSelf: 'center',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginBottom: 20,
    },
    priceText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    formContainer: {
        marginTop: 10,
    },
    formLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#444',
        marginBottom: 15,
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: '#444',
        marginBottom: 6,
        fontWeight: '600',
    },
    input: {
        backgroundColor: '#f8f8f8',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: PINK,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoSection: {
        marginBottom: 30,
    },
    infoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    infoIcon: {
        marginRight: 16,
    },
    infoTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
    },
    infoDesc: {
        fontSize: 13,
        color: '#666',
    },
});