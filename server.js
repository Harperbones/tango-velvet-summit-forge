/**
 * The Reading Room — Signaling + Matching Server
 * -----------------------------------------------
 * Simple Node.js + Socket.io server that randomly pairs users
 * and relays WebRTC signaling messages.
 *
 * Deploy this to Render.com (free tier) or Railway / Fly.io.
 *
 * On Render:
 * 1. New → Web Service
 * 2. Connect a GitHub repo that contains this file + package.json
 *    OR use the "Deploy from existing repo / upload" options
 * 3. Build Command:  npm install
 * 4. Start Command:  node server.js
 * 5. After deploy, copy the public URL (https://xxxx.onrender.com)
 *    and paste it into the website.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.get('/', (req, res) => {
  res.send('The Reading Room signaling server is running.');
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Simple in-memory queue of waiting socket IDs
const waiting = [];

// Map socket.id → partner socket.id
const partners = new Map();

function removeFromWaiting(id) {
  const idx = waiting.indexOf(id);
  if (idx !== -1) waiting.splice(idx, 1);
}

function clearPartner(id) {
  const partnerId = partners.get(id);
  if (partnerId) {
    partners.delete(id);
    partners.delete(partnerId);
    const partnerSocket = io.sockets.sockets.get(partnerId);
    if (partnerSocket) {
      partnerSocket.emit('partner-left');
    }
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', () => {
    // Already waiting or already matched? Clean up first
    removeFromWaiting(socket.id);
    clearPartner(socket.id);

    if (waiting.length > 0) {
      // Pair with the first person waiting
      const partnerId = waiting.shift();
      const partnerSocket = io.sockets.sockets.get(partnerId);

      if (!partnerSocket) {
        // Partner already left, try again later
        waiting.push(socket.id);
        socket.emit('status', 'Still looking for a quiet soul…');
        return;
      }

      partners.set(socket.id, partnerId);
      partners.set(partnerId, socket.id);

      // One side creates the offer
      socket.emit('matched', { partnerId, initiator: true });
      partnerSocket.emit('matched', { partnerId: socket.id, initiator: false });

      console.log(`Matched ${socket.id} ↔ ${partnerId}`);
    } else {
      waiting.push(socket.id);
      socket.emit('status', 'Waiting for someone to enter the room…');
    }
  });

  socket.on('next', () => {
    clearPartner(socket.id);
    removeFromWaiting(socket.id);
    // Re-join the queue
    socket.emit('join'); // will be handled by the join handler above
    // Actually call the same logic
    if (waiting.length > 0) {
      const partnerId = waiting.shift();
      const partnerSocket = io.sockets.sockets.get(partnerId);
      if (partnerSocket) {
        partners.set(socket.id, partnerId);
        partners.set(partnerId, socket.id);
        socket.emit('matched', { partnerId, initiator: true });
        partnerSocket.emit('matched', { partnerId: socket.id, initiator: false });
        console.log(`Next matched ${socket.id} ↔ ${partnerId}`);
      } else {
        waiting.push(socket.id);
      }
    } else {
      waiting.push(socket.id);
      socket.emit('status', 'Looking for the next stranger…');
    }
  });

  // Relay WebRTC signaling (offer / answer / ICE)
  socket.on('signal', ({ to, signal }) => {
    const target = io.sockets.sockets.get(to);
    if (target) {
      target.emit('signal', { from: socket.id, signal });
    }
  });

  // Text chat
  socket.on('chat', ({ to, message }) => {
    const target = io.sockets.sockets.get(to);
    if (target) {
      target.emit('chat', message);
    }
  });

  socket.on('leave', () => {
    clearPartner(socket.id);
    removeFromWaiting(socket.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    clearPartner(socket.id);
    removeFromWaiting(socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Reading Room signaling server listening on port ${PORT}`);
});
