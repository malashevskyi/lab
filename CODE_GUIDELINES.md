# 🧭 Code Guidelines for AI

All tasks, issues, and code contributions must follow these conventions.

---

## General Principles

- **Ensure 100% reliability.** Solutions must not rely on assumptions or work "most of the time." All edge cases must be handled gracefully.
- Always **write clean, readable, and maintainable code**.
- **DO NOT** modify any code that was not explicitly requested.
- **DO NOT** add any comments, documentation, or explanations to the code unless specifically asked.
- **DO NOT** refactor, rename, or restyle any part of the code that is not directly related to the task.
- **YOUR PRIMARY GOAL IS TO MAKE ONLY THE MINIMAL AND EXACT CHANGES REQUIRED TO COMPLETE THE TASK.**
- **NEVER CHANGE EXISTING VARIABLE NAMES, FUNCTION NAMES, OR CODE STRUCTURE** unless explicitly requested by the user.
- **IF YOU SEE AN ERROR OR INCONSISTENCY IN EXISTING CODE, ASK THE USER FIRST** before making any changes - never fix "broken" code on your own initiative.
- **Do not add unnecessary comments** (only when clarifying complex logic).
- Every **function, class, and public method** must include **JSDoc documentation**.
- Avoid duplicating logic. Prefer **utility functions** or **shared modules** when possible.
- Always ensure **type safety** with TypeScript.
- Use **ESM syntax** (`import/export`) consistently.
- Each new entity in the server must **implement its shared interface** from the `types` package.
- All comments in the code must be in English
- **DO NOT** use `.then()` or `.catch()` for handling promises. Always prefer the `async/await` syntax for cleaner, more readable, and synchronous-style asynchronous code.
- **NEVER suggest or run build commands** - the user has watch mode enabled and will handle builds themselves.

### Project Scripts

- **Use `pnpm` for package management** instead of `npm` or `yarn`.
- **Use `nx` for running project scripts** where available:
  - Build types: `nx build types` or `pnpm build types`
  - Build server: `nx build server` or `pnpm build server`
  - Generate Zod schemas: `cd types && pnpm generate:zod`
  - Development server: `nx serve server` or `pnpm dev server`
- **For workspace operations**, prefer `pnpm` commands:
  - Install dependencies: `pnpm install`
  - Run in specific package: `pnpm --filter <package-name> <command>`
- **For running tests**, use `vitest`:
  - Run all tests: `pnpm vitest run`
  - Run specific test file: `pnpm vitest run <filename>`
  - Watch mode: `pnpm vitest`

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

### Data Fetching (@tanstack/react-query)

- Always Handle Validation Errors Inside queryFn with zod schema.
- A queryFn must always return a promise and never throw an error directly.
- Unhandled errors (including Zod parsing errors) will cause the query to crash and may trigger an ErrorBoundary.

### State Management (Zustand)

- Do not select multiple values by returning a new object. This creates a new object on every render, causing Zustand's default shallow equality check to fail and triggering an infinite loop.

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
