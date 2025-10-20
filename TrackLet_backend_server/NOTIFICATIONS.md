# Tracklet Notification System

## Overview
The Tracklet notification system provides real-time notifications for order flow between Gas Plants and Distributors. It uses MongoDB for persistent storage and Socket.IO for real-time communication.

## Notification Flow

### 1. Order Placement
- **Trigger**: Distributor places an order
- **Notification**: Sent to Gas Plant
- **Type**: `order_placed`

### 2. Order Acceptance
- **Trigger**: Gas Plant accepts an order
- **Notification**: Sent to Distributor
- **Type**: `order_accepted`

### 3. Driver Assignment
- **Trigger**: Distributor assigns a driver to an accepted order
- **Notification**: Sent to Gas Plant
- **Type**: `driver_assigned`

### 4. Order Completion
- **Trigger**: Gas Plant completes an order
- **Notification**: Sent to Distributor
- **Type**: `order_completed`

### 5. Order Rejection
- **Trigger**: Gas Plant rejects an order
- **Notification**: Sent to Distributor
- **Type**: `order_rejected`

### 6. Order Cancellation
- **Trigger**: Gas Plant cancels an order
- **Notification**: Sent to Distributor
- **Type**: `order_cancelled`

## Notification Model

```javascript
{
  receiverId: ObjectId,    // User receiving the notification
  senderId: ObjectId,      // User sending the notification
  title: String,           // Notification title
  message: String,         // Notification message
  orderId: ObjectId,       // Related order (optional)
  status: String,          // 'unread' or 'read'
  type: String,            // Notification type
  timestamp: Date          // When notification was created
}
```

## API Endpoints

### Send Notification
```
POST /api/notifications/send
```

### Get User Notifications
```
GET /api/notifications/:userId
```

### Mark Notification as Read
```
PATCH /api/notifications/:notificationId/read
```

### Mark All Notifications as Read
```
PATCH /api/notifications/:userId/read-all
```

### Get Unread Count
```
GET /api/notifications/:userId/unread-count
```

### Delete Notification
```
DELETE /api/notifications/:notificationId
```

## Real-time Updates

The system uses Socket.IO for real-time notifications:

### Client Connection
```javascript
const socket = io('http://localhost:5000');

// Join user room
socket.emit('join', userId);

// Listen for new notifications
socket.on('newNotification', (notification) => {
  console.log('New notification:', notification);
});
```

## Notification Types

| Type | Description | Sent To |
|------|-------------|---------|
| `order_placed` | New order created | Gas Plant |
| `order_accepted` | Order accepted | Distributor |
| `driver_assigned` | Driver assigned | Gas Plant |
| `order_completed` | Order completed | Distributor |
| `order_rejected` | Order rejected | Distributor |
| `order_cancelled` | Order cancelled | Distributor |
| `general` | General notification | Any user |

## Implementation Details

### Backend Structure
```
controllers/
  notificationsController.js
models/
  Notification.js
routes/
  notifications.js
services/
  notificationService.js
utils/
  socket.js
```

### Key Features
1. **Persistent Storage**: All notifications are stored in MongoDB
2. **Real-time Updates**: Socket.IO for instant notification delivery
3. **Role-based Routing**: Notifications sent to appropriate users based on role
4. **Status Tracking**: Unread/read status for notifications
5. **Type Classification**: Different notification types for filtering
6. **Error Handling**: Comprehensive error handling and logging

## Testing

Run the test script to verify notification functionality:
```bash
node test_notifications.js
```

## Integration with Frontend

Frontend applications should:
1. Connect to Socket.IO server
2. Join user-specific rooms
3. Listen for `newNotification` events
4. Use API endpoints to manage notifications
5. Display notifications in UI

## Security

- All notification endpoints require authentication
- Users can only access their own notifications
- Proper validation of all input data
- Role-based access control for notification sending