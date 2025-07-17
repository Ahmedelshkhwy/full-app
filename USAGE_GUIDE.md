# دليل استخدام المكونات الجديدة

## SafeScreen Component
استخدم بدلاً من SafeAreaView:
```tsx
<SafeScreen backgroundColor="#E6F3F7">
  <AppHeader title="العنوان" />
  {/* المحتوى */}
</SafeScreen>
```

## AppHeader Component  
للـ header موحد:
```tsx
<AppHeader 
  title="عنوان الشاشة"
  showBackButton={true}
  rightComponent={<IconButton />}
/>
```

## Theme System
للألوان والمسافات:
```tsx
import { Theme } from '../src/constants/Theme';

backgroundColor: Theme.colors.primary
padding: Theme.spacing.md
```

## Common Components
```tsx
<LoadingComponent message="جاري التحميل..." />
<ErrorComponent message={error} onRetry={handleRetry} />
<EmptyState title="لا توجد بيانات" onAction={handleRefresh} />
```