FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
RUN npx nest build

EXPOSE 3001

# Wait for DB, run migrations, seed, then start
CMD ["sh", "-c", "\
  echo 'Waiting for database...' && \
  sleep 5 && \
  echo 'Running migrations...' && \
  npx prisma migrate deploy && \
  echo 'Seeding database...' && \
  node -e 'require(\"./dist/main.js\")' 2>/dev/null || true && \
  echo 'Starting POS Backend...' && \
  node dist/main.js"]
