# FauxDataForge

FauxDataForge is a flexible API for generating, storing, and managing fake data based on user-defined schemas. Built with Express.js and Faker.js, this tool is perfect for creating realistic mock data for testing, development, and demonstration purposes.

## Features

- Custom schema-based fake data generation
- Data storage and retrieval
- File listing and deletion
- Swagger documentation for API exploration
- Image generation support

## Prerequisites

- Node.js (v14 or later recommended)
- npm

## Quick Start

1. Clone the repository:
   ```
   git clone https://github.com/ShivdeepJha/FauxDataForge.git
   cd FauxDataForge
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Access the Swagger documentation at `http://localhost:3000/api-docs`

## API Endpoints

- `POST /generate-data`: Generate and store fake data
- `GET /get-data/{key}`: Retrieve stored data
- `GET /list-files`: List all stored data files
- `DELETE /delete-data/{key}`: Delete specific data file

For detailed information, refer to the Swagger documentation.

## Image Generation

FauxDataForge now supports image generation as part of the fake data creation process. You can include image fields in your schema with the following properties:

- `type`: Set to "image"
- `width`: Desired image width (default: 200)
- `height`: Desired image height (default: 200)
- `category`: Optional category for the image (e.g., "nature", "people", etc.)

Example schema with image:
```json
{
  "name": "name",
  "email": "email",
  "profile_picture": {
    "type": "image",
    "width": 300,
    "height": 300,
    "category": "people"
  }
}
```

The generated image URL will be a placeholder from picsum.photos, simulating different images for each record.

## Development

- Run `npm start` to start the server with nodemon for auto-reloading during development.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [Faker.js](https://fakerjs.dev/)
- [Swagger UI Express](https://github.com/scottie1984/swagger-ui-express)
- [uuid](https://github.com/uuidjs/uuid)
- [Picsum Photos](https://picsum.photos/) for image placeholders