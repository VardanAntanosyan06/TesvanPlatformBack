const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = ['./app.js'];

const config = {
  info: {
    title: 'Blog API Documentation',
    description: '',
  },
  tags: [],
  host: 'https://platform.tesvan.com/server/',
  schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, config);