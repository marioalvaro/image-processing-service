# 1. Use a lightweight Node.js 20 Linux image
FROM node:20-slim

# 2. Install OpenSSL (Required for Prisma to connect to PostgreSQL)
RUN apt-get update -y && apt-get install -y openssl

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy dependency files first (Leverages Docker layer caching)
COPY package*.json ./

# 5. Install dependencies
# (Using npm ci is strictly better for production, but npm install works)
RUN npm install

# 6. Copy Prisma schema and generate the database client
COPY prisma ./prisma/
RUN npx prisma generate

# 7. Copy the rest of your application code
COPY . .

# 8. Expose the API port (Documentation only, doesn't actually publish the port)
EXPOSE 3000

# 9. The default command to run when the container starts (Starts the API)
CMD ["node", "src/app.js"]