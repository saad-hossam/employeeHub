# express-mongodb-crud

A production-shaped RESTful CRUD API for a Product catalog, built with **Node.js**, **Express.js**, and **MongoDB (Mongoose)** — developed incrementally through seven learning phases.

---

## Overview

This is a backend-only API. It exposes a `/api/products` resource with full CRUD, plus health-check endpoints for process and database status. Validation and error handling are centralized so every endpoint behaves consistently.

---

## Features

- Full CRUD on products: create, list, get one, full replace (PUT), partial update (PATCH), delete.
- Request-shape validation middleware that rejects malformed or unexpected input before it reaches controllers.
- Schema-level validation in Mongoose (`required`, `min`, integer check, string length limits).
- Centralized error handling with a consistent `{ success, message, errors? }` response envelope.
- 404 handler for unknown routes (JSON, not HTML).
- Database health endpoint distinguishing connected vs. disconnected.
- Startup that refuses to listen until MongoDB connects.
- Graceful shutdown on `SIGINT` / `SIGTERM`.

**Not included:** authentication, authorization, frontend, pagination, rate limiting, logging middleware. These are listed under *Future improvements*.

---

## Technology Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js (LTS ≥ 20) |
| Framework | Express 4 |
| Database | MongoDB (Atlas or local) |
| ODM | Mongoose 8 |
| Env loading | dotenv |
| Dev tool | nodemon |
| Testing | Postman (manual) |

---

## Prerequisites

- Node.js LTS ≥ 20 and npm.
- A MongoDB Atlas free-tier cluster **or** a local MongoDB server.
- Postman (for testing).

Verify:

```bash
node -v
npm -v
```

---

## Installation

```bash
git clone <your-repo-url> express-mongodb-crud
cd express-mongodb-crud
npm install
```

---

## Environment Configuration

Copy the example file:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
PORT=3000
MONGODB_URI=mongodb+srv://<db_username>:<db_password>@<cluster-host>/<database-name>?retryWrites=true&w=majority
```

- Replace all placeholders with your real values.
- For local MongoDB: `MONGODB_URI=mongodb://127.0.0.1:27017/express_mongodb_crud`
- **Never commit `.env`.** It is excluded by `.gitignore`.

---

## MongoDB Atlas Setup

1. Sign up at https://cloud.mongodb.com.
2. Create a **free M0** cluster.
3. **Database Access** → add a *database user* (not your Atlas account).
4. **Network Access** → allow your IP (or `0.0.0.0/0` for development only).
5. **Connect → Drivers → Node.js** → copy the URI.
6. Paste into `.env` as `MONGODB_URI`.

If your password contains `@ : / # %`, URL-encode it (`@` → `%40`) or avoid those characters.

---

## Local MongoDB Alternative

1. Start MongoDB: `brew services start mongodb-community`, `sudo systemctl start mongod`, or the Windows service.
2. Set `MONGODB_URI=mongodb://127.0.0.1:27017/express_mongodb_crud`.

---

## Project Structure

```
express-mongodb-crud/
├── src/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   └── Product.js
│   ├── controllers/
│   │   └── productController.js
│   ├── routes/
│   │   └── productRoutes.js
│   └── middleware/
│       ├── validateProduct.js
│       ├── notFound.js
│       └── errorHandler.js
├── .env
├── .env.example
├── .gitignore
├── Express MongoDB CRUD API.postman_collection.json
├── README.md
└── package.json
```

---

## How the Application Starts

1. `npm run dev` (or `npm start`) → `node src/server.js`.
2. `server.js` imports `dotenv/config` **first** — loads `.env` into `process.env`.
3. Imports the Express app (`src/app.js`) and `connectDB` (`src/config/db.js`).
4. `await connectDB()` — if this fails, process exits with code 1.
5. `app.listen(PORT)` — starts accepting HTTP only after the DB is confirmed.
6. `SIGINT` / `SIGTERM` handlers close the HTTP server gracefully.

---

## Product Schema and Validation Rules

`src/models/Product.js`

| Field | Type | Rules |
|-------|------|-------|
| `name` | String | required, trimmed, 1–200 chars |
| `description` | String | optional, trimmed, ≤ 2000 chars |
| `price` | Number | required, finite, ≥ 0 |
| `quantity` | Number | required, integer, ≥ 0 |
| `category` | String | optional, trimmed, ≤ 100 chars |

Timestamps (`createdAt`, `updatedAt`) are added automatically. MongoDB adds `_id` and `__v`.

**Validation happens twice:**
1. **Request middleware** (`src/middleware/validateProduct.js`) — checks shape, types, ranges, unknown fields. Returns `400` before touching MongoDB.
2. **Mongoose schema** — enforces the same rules plus trim, length, and integer constraints.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Welcome + API status |
| GET | `/api/health` | Process health |
| GET | `/api/health/db` | MongoDB connection state (`200` connected / `503` otherwise) |
| POST | `/api/products` | Create a product |
| GET | `/api/products` | List all products |
| GET | `/api/products/:id` | Get one product |
| PUT | `/api/products/:id` | Full replace |
| PATCH | `/api/products/:id` | Partial update |
| DELETE | `/api/products/:id` | Delete |

---

## Request and Response Examples

### POST /api/products → 201

```json
// Request
{
  "name": "Laptop",
  "description": "For programming",
  "price": 25000,
  "quantity": 5,
  "category": "Electronics"
}

// Response
{
  "status": "success",
  "data": {
    "_id": "66f2c3d4e5f6a7b8c9d0e1f2",
    "name": "Laptop",
    "description": "For programming",
    "price": 25000,
    "quantity": 5,
    "category": "Electronics",
    "createdAt": "2026-10-26T15:00:00.000Z",
    "updatedAt": "2026-10-26T15:00:00.000Z",
    "__v": 0
  }
}
```

### GET /api/products → 200

```json
{ "status": "success", "count": 1, "data": [ { "_id": "...", "name": "Laptop", ... } ] }
```

Empty collection:

```json
{ "status": "success", "count": 0, "data": [] }
```

### PUT /api/products/:id → 200
Full body required (see schema). Response is the updated document.

### PATCH /api/products/:id → 200
Send only the fields to change. Other fields remain untouched.

### DELETE /api/products/:id → 200

```json
{
  "status": "success",
  "message": "Product deleted successfully",
  "data": { "_id": "...", "name": "Laptop", ... }
}
```

### Validation error → 400

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "price", "message": "price must be a non-negative number" }
  ]
}
```

### Malformed ID → 400

```json
{ "success": false, "message": "Invalid product ID format" }
```

### Not found → 404

```json
{ "success": false, "message": "Product not found" }
```

### Unknown route → 404

```json
{ "success": false, "message": "Route not found: GET /api/nonsense" }
```

### Malformed JSON → 400

```json
{ "success": false, "message": "Malformed JSON in request body" }
```

### Server error → 500

```json
{ "success": false, "message": "Internal server error" }
```

The underlying error is logged server-side only.

---

## HTTP Status Codes

| Code | Used for |
|------|----------|
| 200 | Successful read, update, delete |
| 201 | Successful create |
| 400 | Validation failure, invalid ObjectId, malformed JSON |
| 404 | Missing product, unknown route |
| 500 | Unexpected server/database error |
| 503 | `/api/health/db` when MongoDB is disconnected |

---

## Centralized Error Handling

All error shaping happens in `src/middleware/errorHandler.js`. It:

- Uses exactly four parameters `(err, req, res, next)` — required for Express to treat it as an error handler.
- Normalizes Mongoose `ValidationError`, `CastError`, duplicate-key (`code: 11000`), and `express.json()` parse failures.
- Returns `{ success: false, message, errors? }` for every case.
- Logs full detail server-side; the client **never** receives stack traces, hostnames, or credentials.

Controllers use `next(err)` to hand errors off. Unknown routes are handled by `src/middleware/notFound.js` — registered **before** `errorHandler` in `app.js`.

---

## Postman Collection Setup

1. In the project root, find `Express MongoDB CRUD API.postman_collection.json`.
2. Postman → **File → Import → File** → select the JSON.
3. In the collection **Variables**, confirm `baseUrl = http://localhost:3000`.
4. Run requests in order: **B1 Create** (captures `productId`) → **C** (reads) → **D** (PUT) → **E** (PATCH) → **F** (DELETE).
5. Or **Run** the whole collection via **Collection Runner** — but note that F1 deletes what B1 created; re-running creates a new product each time.

---

## Manual Testing (no Postman)

You can use `curl`:

```bash
# Create
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Laptop","price":25000,"quantity":5}'

# List
curl http://localhost:3000/api/products

# Get by ID
curl http://localhost:3000/api/products/<id>

# Update
curl -X PUT http://localhost:3000/api/products/<id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Updated","price":30000,"quantity":8}'

# Partial update
curl -X PATCH http://localhost:3000/api/products/<id> \
  -H "Content-Type: application/json" \
  -d '{"price":28000}'

# Delete
curl -X DELETE http://localhost:3000/api/products/<id>
```

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `crypto is not defined` on startup | Mongoose 9 on Node 18 | Upgrade to Node 20, or `npm install mongoose@8` |
| `MONGODB_URI is not defined` | `.env` missing or dotenv loaded late | Ensure `import 'dotenv/config'` is the first line of `server.js` |
| `bad auth` from MongoDB | Wrong DB user/password | Check Atlas Database Access; update `.env` |
| `EADDRINUSE :3000` | Port taken | Kill the process or change `PORT` |
| Every request returns `404 Route not found` | `notFound` registered before routes | `notFound` must be **last** among route handlers |
| `500` on everything, terminal shows `MongoNetworkError` | MongoDB unreachable | Start local `mongod` or check Atlas cluster status |
| `Cannot POST /api/products` | Router not mounted | Check `app.use('/api/products', productRoutes)` in `app.js` |
| 400 on a valid-looking body | Field name typo or wrong type | Response `errors` array names the exact field |

---

## Security Recommendations

- **Never commit `.env`.** Confirm with `git status`.
- **Never share connection strings** in chat, screenshots, or issues.
- **Rotate the DB password immediately** if `.env` ever leaks.
- **`0.0.0.0/0` in Atlas** is for development only; restrict IPs in production.
- **Validation rejects unknown fields** — no client can inject `_id`, `__v`, `createdAt`.
- **ObjectIds are validated before queries** — no `CastError` leaks.
- **Error responses are generic for 5xx** — no stack traces.
- **No auth yet** — anyone with network access can perform CRUD. This is fine for a learning project on localhost, **not for deployment**.

---

## Development Commands

| Command | Does |
|---------|------|
| `npm install` | Install dependencies |
| `npm run dev` | Start with nodemon (auto-reload) |
| `npm start` | Start once (production-style) |

---

## Current Implementation Status

| Feature | Status |
|---------|--------|
| Express server + health endpoints | ✅ Implemented |
| MongoDB connection (fail-fast startup) | ✅ Implemented |
| Product model + schema validation | ✅ Implemented |
| POST, GET (all), GET (one) | ✅ Implemented |
| PUT, PATCH, DELETE | ✅ Implemented |
| Request validation middleware | ✅ Implemented |
| Centralized error handler + 404 handler | ✅ Implemented |
| Postman collection | ✅ Provided |
| Automated tests | ⏳ Not implemented — manual Postman testing only |
| Pagination, filtering, sorting | ⏳ Not implemented |
| Authentication / authorization | ⏳ Not implemented |
| Rate limiting, request logging, `helmet` | ⏳ Not implemented |

*Statuses are based on code inspection. Run the Postman collection to confirm the endpoints on your machine.*

---

## Completed Phases

| Phase | Scope | Status |
|-------|-------|--------|
| 1 | Express server, ES Modules, `.env`, `/` and `/api/health` | Completed |
| 2 | Mongoose connection, DB-before-HTTP startup, `/api/health/db` | Completed |
| 3 | Product schema, Create + Read | Completed |
| 4 | PUT + PATCH | Completed |
| 5 | DELETE | Completed |
| 6 | Validation middleware, centralized error handler, 404 handler | Completed |
| 7 | Postman collection, final README, verification | Completed |

---

## Known Limitations

- No authentication or authorization — any client can modify any product.
- No pagination — `GET /api/products` returns every document.
- No request logging middleware — debugging relies on `console.error` in the error handler.
- No automated tests — verification is via the Postman collection.
- No rate limiting — a client can spam the API.
- No soft delete — deletion is permanent.

---

## Future Improvements

- Add **Jest + Supertest** with `mongodb-memory-server` for automated integration tests.
- Add `express-rate-limit` to throttle abusive clients.
- Add `helmet` for HTTP security headers.
- Add `morgan` (or `pino`) for structured request logs.
- Add pagination, filtering, and sorting to `GET /api/products`.
- Add authentication (JWT) and per-user authorization.
- Add a `deletedAt` soft-delete pattern for auditability.
- Add a Dockerfile and CI workflow for deployment.

---

## License

ISC — placeholder. Add a `LICENSE` file (MIT, Apache-2.0, etc.) before publishing or distributing this project.