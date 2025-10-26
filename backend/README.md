# Pulse Backend

Setup:

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies: `npm install` in the `backend` folder.
3. Run Prisma migrate or `npx prisma db push` to sync schema.
4. Run seed: `npm run seed`.
5. Start: `npm run dev`.

API:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me
- GET /api/posts
- POST /api/posts (multipart form-data: image, content)
