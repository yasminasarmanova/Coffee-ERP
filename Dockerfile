# Используем легкий образ Node.js
FROM node:22-alpine AS build

# Устанавливаем рабочую директорию
WORKDIR /app

# Сначала копируем файлы зависимостей и устанавливаем их
COPY package*.json ./
RUN npm install

# Копируем остальной код
COPY . .

# Собираем проект для продакшена
RUN npm run build

# Используем сервер для раздачи собранных файлов
FROM node:18-alpine
RUN npm install -g serve
COPY --from=build /app/dist /app/dist

EXPOSE 3000
CMD ["serve", "-s", "app/dist", "-l", "3000"]