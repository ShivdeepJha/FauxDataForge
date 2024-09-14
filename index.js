const express = require('express');
const fs = require('fs');
const path = require('path');
const faker = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Directory to store the generated data files
const DATA_DIR = path.join(__dirname, 'data');

// Create the directory if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// Swagger configuration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Fake Data API',
      version: '1.0.0',
      description: 'API to generate, store, and manage fake data based on a provided schema.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local server',
      },
    ],
  },
  apis: ['./index.js'], // File where the swagger comments will be present
};

// Swagger docs setup
const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Address:
 *       type: object
 *       properties:
 *         street:
 *           type: string
 *           example: "address"
 *         city:
 *           type: string
 *           example: "city"
 *         country:
 *           type: string
 *           example: "country"
 *     Company:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Fake Company"
 *         location:
 *           type: object
 *           properties:
 *             office:
 *               type: string
 *               example: "321 Office Road"
 *             phone:
 *               type: string
 *               example: "123-456-7890"
 *     Friend:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Friend Name"
 *         contact:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "friend@example.com"
 *             phone:
 *               type: string
 *               example: "987-654-3210"
 *     DataSchema:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "name"
 *         email:
 *           type: string
 *           example: "email"
 *         address:
 *           $ref: '#/components/schemas/Address'
 *         company:
 *           $ref: '#/components/schemas/Company'
 *         friends:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Friend'
 *     GenerateDataRequest:
 *       type: object
 *       properties:
 *         schema:
 *           $ref: '#/components/schemas/DataSchema'
 *         count:
 *           type: integer
 *           example: 5
 */

/**
 * @swagger
 * /generate-data:
 *   post:
 *     summary: Generate and store fake data based on schema and count
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GenerateDataRequest'
 *     responses:
 *       200:
 *         description: Fake data generated and stored successfully
 *       400:
 *         description: Invalid input schema or count
 */
app.post('/generate-data', (req, res) => {
  const { schema, count } = req.body;

  if (!schema || !count) {
    return res.status(400).json({ error: 'Please provide a valid schema and count' });
  }

  const fakeData = [];
  for (let i = 0; i < count; i++) {
    const record = generateFakeData(schema);
    fakeData.push(record);
  }

  const key = uuidv4();
  const filePath = path.join(DATA_DIR, `${key}.json`);
  fs.writeFileSync(filePath, JSON.stringify(fakeData, null, 2), 'utf-8');

  res.json({ key, data: fakeData });
});

/**
 * @swagger
 * /get-data/{key}:
 *   get:
 *     summary: Retrieve stored data by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique key for the stored data
 *     responses:
 *       200:
 *         description: Data retrieved successfully
 *       404:
 *         description: Data not found
 */
app.get('/get-data/:key', (req, res) => {
  const key = req.params.key;
  const filePath = path.join(DATA_DIR, `${key}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Data not found for the given key' });
  }

  const storedData = fs.readFileSync(filePath, 'utf-8');
  res.json(JSON.parse(storedData));
});

/**
 * @swagger
 * /list-files:
 *   get:
 *     summary: List all stored JSON files
 *     responses:
 *       200:
 *         description: A list of JSON file names
 */
app.get('/list-files', (req, res) => {
  fs.readdir(DATA_DIR, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read directory' });
    }

    const jsonFiles = files.filter(file => file.endsWith('.json')).map(file => path.basename(file, '.json'));
    res.json({ files: jsonFiles });
  });
});

/**
 * @swagger
 * /delete-data/{key}:
 *   delete:
 *     summary: Delete stored data by key
 *     parameters:
 *       - in: path
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique key for the stored data
 *     responses:
 *       200:
 *         description: Data deleted successfully
 *       404:
 *         description: Data not found
 */
app.delete('/delete-data/:key', (req, res) => {
  const key = req.params.key;
  const filePath = path.join(DATA_DIR, `${key}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Data not found for the given key' });
  }

  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to delete the file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

// Function to generate fake data recursively based on schema
function generateFakeData(schema) {
  const record = {};

  for (let field in schema) {
    if (schema.hasOwnProperty(field)) {
      const type = schema[field];

      if (typeof type === 'object' && !Array.isArray(type) && type.type !== 'array') {
        record[field] = generateFakeData(type);
      } else if (type.type === 'array' && type.size && type.schema) {
        const arraySize = faker.faker.number.int({ min: type.size[0], max: type.size[1] });
        record[field] = Array.from({ length: arraySize }, () => generateFakeData(type.schema));
      } else {
        switch (type) {
          case 'name':
            record[field] = faker.faker.person.fullName();
            break;
          case 'email':
            record[field] = faker.faker.internet.email();
            break;
          case 'address':
            record[field] = faker.faker.location.streetAddress();
            break;
          case 'city':
            record[field] = faker.faker.location.city();
            break;
          case 'country':
            record[field] = faker.faker.location.country();
            break;
          case 'phone':
            record[field] = faker.faker.phone.number();
            break;
          case 'company':
            record[field] = faker.faker.company.name();
            break;
          default:
            record[field] = faker.faker.lorem.word();
            break;
        }
      }
    }
  }

  return record;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Swagger docs are available at http://localhost:${PORT}/api-docs`);
});