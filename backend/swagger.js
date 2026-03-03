// swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

// Definição básica do Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quadar Inshallah API",
      version: "1.0.0",
      description: "Documentação da API do e-commerce Quadar Inshallah",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./routes/*.js"], // Swagger vai ler os comentários JSDoc das rotas
};

const specs = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
}