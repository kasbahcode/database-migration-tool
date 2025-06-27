# Database Migration Tool

🔄 **FREE** Cross-platform database migration and seeding tool with rollback support

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

## 🌟 Overview

A powerful, free, and open-source database migration tool that supports multiple database systems with rollback capabilities, seeding functionality, and version control for your database schema changes.

## 🛠️ Technologies

- **Node.js** - Runtime environment
- **TypeScript** - Type-safe development  
- **SQL** - MySQL, PostgreSQL, SQLite support
- **MongoDB** - NoSQL database support
- **CLI** - Command-line interface
- **Prisma** - Database toolkit integration

## ✨ Key Features

- 🗄️ **Multi-DB Support** - MySQL, PostgreSQL, SQLite, MongoDB
- ⏪ **Rollback Support** - Safely rollback migrations with confirmation
- 🌱 **Seed Data** - Populate databases with initial/test data
- 📝 **Version Control** - Track migration history and status
- 🖥️ **CLI Interface** - Easy-to-use command line interface
- 🔧 **Prisma Integration** - Works seamlessly with Prisma ORM
- 🆓 **Completely FREE** - No hidden costs or premium features

## 🚀 Installation

### Global Installation
```bash
npm install -g database-migration-tool
```

### Local Installation
```bash
npm install database-migration-tool
```

### Development Setup
```bash
git clone https://github.com/kasbahcode/database-migration-tool.git
cd database-migration-tool
npm install
npm run build
```

## 📖 Quick Start

### 1. Initialize Environment
```bash
# Copy example environment file
cp env.example .env

# Edit .env with your database settings
# Then initialize
dbmigrate init
```

### 2. Create Your First Migration
```bash
dbmigrate create create_users_table
```

### 3. Run Migrations
```bash
dbmigrate up
```

### 4. Create and Run Seeds
```bash
dbmigrate seed:create initial_users
dbmigrate seed:run
```

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `dbmigrate init` | Initialize migration environment |
| `dbmigrate create <name>` | Create a new migration |
| `dbmigrate up` | Run pending migrations |
| `dbmigrate down [--steps <n>]` | Rollback migrations |
| `dbmigrate status` | Show migration status |
| `dbmigrate seed:create <name>` | Create a new seed |
| `dbmigrate seed:run [--name <name>]` | Run seeds |
| `dbmigrate seed:status` | Show seed status |
| `dbmigrate config` | Show database configuration |
| `npm run df3` | Generate Prisma files and migrate |

## ⚙️ Configuration

Create a `.env` file in your project root:

### MySQL/PostgreSQL
```env
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=mydb
DATABASE_URL="mysql://root:password@localhost:3306/mydb"
```

### SQLite
```env
DB_TYPE=sqlite
DB_FILENAME=./database.sqlite
DATABASE_URL="file:./database.sqlite"
```

### MongoDB
```env
DB_TYPE=mongodb
DB_URL=mongodb://localhost:27017
DB_NAME=mydb
DATABASE_URL="mongodb://localhost:27017/mydb"
```

## 🗃️ Supported Databases

- ✅ **MySQL** - Full support with connection pooling
- ✅ **PostgreSQL** - Complete PostgreSQL integration
- ✅ **SQLite** - File-based database support
- ✅ **MongoDB** - NoSQL document database support

## 📁 Project Structure

```
├── src/
│   ├── adapters/     # Database-specific implementations
│   ├── services/     # Business logic
│   ├── config/       # Configuration management
│   ├── types/        # TypeScript interfaces
│   └── cli.ts        # CLI interface
├── migrations/       # Your migration files
├── seeds/           # Your seed files
└── prisma/          # Prisma schema and migrations
```

## 🔄 Migration Example

```javascript
// migrations/2024-01-01_create_users.js
exports.up = async (db) => {
  await db.run(`
    CREATE TABLE users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

exports.down = async (db) => {
  await db.run('DROP TABLE users');
};
```

## 🌱 Seed Example

```javascript
// seeds/2024-01-01_initial_users.js
exports.seed = async (db) => {
  await db.run(`
    INSERT INTO users (email, name) VALUES 
    ('admin@example.com', 'Admin User'),
    ('user@example.com', 'Regular User')
  `);
};
```

## 🤝 Contributing

This is a **FREE** and **open-source** project! Contributions are welcome:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Why Choose This Tool?

- 🆓 **100% Free** - No licensing fees, ever
- 🔓 **Open Source** - Full transparency and community driven
- 🚀 **Production Ready** - Battle-tested and reliable
- 📚 **Well Documented** - Comprehensive guides and examples
- 🛡️ **Type Safe** - Built with TypeScript for reliability
- 🔧 **Extensible** - Easy to customize and extend

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the developer community
- Inspired by database migration tools across different ecosystems
- Contributions and feedback from the open-source community

---

**Made with 💚 by developers, for developers. Forever FREE!** # database-migration-tool
