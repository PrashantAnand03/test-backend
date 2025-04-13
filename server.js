const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const documentRoutes = require('./routes/documents');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// const corsOrigin = process.env.FRONTEND_URL || 'http://localhost:3000'; // Default to localhost if not set in .env

// // Configure CORS for HTTP requests
// app.use(cors({
//     origin: corsOrigin, // Dynamically set the origin
//     methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
//     allowedHeaders: ['Content-Type', 'Authorization'] // Allowed headers
// }));

const allowedOrigins = [
    'https://real-time-collaborative-web-app.vercel.app',
  ];
  
  // Configure CORS for HTTP requests
  const vercelPreviewPattern = /^https:\/\/real-time-collaborative-web-[\w-]+\.vercel\.app$/;
  
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
  
  // Express CORS
app.use(cors(corsOptions));

// // Socket.io setup for real-time collaboration
// const io = new Server(server, {
//     cors: {
//         origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Dynamically set the origin for socket.io
//         methods: ['GET', 'POST']
//     }
// });


// Socket.io CORS
const io = new Server(server, {
    cors: corsOptions,
  });

  
  
// Middleware and routes
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

//connection happens when a io called made from socket.io client
io.on('connection', (socket) => {
    console.log('New WebSocket connection');

    //user on documentdetails - useuseffect
    socket.on('joinDocument', (documentId) => {
        socket.join(documentId);
        console.log(`User joined document ${documentId}`);
    });
    // user when changes the input feild values
    socket.on('documentUpdate', ({ documentId, title, content }) => {
        socket.to(documentId).emit('receiveUpdate', { title, content });
    });

    //this is not used by the frontend
    socket.on('sendMessage', ({ documentId, message }) => {
        socket.to(documentId).emit('receiveMessage', message);
    });
});

app.get('/', (req, res) => {
    res.send('Backend is running.....');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


// module.exports.handler = serverless(app); 