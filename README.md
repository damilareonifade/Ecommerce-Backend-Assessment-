# NestJS E-Commerce API (Testing Waters)

A robust, enterprise-grade E-Commerce API built with **NestJS**, **TypeORM**, and **MySQL**.

## 🚀 Features

- **Product Management**: CRUD operations with **Cursor-based Pagination** for infinite scrolling.
- **Cart System**: Persistent user carts with real-time stock validation.
- **Order Processing**: 
  - **ACID Transactional** order creation (Stock deduction, Order creation, Cart clearing).
  - **Pessimistic Locking** to prevent stock race conditions.
- **Payment Integration**: 
  - **Strategy Pattern** implementation for payments.
  - **Facade Pattern** for interaction.
  - Currently supports `MockPaymentStrategy`.
- **Notification System**: 
  - **Redis + BullMQ** based background workers.
  - Asynchronous email dispatch upon Order Placement.
- **Security**: 
  - **Role-Based Access Control (RBAC)** (Admin vs User).
  - JWT Authentication.
  - Rate Limiting.
- **Performance**: 
  - **Redis Caching** for Product endpoints (`CacheInterceptor`).

## 🛠️ Tech Stack

- **Framework**: NestJS
- **Database**: MySQL (via TypeORM)
- **Queue**: BullMQ (Redis)
- **Cache**: Redis
- **Auth**: JWT (Passport)

## 📦 Setup & Installation

### Prerequisites
- Node.js (v18+)
- MySQL
- Redis

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Environment Variables
Copy `.env.example` to `.env` and configure:
```env
DB_HOST=localhost
DB_USER=root
DB_NAME=testing_waters
REDIS_HOST=localhost
JWT_SECRET=supersecret
```

### 3. Database Migrations
Run the migrations to create tables:
```bash
pnpm run migration:run
```

### 4. Seed Database
Populate database with sample products and users:
```bash
pnpm run seed
```

### 5. Run Server
```bash
pnpm start:dev
```
API available at: `http://localhost:8000/api/v1`

## 📖 API Documentation

### Products
- `GET /products` - List products (Public, Cached).
- `POST /products` - Create product (Admin).

### Cart
- `POST /cart` - Add item.
- `GET /cart` - View cart.
- `DELETE /cart` - Clear cart.

### Orders
- `POST /orders` - Create order from cart.
- `GET /orders` - User order history.
- `POST /orders/:id/checkout` - Process payment.

## 🏗️ Architecture Design

- **Module Pattern**: Feature-based separation (`ProductModule`, `CartModule`, `OrderModule`, `PaymentModule`).
- **Service Layer**: Business logic isolation.
- **Strategy Pattern**: `PaymentStrategy` allows swapping providers (Stripe, PayPal) without changing core logic.
- **Transactional Script**: `OrderService` manages complex atomic operations via `QueryRunner`.

---
**Author**: Damilare Onifade
