# Используем официальный образ Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости (включая dev-зависимости)
RUN npm install

# Копируем все файлы проекта
COPY . .

# Открываем порт, на котором работает Vite (5173)
EXPOSE 5173

# Запускаем dev-сервер с HMR
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]