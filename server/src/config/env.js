/*import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
*/
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";
import dns from "node:dns";

dns.setServers(["8.8.8.8", "1.1.1.1"]);

dotenv.config({
  path: fileURLToPath(new URL("../../../.env", import.meta.url)),
});
