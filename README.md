# Khammaghani – Food Ordering & Delivery Platform

Khammaghani is a full stack food ordering and delivery platform where customers can order food, restaurants can manage menus and orders, and delivery partners can manage deliveries. The system also includes an admin panel for platform management.

## Live Demo

(https://khammaghani.online)

## Platform Highlights

- Multi role platform (Customer, Restaurant, Delivery, Admin)
- Order management system
- Razorpay payment integration
- Restaurant dashboard
- Delivery partner dashboard
- Admin control panel
- Secure authentication system

## Core Features

### Customer Features
- User signup/login
- Browse food items
- Add to cart
- Place orders
- Online payment
- Order tracking
- Order history

### Restaurant Dashboard
- Restaurant login
- Add food items
- Edit menu
- Manage orders
- Update order status

### Delivery Partner Dashboard
- Delivery partner login
- View assigned orders
- Update delivery status
- Delivery management

### Admin Panel
- Manage users
- Manage restaurants
- Manage orders
- Platform monitoring
- System control

### Payment System
- Razorpay integration
- Secure payment verification
- Order payment tracking

### Security
- JWT authentication
- Protected routes
- Password hashing (bcrypt)
- Role based access control

## Tech Stack

Frontend:
- React
- JavaScript
- CSS
- Axios

Backend:
- Node.js
- Express.js

Database:
- MongoDB
- Mongoose

Authentication:
- JWT
- bcrypt

Payments:
- Razorpay

Architecture:
- REST API

Deployment:
- Frontend - Vercel
- Backend - Render

## System Architecture

Customer App → API → Database  
Restaurant Dashboard → API → Database  
Delivery Dashboard → API → Database  
Admin Panel → API → Database  

React → Express → MongoDB

## Project Structure

client/
customer-ui
restaurant-dashboard
delivery-dashboard
admin-panel

server/
controllers
routes
models
middleware
config

## Installation

Clone repository:

git clone https://github.com/Ajaypal110/Khammaghani

Install dependencies:

npm install

Run project:

npm run dev

## Technical Highlights

- Multi-role authentication system
- Role based access control
- Order lifecycle management
- Payment workflow integration
- Scalable backend structure
- REST API design
- Error handling middleware

## Future Improvements

- Real-time order tracking
- Push notifications
- Mobile app
- Analytics dashboard
- Performance optimization

## Author

Ajaypal Singh  
Full Stack MERN Developer

GitHub:
https://github.com/Ajaypal110

Portfolio: (https://portfolio-ajaypalsingh.vercel.app)

Fiverr: (https://www.fiverr.com/s/KeQB3rl)
