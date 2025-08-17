const app = require('./app');
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;
const sequelize = require('./config/db');


sequelize.authenticate()
  .then(() => console.log('✅ Database connected successfully'))
  .catch((err) => console.error('❌ Database connection failed:', err));

sequelize.sync({ alter: true })
  .then(() => console.log('✅ All models are synced with DB'))
  .catch((err) => console.error('❌ Sequelize sync error:', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

