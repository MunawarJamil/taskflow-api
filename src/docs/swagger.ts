// import { Options } from "swagger-jsdoc";

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "TaskFlow API",
    version: "1.0.0",
    description:
      "A project and task management REST API with workspaces, RBAC, and comments",
  },
  servers: [
    {
      url: "http://localhost:5001",
      description: "Local development",
    },
    {
      url: "https://later-railway-url.railway.app",
      description: "Production",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  paths: {
    "/api/v1/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "User registered successfully" },
          400: { description: "Validation error" },
          409: { description: "Email already in use" },
        },
      },
    },

    "/api/v1/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and get tokens",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "secret123" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Returns accessToken and refreshToken" },
          401: { description: "Invalid credentials" },
        },
      },
    },

    "/api/v1/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh access token",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["refreshToken"],
                properties: {
                  refreshToken: { type: "string", example: "eyJhbGci..." },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Returns new accessToken" },
          401: { description: "Invalid or expired refresh token" },
        },
      },
    },

    "/api/v1/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and invalidate refresh token",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Logged out successfully" },
          401: { description: "Unauthorized" },
        },
      },
    },

    //  workspace routes
    "/api/v1/workspaces": {
      post: {
        tags: ["Workspaces"],
        summary: "Create a new workspace",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "My Company" },
                  description: { type: "string", example: "Main workspace" },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Workspace created" },
          401: { description: "Unauthorized" },
        },
      },
      get: {
        tags: ["Workspaces"],
        summary: "Get all workspaces for current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "List of workspaces" },
          401: { description: "Unauthorized" },
        },
      },
    },

    "/api/v1/workspaces/{id}": {
      get: {
        tags: ["Workspaces"],
        summary: "Get a workspace by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Workspace details" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      patch: {
        tags: ["Workspaces"],
        summary: "Update a workspace (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Updated Name" },
                  description: {
                    type: "string",
                    example: "Updated description",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Workspace updated" },
          403: { description: "Forbidden - admin only" },
        },
      },
      delete: {
        tags: ["Workspaces"],
        summary: "Delete a workspace (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Workspace deleted" },
          403: { description: "Forbidden - admin only" },
        },
      },
    },

    "/api/v1/workspaces/{id}/members": {
      get: {
        tags: ["Workspaces"],
        summary: "Get all members of a workspace",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "List of members" },
          403: { description: "Forbidden" },
        },
      },
      post: {
        tags: ["Workspaces"],
        summary: "Invite a member to workspace (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "role"],
                properties: {
                  email: { type: "string", example: "jane@example.com" },
                  role: {
                    type: "string",
                    enum: ["ADMIN", "MEMBER"],
                    example: "MEMBER",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Member invited" },
          403: { description: "Forbidden - admin only" },
          404: { description: "User not found" },
        },
      },
    },

    "/api/v1/workspaces/{id}/members/{userId}": {
      delete: {
        tags: ["Workspaces"],
        summary: "Remove a member from workspace (admin only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "userId",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: { description: "Member removed" },
          403: { description: "Forbidden - admin only" },
        },
      },
    },

    // project routes
    "/api/v1/workspaces/{id}/projects": {
      post: {
        tags: ["Projects"],
        summary: "Create a project in a workspace",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Workspace ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Website Redesign" },
                  description: {
                    type: "string",
                    example: "Full redesign of company website",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Project created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      get: {
        tags: ["Projects"],
        summary: "Get all projects in a workspace",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Workspace ID",
          },
        ],
        responses: {
          200: { description: "List of projects" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/v1/projects/{id}": {
      get: {
        tags: ["Projects"],
        summary: "Get a project by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          200: { description: "Project details" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      patch: {
        tags: ["Projects"],
        summary: "Update a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Updated Project Name" },
                  description: {
                    type: "string",
                    example: "Updated description",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Project updated" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Projects"],
        summary: "Delete a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        responses: {
          200: { description: "Project deleted" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },

    // task routes

    "/api/v1/projects/{id}/tasks": {
      post: {
        tags: ["Tasks"],
        summary: "Create a task in a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title"],
                properties: {
                  title: { type: "string", example: "Design landing page" },
                  description: {
                    type: "string",
                    example: "Create wireframes and mockups",
                  },
                  priority: {
                    type: "string",
                    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
                    example: "HIGH",
                  },
                  dueDate: {
                    type: "string",
                    format: "date-time",
                    example: "2026-06-01T00:00:00.000Z",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Task created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      get: {
        tags: ["Tasks"],
        summary: "Get all tasks in a project",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Project ID",
          },
          {
            name: "status",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
            },
          },
          {
            name: "priority",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
            },
          },
          {
            name: "assigneeId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
          {
            name: "sortBy",
            in: "query",
            required: false,
            schema: {
              type: "string",
              enum: ["createdAt", "dueDate", "priority"],
            },
          },
          {
            name: "order",
            in: "query",
            required: false,
            schema: { type: "string", enum: ["asc", "desc"] },
          },
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", example: 1 },
          },
          {
            name: "limit",
            in: "query",
            required: false,
            schema: { type: "integer", example: 10 },
          },
        ],
        responses: {
          200: { description: "List of tasks with pagination" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/v1/tasks/{id}": {
      get: {
        tags: ["Tasks"],
        summary: "Get a task by ID",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        responses: {
          200: { description: "Task details" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      patch: {
        tags: ["Tasks"],
        summary:
          "Update a task (title, description, status, priority, dueDate)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string", example: "Updated task title" },
                  description: {
                    type: "string",
                    example: "Updated description",
                  },
                  status: {
                    type: "string",
                    enum: ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"],
                    example: "IN_PROGRESS",
                  },
                  priority: {
                    type: "string",
                    enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
                    example: "URGENT",
                  },
                  dueDate: {
                    type: "string",
                    format: "date-time",
                    example: "2026-06-15T00:00:00.000Z",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Task updated" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Tasks"],
        summary: "Delete a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        responses: {
          200: { description: "Task deleted" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },

    "/api/v1/tasks/{id}/assign": {
      patch: {
        tags: ["Tasks"],
        summary: "Assign a task to a workspace member",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["assigneeId"],
                properties: {
                  assigneeId: {
                    type: "string",
                    example: "cmp9hg52h00005s3u4uqlonzx",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Task assigned" },
          403: { description: "Forbidden" },
          404: { description: "User not found in workspace" },
        },
      },
    },

    // comment routes
    "/api/v1/tasks/{id}/comments": {
      post: {
        tags: ["Comments"],
        summary: "Add a comment to a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: {
                    type: "string",
                    example: "This task needs more details before we start.",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Comment created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
      get: {
        tags: ["Comments"],
        summary: "Get all comments on a task",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Task ID",
          },
        ],
        responses: {
          200: { description: "List of comments" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },

    "/api/v1/comments/{id}": {
      delete: {
        tags: ["Comments"],
        summary: "Delete a comment (author only)",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "Comment ID",
          },
        ],
        responses: {
          200: { description: "Comment deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - author only" },
          404: { description: "Comment not found" },
        },
      },
    },
  }, // we'll fill this module by module
};
