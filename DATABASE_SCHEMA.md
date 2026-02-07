# Database Schema Documentation

## Overview
This document outlines the database schema for the E-Commerce API, designed using **TypeORM** with **MySQL/PostgreSQL** compatibility.

## Tables

### 1. Users (`user`)
Stores user account information.
- **id** (UUID/ULID): Primary Key.
- **email** (VARCHAR, Unique): User email address.
- **password** (VARCHAR): Hashed password.
- **roles** (Relation): One-to-Many relation with `UserRole`.
- **active** (BOOLEAN): Account status.

### 2. Roles (`roles`)
Defines system roles (e.g., Admin, User).
- **id** (UUID): Primary Key.
- **name** (VARCHAR): Role name ('admin', 'user').

### 3. User Roles (`user_roles`)
Join table for Users and Roles.
- **userId** (FK): Links to `User`.
- **roleId** (FK): Links to `Roles`.

### 4. Products (`products`)
Stores product inventory.
- **id** (ULID, 26 chars): Primary Key (Sortable by time).
- **name** (VARCHAR): Product name.
- **description** (TEXT): Product details.
- **price** (DECIMAL 10,2): Unit price.
- **stock** (INT): Available quantity.
- **category** (VARCHAR): Product category.
- **imageUrl** (VARCHAR): URL to product image.
- **isActive** (BOOLEAN): Availability status.

### 5. Carts (`carts`)
Stores temporary shopping sessions.
- **id** (ULID): Primary Key.
- **userId** (FK): Owner of the cart (One-to-One effectively per active session).
- **isActive** (BOOLEAN): Cart status.

### 6. Cart Items (`cart_items`)
Individual items within a cart.
- **id** (ULID): Primary Key.
- **cartId** (FK): Links to `Cart`.
- **productId** (FK): Links to `Product`.
- **quantity** (INT): Quantity selected.
- **price** (DECIMAL): Snapshot of price at time of adding (optional/synced).

### 7. Orders (`orders`)
Finalized purchase records.
- **id** (ULID): Primary Key.
- **userId** (FK): Customer.
- **totalAmount** (DECIMAL): Final total.
- **status** (ENUM): `PENDING`, `PROCESSING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`.
- **paymentStatus** (ENUM): `PENDING`, `COMPLETED`, `FAILED`, `REFUNDED`.
- **paymentReference** (VARCHAR): External Transaction ID.
- **shippingAddress** (VARCHAR): Delivery location.

### 8. Order Items (`order_items`)
Snapshot of items in a finalized order.
- **id** (ULID): Primary Key.
- **orderId** (FK): Links to `Order`.
- **productId** (FK): Links to `Product` (for history).
- **productName** (VARCHAR): Snapshot of name (in case product updates).
- **price** (DECIMAL): Snapshot of price paid.
- **quantity** (INT): Quantity purchased.
- **subtotal** (DECIMAL): `price * quantity`.

## Relationships
- **User** 1 <-> N **Orders**
- **User** 1 <-> N **Carts**
- **Cart** 1 <-> N **CartItems**
- **Order** 1 <-> N **OrderItems**
- **Product** 1 <-> N **CartItems**
- **Product** 1 <-> N **OrderItems**
