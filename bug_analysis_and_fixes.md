# Bug Analysis and Fixes for Pharmacy App

## Summary
After analyzing the pharmacy application codebase, I identified 3 critical bugs that could lead to security vulnerabilities, data integrity issues, and poor user experience. Below are detailed explanations of each bug and their fixes.

---

## Bug #1: Race Condition in Inventory Management (Critical)

### Location: 
- File: `backend/src/controllers/order.controller.ts`
- Lines: 74-126

### Description:
The order placement logic has a **critical race condition** in inventory management. The code checks product stock and then decrements it in separate operations without proper atomic transactions. This creates a window where multiple concurrent orders can deplete inventory below zero.

```typescript
// Current problematic code:
// 1. Check stock
if (product.stock < item.quantity) {
  return res.status(400).json({ message: 'Not enough stock' });
}

// ... other operations ...

// 2. Later, decrement stock (RACE CONDITION WINDOW)
for (const item of orderItems) {
  await Product.findByIdAndUpdate(item.productId, {
    $inc: { stock: -item.quantity }
  });
}
```

### Impact:
- **Data Integrity**: Inventory can go negative
- **Business Loss**: Overselling products that don't exist
- **Customer Experience**: Orders placed for unavailable items

### Fix Implementation:

**Solution**: Use atomic operations with conditional updates to prevent race conditions.

```typescript
// Fixed code with atomic operation:
for (const item of orderItems) {
  const result = await Product.findOneAndUpdate(
    { 
      _id: item.productId, 
      stock: { $gte: item.quantity } // Ensure sufficient stock exists
    },
    {
      $inc: { stock: -item.quantity }
    },
    { new: true }
  );
  
  // If update failed, inventory insufficient
  if (!result) {
    // Cancel order and rollback previously decremented items
    await Order.findByIdAndDelete(order._id);
    
    // Restore stock for items that were already decremented
    for (let i = 0; i < orderItems.indexOf(item); i++) {
      await Product.findByIdAndUpdate(orderItems[i].productId, {
        $inc: { stock: orderItems[i].quantity }
      });
    }
    
    const product = await Product.findById(item.productId);
    return res.status(400).json({ 
      message: `Product "${product?.name || 'Unknown'}" sold out during processing` 
    });
  }
}
```

**Benefits**:
- ✅ Atomic stock checking and decrementing
- ✅ Rollback mechanism for failed orders
- ✅ Prevents negative inventory
- ✅ Handles concurrent order processing safely

---

## Bug #2: Missing JWT Secret Environment Variable (Security Critical)

### Location:
- File: `backend/src/middlewares/auth.middleware.ts` 
- Line: 22
- File: `backend/src/controllers/auth.controller.ts`
- Lines: 26, 56

### Description:
The JWT authentication system references `process.env['JWT_SECRET']` but there's no validation to ensure this environment variable exists. This leads to undefined JWT secrets, making tokens unverifiable and causing authentication failures.

```typescript
// Current problematic code:
const decoded = jwt.verify(token, process.env['JWT_SECRET']!) as JwtPayload;
// If JWT_SECRET is undefined, this will throw cryptic errors
```

### Impact:
- **Security Risk**: Undefined secret = weak/broken authentication
- **App Crashes**: JWT operations fail with unclear error messages
- **Development Issues**: Hard to debug authentication problems

### Fix Implementation:

**Solution**: Use the validated environment configuration instead of direct process.env access.

```typescript
// Create/Use env.validation.ts (already exists):
export const envConfig = validateEnvironment();

// Fixed auth middleware:
import { envConfig } from '../config/env.validation';

const decoded = jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
```

**Benefits**:
- ✅ Environment validation on startup
- ✅ Default values for development
- ✅ Clear error messages for missing variables
- ✅ Consistent configuration across the app

---

## Bug #3: Missing Dependency in useEffect Hook (Performance Issue)

### Location:
- File: `myapp/app/(tabs)/orders.tsx`
- Lines: 66-70

### Description:
The `useEffect` hook that loads orders when the token changes is missing `loadOrdersFromBackend` in its dependency array. This violates the ESLint exhaustive-deps rule and can lead to stale closures and unexpected behavior.

```typescript
// Current problematic code:
useEffect(() => {
  if (token) {
    loadOrdersFromBackend(token);
  }
}, [token]); // Missing loadOrdersFromBackend dependency
```

### Impact:
- **Stale Closures**: Function might reference old versions of loadOrdersFromBackend
- **Inconsistent Behavior**: Effect might not run when function implementation changes
- **Developer Experience**: ESLint warnings that are often ignored

### Fix Implementation:

**Solution**: Memoize the function with useCallback and include it in the dependency array.

```typescript
// Step 1: Add useCallback import
import React, { createContext, ReactNode, useEffect, useState, useCallback } from 'react';

// Step 2: Wrap function with useCallback in OrdersContext
const loadOrdersFromBackend = useCallback(async (token: string) => {
  setIsLoading(true);
  setError(null);
  // ... function implementation ...
}, []); // Empty dependency array since function doesn't depend on state

// Step 3: Include function in useEffect dependencies
useEffect(() => {
  if (token) {
    loadOrdersFromBackend(token);
  }
}, [token, loadOrdersFromBackend]); // Now safe to include
```

**Benefits**:
- ✅ Follows React exhaustive-deps rule
- ✅ Prevents stale closures
- ✅ Stable function reference prevents infinite re-renders
- ✅ Better ESLint compliance

---

## Summary of Fixes Applied

1. **🔒 Fixed Race Condition**: Implemented atomic inventory operations with rollback mechanism
2. **🛡️ Fixed JWT Security**: Added environment validation and consistent config usage  
3. **⚡ Fixed React Hook**: Memoized function and fixed dependency array

These fixes address critical security, data integrity, and performance issues in the pharmacy application. The changes ensure:
- Safe concurrent order processing
- Reliable authentication system
- Proper React hook patterns

All fixes have been implemented and are ready for testing.