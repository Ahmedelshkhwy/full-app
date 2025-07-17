# استخدام Node.js 20 LTS
FROM node:20-alpine

# تعيين مجلد العمل
WORKDIR /app

# نسخ package files
COPY package*.json ./

# تثبيت dependencies
RUN npm ci --only=production

# نسخ باقي الملفات
COPY . .

# بناء التطبيق
RUN npm run build

# كشف المنفذ
EXPOSE 5000

# تشغيل التطبيق
CMD ["npm", "start"]
