# AI Product Recommendation API

## 📌 Project Overview
This project is a NestJS-based backend API that provides product comparison and AI-powered recommendations.

## 🚀 Features
- Get product by barcode
- Compare similar products
- AI-based best product recommendation

## 🛠️ Tech Stack
- NestJS
- PostgreSQL
- Prisma ORM
- OpenRouter AI API

## 📡 API Endpoints

### 1. Get Product by Barcode
GET /products/barcode/:barcode

### 2. Compare Products
GET /products/compare/:barcode

### 3. AI Recommendation
POST /ai/recommend

Request Body:
{
  "barcode": "123456"
}

Response:
{
  "success": true,
  "data": {
    "bestProduct": "Product Name",
    "reason": "Why it is best",
    "summary": "Detailed explanation"
  }
}

## ⚙️ Setup Instructions

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
