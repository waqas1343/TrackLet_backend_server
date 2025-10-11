# Tracklet Pro Backend

Backend API for Tracklet Pro application built with Node.js, Express, and MongoDB.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

## Development

```bash
# Run in development mode
npm run dev
```

## Production

```bash
# Build for production
npm install --production

# Start production server
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

## Deployment on Render

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" and select "Web Service"
4. Connect your repository
5. Configure the following settings:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: production
     - `PORT`: 10000
     - `JWT_SECRET`: (generate a secure secret)
     - `MONGO_URI`: (your MongoDB connection string)
6. Click "Create Web Service"

## Environment Variables

- `PORT` - Port to run the server on (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation
- `NODE_ENV` - Environment (development/production)

## License

This project is licensed under the MIT License.
