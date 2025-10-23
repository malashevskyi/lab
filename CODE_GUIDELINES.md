# 🧭 Code Guidelines

All tasks, issues, and code contributions must follow these conventions.

---

## General Principles

- Always **write clean, readable, and maintainable code**.
- **Do not add unnecessary comments** (only when clarifying complex logic).
- Every **function, class, and public method** must include **JSDoc documentation**.
- Avoid duplicating logic. Prefer **utility functions** or **shared modules** when possible.
- Always ensure **type safety** with TypeScript.
- Use **ESM syntax** (`import/export`) consistently.
- Each new entity in the server must **implement its shared interface** from the `types` package.

### TypeScript

- Use explicit return types.
- Never use `any` or `unknown`.
- Never use `as`.
- Prefer `const` over `let`.
- Organize imports logically:
  - External libraries
  - Internal imports
  - Type imports

### NestJS

- Use **ESM syntax** (`import/export`) consistently.
- **Swagger must be used for all endpoints.**  
  Every controller method should be fully documented using Swagger decorators.
- For each endpoint, create **a single custom Swagger decorator file** that includes all necessary decorators for that method.
  - Example:
    - ✅ `some-method-in-controller.docs.decorator.ts`
    - ❌ `api-doc.decorator.ts`
- Each custom decorator should import:
  - `ApiOperation`
  - `ApiResponse` (or `ApiOkResponse`, `ApiCreatedResponse`, etc.)
  - `ApiBadRequestResponse`
  - `ApiBody` - if the endpoint has body
  - `ApiParam` - if the endpoint has params
  - etc.
- Swagger documentation should accurately describe:
  - The purpose of the endpoint
  - The structure of the request body
  - The possible success and error responses
  - Example inputs and outputs

#### DTOs and Schemas

- For each controller method that accepts parameters or a body, create a dedicated **DTO file** and **schema**:
  - DTO location: `module/dto/<name>.dto.ts`
  - Schema location: `module/schemas/<name>.schema.ts`
- DTOs must strictly reference Zod schemas from the `types` package or module-local schemas.
- Do not reuse DTOs between unrelated endpoints — each should be specific to its own route.

#### Best Practices

- Always follow the **official NestJS documentation** and established **best practices**.
- Do **not reinvent** the architecture — use standard NestJS patterns for:
  - Controllers
  - Services
  - DTOs
  - Modules
- Keep controller methods small and clean — delegate all logic to services.
- Maintain consistent naming and folder structure across all modules.
