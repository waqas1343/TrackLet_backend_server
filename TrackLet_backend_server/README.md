# Tracklet Backend Server

This is the backend server for the Tracklet application, built with Node.js and Express.

## Recent Improvements

See [IMPROVEMENTS.md](IMPROVEMENTS.md) for details on recent enhancements including:
- Better file organization
- Removal of unused components
- Code cleanup and optimization
- New utility scripts

## Project Structure

```
TrackLet_backend_server/
├── config/                 # Database configuration
├── middleware/             # Custom middleware functions
├── models/                 # Mongoose models
├── routes/                 # API routes
├── tests/                  # Test scripts and utilities
├── uploads/                # Uploaded files storage
├── utils/                  # Utility functions
├── .env                    # Environment variables
├── package.json            # Project dependencies
├── server.js               # Main server file
└── README.md               # This file
```

## API Endpoints

### Authentication
- `POST /api/super-admin/register` - Register super admin
- `POST /api/super-admin/login` - Super admin login
- `POST /api/login` - User login

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/reset` - Reset user password
- `POST /api/users/:id/track` - Track user activity
- `GET /api/users/email/:email` - Get user by email

### Companies
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Gas Plants
- `GET /api/gasPlants/:ownerEmail` - Get gas plant by owner email
- `PUT /api/gasPlants/update/:ownerEmail` - Update gas plant info
- `POST /api/gasPlants/upload-image/:ownerEmail` - Upload gas plant image
- `GET /api/gasPlants/list` - Get list of plants

### Orders
- `GET /api/orders` - Get orders (with query params)
- `GET /api/orders/plant/:plantId` - Get orders for a plant
- `GET /api/orders/all` - Get all orders
- `POST /api/orders` - Create order
- `PUT /api/orders/:id/accept` - Accept order
- `PUT /api/orders/:id/reject` - Reject order
- `PUT /api/orders/:id/complete` - Complete order
- `PUT /api/orders/:id/cancel` - Cancel order
- `PUT /api/orders/:id` - Update order status

### Rates
- `POST /api/rates` - Set today's rate
- `GET /api/rates/current` - Get current rate
- `GET /api/rates/history` - Get rate history

### Tanks
- `GET /api/tanks/owner/:ownerId` - Get tanks for owner
- `GET /api/tanks/:id` - Get tank by ID
- `POST /api/tanks` - Create tank
- `PUT /api/tanks/:id` - Update tank
- `DELETE /api/tanks/:id` - Delete tank
- `POST /api/tanks/:id/add-gas` - Add gas to tank
- `POST /api/tanks/:id/freeze-gas` - Freeze gas in tank
- `POST /api/tanks/:id/unfreeze-gas` - Unfreeze gas in tank
- `POST /api/tanks/deduct-stock` - Deduct stock from tanks
- `GET /api/tanks/owner/:ownerId/transactions` - Get transactions
- `GET /api/tanks/owner/:ownerId/stats` - Get stock statistics

### Expenses
- `GET /api/expenses/user/:userId` - Get expenses for user
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/user/:userId/stats` - Get expense statistics

### Drivers
- `GET /api/drivers/employer/:employerId` - Get drivers for employer
- `GET /api/drivers/:id` - Get driver by ID
- `POST /api/drivers` - Create driver
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `GET /api/drivers/employer/:employerId/stats` - Get driver statistics

### Employees
- `GET /api/employees/employer/:employerId` - Get employees for employer
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee
- `GET /api/employees/employer/:employerId/stats` - Get employee statistics

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

3. Start the server:
   ```
   npm start
   ```

## Development Scripts

Check the `tests/` directory for various utility scripts for development and testing.

## Notes

- The server listens on all network interfaces to allow connections from physical devices
- All API routes are prefixed with `/api`
- The server uses MongoDB as the database
- Authentication is handled with JWT tokens