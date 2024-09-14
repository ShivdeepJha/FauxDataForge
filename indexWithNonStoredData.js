const express = require('express');
const app = express();
const faker = require('@faker-js/faker');
const { v4: uuidv4 } = require('uuid'); // For generating unique keys
const PORT = 3000;

// In-memory storage for generated data
let storedData = {};

// Middleware to parse JSON requests
app.use(express.json());

// Recursive function to generate fake data based on schema
function generateFakeData(schema) {
  const record = {};

  for (let field in schema) {
    if (schema.hasOwnProperty(field)) {
      const type = schema[field];

      // Handle nested object schemas
      if (typeof type === 'object' && !Array.isArray(type) && type.type !== 'array') {
        record[field] = generateFakeData(type);  // Recursive call for nested schema
      } 
      // Handle arrays with specified size
      else if (type.type === 'array' && type.size && type.schema) {
        const minSize = type.size[0];
        const maxSize = type.size[1];
        const arraySize = faker.faker.number.int({ min: minSize, max: maxSize });

        record[field] = [];
        for (let i = 0; i < arraySize; i++) {
          record[field].push(generateFakeData(type.schema));  // Recursively generate array elements
        }
      } 
      // Handle primitive data types (e.g., name, email, etc.)
      else {
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

// POST route to generate and store fake data based on schema and count
app.post('/generate-data', (req, res) => {
  const { schema, count } = req.body;

  // Validate schema and count
  if (!schema || !count) {
    return res.status(400).json({ error: 'Please provide a valid schema and count' });
  }

  const fakeData = [];

  // Loop to generate the specified number of records
  for (let i = 0; i < count; i++) {
    const record = generateFakeData(schema);  // Generate data for the entire schema
    fakeData.push(record);
  }

  // Generate a unique key for the dataset and store it
  const key = uuidv4();
  storedData[key] = fakeData;

  // Return the generated fake data along with the key
  res.json({ key, data: fakeData });
});

// GET route to retrieve stored data by key
app.get('/get-data/:key', (req, res) => {
  const key = req.params.key;

  // Check if the key exists in stored data
  if (!storedData[key]) {
    return res.status(404).json({ error: 'Data not found for the given key' });
  }

  // Return the stored data
  res.json(storedData[key]);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
