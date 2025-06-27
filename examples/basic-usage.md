# Basic Usage Examples

## Setup

1. Copy the environment file:
```bash
cp env.example .env
```

2. Edit `.env` with your database configuration:
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=test_db
DATABASE_URL="mysql://root:password@localhost:3306/test_db"
```

3. Initialize the migration environment:
```bash
npm run dev init
```

## Creating and Running Migrations

1. Create a new migration:
```bash
npm run dev create create_users_table
```

2. Edit the generated migration file in `./migrations/`:
```javascript
exports.up = async (db) => {
  await db.query(`
    CREATE TABLE users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

exports.down = async (db) => {
  await db.query('DROP TABLE users');
};
```

3. Run migrations:
```bash
npm run dev up
```

4. Check migration status:
```bash
npm run dev status
```

## Creating and Running Seeds

1. Create a seed:
```bash
npm run dev seed:create initial_users
```

2. Edit the generated seed file in `./seeds/`:
```javascript
exports.seed = async (db) => {
  await db.query(`
    INSERT INTO users (email, name) VALUES 
    ('admin@example.com', 'Admin User'),
    ('user@example.com', 'Regular User')
  `);
};
```

3. Run seeds:
```bash
npm run dev seed:run
```

## Rollback

1. Rollback last migration:
```bash
npm run dev down
```

2. Rollback multiple migrations:
```bash
npm run dev down --steps 3
```

## Using with Prisma

1. Generate Prisma files and migrate:
```bash
npm run df3
```

This command runs `prisma generate && prisma migrate dev` as specified in your user rules. 