FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Viteのデフォルトポート
EXPOSE 5173

# ホストからのアクセスを許可するために --host を指定
CMD ["npm", "run", "dev", "--", "--host"]