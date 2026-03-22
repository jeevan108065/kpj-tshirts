import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KPJ API",
      version: "1.0.0",
      description: "REST API for KPJ — products, orders, leads, quotes, and more.",
    },
    servers: [
      { url: "http://localhost:3001", description: "Local dev" },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          description: "Admin token obtained from POST /api/auth/login",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const spec = swaggerJsdoc(options);

export function setupSwagger(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(spec));
  // Expose raw JSON spec
  app.get("/api-docs.json", (_req, res) => res.json(spec));
}
