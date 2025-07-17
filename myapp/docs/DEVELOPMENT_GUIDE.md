# دليل التطوير - تطبيق الصيدلية

## 🎯 الرؤية والأهداف

### الرؤية
بناء تطبيق صيدلية متطور يتبع أفضل الممارسات في التطوير، مع التركيز على:
- **سهولة التوسع**: إضافة ميزات جديدة بسهولة
- **سهولة الصيانة**: كود منظم وقابل للصيانة
- **أداء عالي**: تجربة مستخدم سلسة وسريعة
- **أمان قوي**: حماية بيانات المستخدمين

### الأهداف
1. تطبيق بنية معمارية قابلة للتوسع
2. تحسين تجربة المستخدم
3. تسريع عملية التطوير
4. تقليل الأخطاء والحفاظ على جودة الكود

## 📁 البنية الجديدة

### هيكل المجلدات
```
app/
├── (auth)/           # صفحات المصادقة
│   ├── _layout.tsx   # تخطيط صفحات المصادقة
│   ├── login.tsx     # صفحة تسجيل الدخول
│   └── register.tsx  # صفحة التسجيل
├── (admin)/          # لوحة تحكم المسؤول
│   ├── _layout.tsx   # تخطيط لوحة التحكم
│   ├── dashboard.tsx # لوحة التحكم الرئيسية
│   ├── products.tsx  # إدارة المنتجات
│   ├── orders.tsx    # إدارة الطلبات
│   ├── users.tsx     # إدارة المستخدمين
│   └── settings.tsx  # إعدادات النظام
├── (tabs)/           # التبويبات الرئيسية
│   ├── _layout.tsx   # تخطيط التبويبات
│   ├── home.tsx      # الصفحة الرئيسية
│   ├── offers.tsx    # العروض والخصومات
│   ├── cart.tsx      # سلة التسوق
│   ├── e-medicin.tsx # الخدمات الطبية
│   └── profile.tsx   # الملف الشخصي
├── (modals)/         # الصفحات التي تفتح كـ modals
│   ├── _layout.tsx   # تخطيط الـ modals
│   ├── checkout.tsx  # إتمام الطلب
│   ├── product-details.tsx # تفاصيل المنتج
│   ├── order-details.tsx   # تفاصيل الطلب
│   ├── edit-profile.tsx    # تعديل الملف الشخصي
│   └── change-password.tsx # تغيير كلمة المرور
└── _layout.tsx       # التخطيط الرئيسي للتطبيق
```

## 🔧 أفضل الممارسات

### 1. **Route Groups**
```typescript
// استخدام الأقواس لإنشاء route groups
app/(auth)/login.tsx
app/(admin)/dashboard.tsx
app/(tabs)/home.tsx
app/(modals)/checkout.tsx
```

### 2. **Conditional Navigation**
```typescript
// عرض صفحات مختلفة حسب حالة المستخدم
{!token ? (
  // صفحات المصادقة
  <Stack.Screen name="(auth)/login" />
  <Stack.Screen name="(auth)/register" />
) : user?.role === 'admin' ? (
  // لوحة تحكم المسؤول
  <Stack.Screen name="(admin)/dashboard" />
) : (
  // التطبيق الرئيسي
  <Stack.Screen name="(tabs)" />
)}
```

### 3. **Modal Presentation**
```typescript
// استخدام modals للصفحات المناسبة
<Stack.Screen 
  name="(modals)/product-details" 
  options={{ 
    presentation: 'modal',
    animation: 'slide_from_bottom'
  }} 
/>
```

## 🚀 خطوات التطوير

### 1. **إضافة صفحة جديدة**
```bash
# إنشاء صفحة في التبويبات
touch app/(tabs)/new-page.tsx

# إنشاء صفحة في الـ modals
touch app/(modals)/new-modal.tsx

# إنشاء صفحة في لوحة التحكم
touch app/(admin)/new-admin-page.tsx
```

### 2. **إضافة التبويب الجديد**
```typescript
// في app/(tabs)/_layout.tsx
<Tabs.Screen 
  name="new-page" 
  options={{
    tabBarIcon: ({ color, size }) => (
      <Ionicons name="new-icon" size={size} color={color} />
    ),
    tabBarLabel: 'التبويب الجديد'
  }}
/>
```

### 3. **إضافة الروابط**
```typescript
// التنقل بين الصفحات
import { router } from 'expo-router';

// الانتقال إلى صفحة
router.push('/(tabs)/home');

// فتح modal
router.push('/(modals)/product-details');

// العودة للصفحة السابقة
router.back();
```

## 📱 أنواع المستخدمين

### 1. **المستخدم غير المسجل**
- الوصول: صفحات المصادقة فقط
- التبويبات: لا تظهر
- الوظائف: محدودة

### 2. **المستخدم العادي**
- الوصول: التطبيق الكامل
- التبويبات: 5 تبويبات رئيسية
- الوظائف: التسوق، الطلبات، الملف الشخصي

### 3. **المسؤول**
- الوصول: لوحة التحكم
- التبويبات: تبويبات إدارية
- الوظائف: إدارة المنتجات، الطلبات، المستخدمين

## 🎨 معايير التصميم

### الألوان الرئيسية
```typescript
const colors = {
  primary: '#23B6C7',      // اللون الأساسي
  secondary: '#FF6B6B',    // اللون الثانوي
  success: '#4CAF50',      // اللون الأخضر
  warning: '#FF9800',      // اللون البرتقالي
  error: '#F44336',        // اللون الأحمر
  text: '#333333',         // النص الأساسي
  textSecondary: '#666666', // النص الثانوي
  background: '#F5F5F5',   // خلفية الصفحة
  white: '#FFFFFF',        // الأبيض
};
```

### الخطوط
```typescript
const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    small: 12,
    regular: 14,
    medium: 16,
    large: 18,
    xlarge: 24,
  }
};
```

## 🔍 اختبار التطبيق

### 1. **اختبار التنقل**
```bash
# اختبار جميع مسارات التنقل
npm run test:navigation
```

### 2. **اختبار الوظائف**
```bash
# اختبار الوظائف الأساسية
npm run test:functions
```

### 3. **اختبار الأداء**
```bash
# اختبار أداء التطبيق
npm run test:performance
```

## 📋 قائمة المهام اليومية

### للمطورين الجدد
- [ ] قراءة دليل البنية المعمارية
- [ ] فهم أنواع المستخدمين
- [ ] تعلم أفضل الممارسات
- [ ] اختبار التطبيق

### للمطورين المتمرسين
- [ ] مراجعة الكود الجديد
- [ ] تحسين الأداء
- [ ] إضافة ميزات جديدة
- [ ] تدريب الفريق

## 🛠️ أدوات التطوير

### 1. **Expo Router**
- التوجيه الملفي
- Route Groups
- Conditional Navigation

### 2. **React Native**
- المكونات الأساسية
- الـ Hooks
- الـ Context API

### 3. **TypeScript**
- الأنواع الآمنة
- التدقيق في الأخطاء
- تحسين الأداء

## 📞 الدعم والمساعدة

### في حالة الحاجة للمساعدة
1. راجع الوثائق أولاً
2. ابحث في الكود الموجود
3. اسأل الفريق
4. راجع أمثلة مشابهة

### روابط مفيدة
- [دليل Expo Router](https://docs.expo.dev/router/introduction/)
- [دليل React Native](https://reactnative.dev/docs/getting-started)
- [دليل TypeScript](https://www.typescriptlang.org/docs/)

---

**تذكر**: الهدف هو بناء تطبيق قوي وقابل للتوسع مع الحفاظ على سهولة الصيانة والتطوير. 