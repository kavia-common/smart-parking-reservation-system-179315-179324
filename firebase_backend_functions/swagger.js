const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Smart Parking Reservation API',
      version: '1.0.0',
      description: 'Backend APIs for lots, slots, bookings, payments, auth, and analytics.',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Firebase ID token in Authorization: Bearer <token>',
        },
      },
    },
    security: [],
    tags: [
      { name: 'Health', description: 'Health checks' },
      { name: 'Auth', description: 'Authentication and authorization endpoints.' },
      { name: 'Lots', description: 'Parking lots management and listing.' },
      { name: 'Slots', description: 'Slots listing and admin operations.' },
      { name: 'Bookings', description: 'Booking lifecycle endpoints.' },
      { name: 'Payments', description: 'Payment related endpoints (optional, Stripe).' },
      { name: 'Analytics', description: 'Admin analytics endpoints.' },
    ],
  },
  apis: ['./src/routes/*.js'], // Scan all route files
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
