import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
  },
  migrate: {
    async adapter() {
      const { PrismaLibSQL } = await import("@prisma/adapter-libsql");
      const { createClient } = await import("@libsql/client");
      const client = createClient({
        url: `file:${path.join(process.cwd(), "prisma", "dev.db")}`,
      });
      return new PrismaLibSQL(client);
    },
  },
});