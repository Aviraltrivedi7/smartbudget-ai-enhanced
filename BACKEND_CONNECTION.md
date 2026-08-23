# ARTHORA AI backend connection

ARTHORA now uses the Express service as the primary transaction API whenever a user is authenticated. The frontend keeps a local cache for guest/offline mode and falls back to it when the API is unavailable.

## Local setup

Start the backend first:

```bash
cd backend/backend
cp .env.example .env
npm install
npm start
```

The backend listens on `http://localhost:5000` and exposes `GET /health`, authentication under `/api/auth`, transactions under `/api/transactions`, analytics/statistics, and the secure AI proxy under `/api/ai`.

Configure the frontend environment in the project root:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Then start the frontend:

```bash
npm install
npm run dev -- --host 0.0.0.0
```

## Persistent database mode

For persistent multi-user data, set these backend values in `backend/backend/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>?retryWrites=true&w=majority
DB_NAME=arthora-ai
JWT_SECRET=<long-random-secret>
JWT_REFRESH_SECRET=<different-long-random-secret>
FRONTEND_URL=http://localhost:5173
PRODUCTION_URL=https://<your-frontend-domain>
```

Do not commit `.env` files or API keys. If `MONGODB_URI` is absent, the backend deliberately runs in demo mode. Demo authentication and transaction data are process-local and reset when the backend restarts; MongoDB mode is required for durable production data.

## Connected frontend behavior

Authenticated login and registration store the backend JWT in `authToken`. Transaction list, create, update, delete, CSV bulk import, and statistics requests use the backend API. Optimistic UI updates remain in place, with local storage as a recovery queue when the backend is unreachable. The backend accepts category names from the UI and resolves them to category documents in MongoDB mode.

The API also allows the temporary preview origin through a restricted CORS rule. For any permanent deployment, replace the preview origin with the deployed frontend URL through `FRONTEND_URL` or `PRODUCTION_URL`.

## Verification

With the backend running, execute:

```bash
cd backend/backend
npm run smoke
```

The smoke test verifies health, CORS, registration, transaction listing, transaction creation, and statistics without printing JWT credentials. Frontend verification uses `npx tsc --noEmit`, targeted ESLint, and `npm run build`.
