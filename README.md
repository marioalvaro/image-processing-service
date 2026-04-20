# Distributed Image Processing Service

An enterprise-grade, asynchronous image processing backend similar to Cloudinary. Built with Node.js, this service allows users to securely upload high-resolution media to AWS S3, queue complex image transformations, and retrieve images in various formats without blocking the main application thread.

## Features

**User Authentication**

* **Sign-Up & Log-In:** Secure user registration and authentication.
* **JWT Authentication:** All image management endpoints are strictly protected using JSON Web Tokens (JWT).

**Image Management & Transformation**

* **Upload Image:** Direct raw image ingestion to cloud storage.
* **Transform Image:** Support for a wide array of operations including: Resize and Filters (Grayscale).
* **Retrieve:** Fetch specific image metadata.

## Tech Stack

* **Core:** Node.js, Express.js
* **Database:** PostgreSQL (Managed via Prisma ORM)
* **Message Broker:** Redis & BullMQ
* **Storage:** AWS S3
* **Image Processing:** Sharp (C++ based image manipulation)
* **Infrastructure:** Docker, GitHub Actions (CI/CD)

## Key Architectural Features

* **Asynchronous Processing:** Utilizes the "On-Demand" processing model. Expensive CPU-bound image transformations are offloaded from the Express event loop to isolated background workers via BullMQ, preventing Thread Starvation.
* **Polymorphic Transformer Factory:** Image transformations are dynamically built using the Registry/Factory OOP pattern, adhering to the Open-Closed Principle for infinite extensibility without modifying core worker logic.
* **Distributed Rate Limiting:** API endpoints are protected by a Redis-backed rate limiter, ensuring global consistency across multiple server instances to prevent abuse and DDoS attacks.
* **Containerized CI/CD:** Fully Dockerized architecture with automated builds pushed to the GitHub Container Registry (GHCR) upon merging to `main`.

---

## Prerequisites

To run this project locally, you will need:

* **Node.js** (v20+)
* **Docker & Docker Compose** (For local Redis and PostgreSQL)
* An **AWS Account** with an S3 Bucket and IAM credentials.

---

## Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/image-processing-service.git
cd image-processing-service
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory and populate it:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/image_db"

# Redis Queue
REDIS_URL="redis://localhost:6379"

# Security
JWT_SECRET="your_super_secret_jwt_key"

# AWS S3 Storage
AWS_REGION="your_region"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_S3_BUCKET_NAME="your-bucket-name"

# Rate Limiting
RATE_LIMIT_GLOBAL_WINDOW_MS=900000
RATE_LIMIT_GLOBAL_MAX=100
RATE_LIMIT_STRICT_WINDOW_MS=3600000
RATE_LIMIT_STRICT_MAX=20
```

### 3. Database Migration

Generate the Prisma client and push your schema to the database:

```bash
npx prisma generate
npx prisma db push
```

### 4. Start the Application

Because this is a distributed system, you need to run both the API and the Background Worker. Open two terminal tabs:

**Terminal 1 (The API Server):**

```bash
npm run dev
```

**Terminal 2 (The Background Worker):**

```bash
npm run worker
```

---

## API Reference

### Authentication Endpoints

**1. Register a new user**

* **Endpoint:** `POST /register`
* **Body:**

  ```json
  {
    "username": "user1",
    "password": "password123"
  }
  ```

* **Response:** Returns the user object and a JWT token.

**2. Log in an existing user**

* **Endpoint:** `POST /login`
* **Body:**

  ```json
  {
    "username": "user1",
    "password": "password123"
  }
  ```

* **Response:** Returns the user object and a JWT token.

### Image Management Endpoints

*Note: All endpoints below require an `Authorization: Bearer <JWT>` header.*

**1. Upload an image**

* **Endpoint:** `POST /images`
* **Content-Type:** `multipart/form-data`
* **Body:** `image` (File)
* **Response:** Uploaded image details (URL, metadata).

**2. Apply transformations to an image**

* **Endpoint:** `POST /images/:id/transform`
* **Content-Type:** `application/json`
* **Body:**

  ```json
  {
    "transformations": {
      "resize": {
        "width": 800,
        "height": 600
      },
      "filters": {
        "grayscale": true
      }
    }
  }
  ```

* **Response (202 Accepted):** Returns immediately while the worker processes the job in the background.

**3. Retrieve an image**

* **Endpoint:** `GET /images/:id`
* **Response:** Returns the actual image details and processing status.


