/**
 * Server Entry Point
 */

import app from './app';

// Get port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🌟 Aura Tree API Server                                ║
║                                                          ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(37)}║
║   Port: ${PORT.toString().padEnd(46)}║
║   API URL: ${(`http://localhost:${PORT}`).padEnd(43)}║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  server.close(() => {
    process.exit(1);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default server;
