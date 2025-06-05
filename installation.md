# Installation Instructions **Learning-App**

## 1. Prerequisites

* **Node.js** ≥ 18 (including **npm**)
* **Git**
* **PostgreSQL** ≥ 15
* **pgAdmin 4**
* Access to an account with `sudo` privileges (Linux/macOS) or PowerShell with administrator rights (Windows)

## 2. Project Setup

```bash
# Create a directory for the project and navigate into it
mkdir ~/projects && cd ~/projects

# Clone the repository
git clone https://github.com/Shafosphere/learning-app.git
cd learning-app
```

### 2.1 Frontend Dependencies Installation

```bash
cd frontend
npm install
```

### 2.2 Backend Dependencies Installation

```bash
cd ../backend
npm install
```

## 3. PostgreSQL Configuration in pgAdmin 4

1. Launch **pgAdmin 4** and expand the **Servers** tree in the left panel.

2. Right-click **Create ▸ Server…**.

3. Fill in the fields:

   | Tab        | Field                    | Value                                 |
   | ---------- | ------------------------ | ------------------------------------- |
   | General    | **Name**                 | `Local PostgreSQL` (any name)         |
   | Connection | **Host name / address**  | `localhost`                           |
   |            | **Port**                 | `5432` (or your custom port)          |
   |            | **Maintenance database** | `postgres`                            |
   |            | **Username**             | `postgres`                            |
   |            | **Password**             | Your PostgreSQL installation password |

4. Check **Save password** and click **Save**.

### 3.1 Creating a Database

1. In the server tree, right-click **Databases ▸ Create ▸ Database…**
2. **General ▸ Database** → `word-repository` (any name)
3. Leave **Owner** set to `postgres`
4. **Definition ▸ Template** → if any issues, set to `template0`
5. Click **Save**

### 3.2 Importing the Schema

In the terminal:

```bash
cd backend/src/db
sudo -u postgres psql -d word-repository -f schema.sql
```

* `postgres` – database user
* `word-repository` – your database name
* `schema.sql` – schema file in `backend/src/db`

## 4. The `.env.local` File

In the `backend` directory, create a file named `.env.local` with the following content:

```env
# Database connection
DB_USER=your_postgres_user
DB_HOST=your_localhost_host
DB_NAME=your_database_name
DB_PASSWORD=your_password
DB_PORT=5432  # your port
TOKEN_KEY=secret_key
ADMIN_PIN=1234  # random PIN required for app operations
EMAIL_PASSWORD=
EMAIL_USER=  # values to set if you want the email system to work properly (not required at startup)
```

In the `frontend` directory, create a file named `.env.local` with the following content:

```env
VITE_API_URL=http://192.168.0.113:8080
```

## 5. Data Import

Run this file in the terminal:

```bash
cd backend
node src/seed/seedData.js
```

## 6. Adding an Administrator Account

In pgAdmin, open the **Query Tool** for your database and run:

```sql
INSERT INTO public.users
  (id, username, email, password, role, created_at, last_login, avatar)
VALUES
  (29,
   'qwertyuiop',
   'qwertyuiop@gmail.com',
   '$2b$10$noZUuSNoZyZeXz773Di5eO41DUSsfxZSmjBB.SPHFB63u9LTe3Ub.',
   'admin',
   '2025-01-29 14:00:30.62574',
   '2025-05-28 13:50:15.753278',
   2);
```

## 7. Running the Application

Open two terminals.

### 7.1 Backend

```bash
cd backend
npm start
```

### 7.2 Frontend

```bash
cd frontend
npm start
```

## 8. Logging In

1. Navigate to `http://192.168.0.113:5173/`.

2. Log in:

   | Field        | Value        |
   | ------------ | ------------ |
   | **username** | `qwertyuiop` |
   | **password** | `qwertyuiop` |

3. Open the **Admin Panel**, click **Reshuffle**, confirm, and enter the `ADMIN_PIN` from `.env.local`.

---

**It should work!** 🎉
