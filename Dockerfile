FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy the entire workspace
# (In production we typically just copy what we need, but since frontend/ and backend/ are both needed)
COPY . .

# Set WORKDIR to backend to install dependencies
WORKDIR /app/backend
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Create the SQLite DB (optional: skip this and let migrations run on init, but doing it here guarantees the db file is present)
# Note: For SQLite in Docker, using a mounted volume for the db is strictly required to persist data.
# We run migrate deploy to ensure schema is pushed to the embedded DB.
ENV DATABASE_URL="file:./dev.db"

# Expose the API and static server port
EXPOSE 4010
ENV PORT=4010

# Command to run migrations and start the server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
