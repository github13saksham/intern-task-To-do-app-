const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'webappdb',
    process.env.DB_USER || 'root',
    process.env.DB_PASS || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: process.env.DB_HOST && process.env.DB_HOST !== 'localhost' ? {
        ssl: {
          rejectUnauthorized: false
        }
      } : {},
    }
  );
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected via Sequelize: ${sequelize.config.host}`);
    
    // Automatically create tables if they don't exist
    await sequelize.sync({ alter: true });
    console.log('✅ MySQL Tables Synced');
  } catch (error) {
    console.error(`❌ MySQL connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
