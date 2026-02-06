require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/db");

// fail fast if JWT secret is not configured
if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not set. Please add JWT_SECRET to your .env or environment.');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
