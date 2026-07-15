import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function run() {
  const email = "doron_admainDB@gmail.com";
  const password = "doron_s3admainDBsS23";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await db.select().from(users).where(eq(users.email, email));
  
  if (existingUser.length > 0) {
    await db.update(users).set({
      password: hashedPassword,
      isVerified: true
    }).where(eq(users.email, email));
    console.log("Updated existing user");
  } else {
    await db.insert(users).values({
      email,
      password: hashedPassword,
      name: "Admin Doron",
      isVerified: true
    });
    console.log("Created new admin user");
  }
}

run().catch(console.error).finally(() => process.exit(0));
