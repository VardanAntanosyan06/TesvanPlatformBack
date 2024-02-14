const swaggerAutogen = require('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = ['./routes/*.js'];

const config = {
  info: {
    title: 'Blog API Documentation',
    description: '',
  },
  tags: [],
  host: 'localhost:4000/api/v2',
  schemes: ['http'],
};

swaggerAutogen(outputFile, endpointsFiles, config);