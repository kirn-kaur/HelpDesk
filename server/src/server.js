import "./config/env.js";
import app from "./app.js";
import { connectDatabase } from "./config/db.js";

const port = Number(process.env.PORT) || 5000;

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)
  throw new Error(
    "Set JWT_SECRET to a random value of at least 32 characters.",
  );
try {
  await connectDatabase();
} catch (error) {
  console.error("MongoDB connection failed:");
  console.error(error);
  process.exit(1);
}
/*catch (error) {
  console.error('Unable to connect to MongoDB. Check the Atlas hostname, network access list, and database user.');
  if (error.syscall === 'querySrv') console.error('The MongoDB SRV DNS lookup failed. Verify that the cluster is active and the copied connection string is exact.');
  else console.error(`MongoDB connection error: ${error.code ?? error.name}`);
  process.exit(1);
}*/
app.listen(port, () => console.log(`HelpDesk API listening on port ${port}`));
