require('dotenv').config();

console.log('Environment variables test:');
console.log('- PORT:', process.env.PORT);
console.log('- MONGO_URI:', process.env.MONGO_URI);
console.log('- JWT_SECRET:', process.env.JWT_SECRET);