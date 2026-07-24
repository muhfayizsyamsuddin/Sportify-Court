# Sportify Court Application

**Sportify Court** adalah aplikasi web untuk booking lapangan olahraga (futsal, badminton, basket, dll) secara online. Fitur utama meliputi pencarian lapangan, booking jadwal, pembayaran digital, rekomendasi AI, dan dashboard admin. Stack teknologi: Express.js, React + Redux, PostgreSQL, Midtrans, GeminiAI.
---

## Link Demo

[Demo App](https://sportifycourt.faizms.com)
[https://sportify-court.vercel.app](https://sportify-court.vercel.app)

## Fitur Utama

### User

- Login & Register, Sign in Google
- Lihat dan filter daftar lapangan (dengan kategori & lokasi/nama)
- Booking lapangan berdasarkan tanggal & jam
- Pembayaran digital melalui Midtrans
- Rekomendasi lapangan & jadwal dengan AI (Gemini)
- Riwayat booking

### Admin

- Kelola data lapangan (CRUD)

## 🧩 Struktur Database & ERD Detail

### 1. Users

- id (PK)
- name
- email (unique)
- password
- role ("user" | "admin")
- createdAt
- updatedAt

### 2. Courts

- id (PK)
- name
- location
- pricePerHour
- description
- imageUrl
- category
- createdAt
- updatedAt

### 3. Bookings

- id (PK)
- userId (FK → Users)
- courtId (FK → Courts)
- date
- timeStart
- timeEnd
- status ("pending" | "paid" | "cancelled")
- paymentUrl
- createdAt
- updatedAt

### 4. Payments

- id (PK)
- bookingId (FK)
- amount
- method
- status
- paidAt
- createdAt
- updatedAt

### Relasi Antar Tabel

- One-to-Many: **Users → Bookings**
- One-to-Many: **Courts → Bookings**
- One-to-One: **Bookings → Payments**

  🔗 Relasi:
  1 Court → banyak Booking
  1 Court → milik 1 Category
  🔗 Relasi:
  1 Booking → milik 1 User
  1 Booking → milik 1 Court
  🔗 Relasi:
  1 Payment → milik 1 Booking

```bash
Users 1 ─────< N Bookings
Courts 1 ─────< N Bookings
Bookings 1 ───── 1 Payments
```

---

## Dokumentasi Endpoint API (RESTful)

### Auth

- `POST /register` → Register user baru
- `POST /login` → Login dan generate access token

### Users

- `GET /users` → Get semua user (admin only)
- `GET /users/:id` → Detail user by ID
- `DELETE /users/:id` → Hapus user (admin)

### Categories

- `GET /categories` → Ambil semua kategori olahraga
- `POST /categories` → Tambah kategori (admin)
- `PUT /categories/:id` → Edit kategori (admin)
- `DELETE /categories/:id` → Hapus kategori (admin)

### Courts

- `GET /courts` → Ambil semua lapangan (filter by kategori/area)
- `GET /courts/:id` → Detail lapangan
- `POST /courts` → Tambah lapangan (admin)
- `PUT /courts/:id` → Edit lapangan (admin)
- `DELETE /courts/:id` → Hapus lapangan (admin)

### Bookings

- `GET /bookings` → Get semua booking milik user login
- `POST /bookings` → Booking lapangan
- `PUT /bookings/:id/pay` → Update status booking jadi "paid"
- `DELETE /bookings/:id` → Batalkan booking

### Upload (Bukti Pembayaran)

- `POST /upload` → Upload bukti transfer (multer)

### AI Recommendation

- `POST /recommend` → Kirim prompt ke AI, return rekomendasi lapangan

### Webhook

- `POST /payment/webhook` → Callback Midtrans/Stripe untuk update status pembayaran

# Setup Project

1. Init project express, install deps

```bash
npm init -y
npm install express cors dotenv pg sequelize bcryptjs jsonwebtoken
npm install --save-dev sequelize-cli nodemon jest supertest
```

2. Init sequelize, (ubah config nya untuk dev dan test environment) -> `postgres`

```bash
npx sequelize-cli init
touch .gitignore
```

a. membuat .env
Isi .env biasanya: - Password database - API key (contoh: OpenAI, Midtrans) - Secret JWT token - Konfigurasi server 3. bikin migration, model

```bash
npx sequelize-cli model:generate --name User --attributes name:string,email:string,password:string,role:string
npx sequelize-cli model:generate --name Court --attributes name:string,category:string,location:string,pricePerHour:integer,description:text,imageUrl:string
npx sequelize-cli model:generate --name Booking --attributes userId:integer,courtId:integer,date:dateOnly,timeStart:time,timeEnd:time,status:string
npx sequelize-cli model:generate --name Payment --attributes bookingId:integer,amount:integer,method:string,status:string,paymentUrl:string,paidAt:date
```

4. setup validation, constraint (optional)
   - tambahkan unique dan allowNull false
   - model validation
5. setup association
   - one to many
6. bikin seeders -> edit file seed

```bash
npx sequelize-cli seed:generate --name demo-users
npx sequelize-cli seed:generate --name demo-courts
```

colom tambahan:

```bash
npx sequelize migration:generate --name add-isPaid-to-bookings
```

7. migrate and seed

```bash
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all
```

8. hello world express
9. Setup test -> samakan dengan development (`tambah "_test" di db`)

- package.json (script) :
  "test"-> "jest"
  "dev" -> "nodemon bin/www" (export app dari app.js)

10. testing

```bash
npx sequelize --env test db:create
npx sequelize --env test db:migrate
```

### SETUP

```bash
npm create vite@latest
cd sportify-court
npm i axios react-router
npm run dev
```

```bash
npm install google-auth-library --save
npm install midtrans-client
```

### Deploy

```bash
npm run build (sesuaikan -> sejajar di package.json)
```

```bash
npm i -g firebase-tools
firebase login
n
n
login akun google
firebase init hosting
y
Use an existing project
pilih project
dist
y
n
n
firebase deploy
```

### RE- DEPLOY

```bash
npm run build
firebase deploy
```

# Setup Project SERVER

1. Init project express, install deps

```bash
npm init -y
npm i express sequelize pg bcryptjs jsonwebtoken
npm i -D jest supertest sequelize-cli nodemon
```

2. Init sequelize, (ubah config nya untuk dev dan test environment) -> `postgres`

```bash
npx sequelize init
touch .gitignore
```

3. bikin migration, model

```bash
npx sequelize model:create --name User --attributes email:string,password:string
npx sequelize model:create --name Grocery --attributes title:string,price:integer,tag:string,imageUrl:string,UserId:integer
```

4. setup validation, constraint (optional)
   - tambahkan unique dan allowNull false
   - model validation
5. setup association
   - one to many
6. bikin seeders -> edit file seed

```bash
npx sequelize seed:create --name data
```

7. migrate and seed

```bash
npx sequelize db:create
npx sequelize db:migrate
npx sequelize db:seed:all
```

8. hello world express
9. Setup test -> samakan dengan development (`tambah "_test" di db`)

- package.json (script) :
  "test"-> "jest"
  "dev" -> "nodemon bin/www" (export app dari app.js)

10. testing

```bash
npx sequelize --env test db:create
npx sequelize --env test db:migrate
```

# SETUP CLIENT

```bash
npm create vite@latest
cd sportify-court
npm i axios react-router
npm run dev
```
