# Используем легковесный nginx-образ
FROM nginx:alpine

# Устанавливаем рабочую директорию
WORKDIR /usr/share/nginx/html

# Копируем статические файлы
COPY . .

# Настраиваем nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт 80 (стандартный для nginx)
EXPOSE 80

# Nginx автоматически запускается при старте контейнера