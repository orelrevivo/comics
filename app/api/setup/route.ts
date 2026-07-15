import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const email = "doron2010sha@gmail.com";
    const password = "Gantai_19062010\\";
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      await db.update(users).set({
        password: hashedPassword,
        isVerified: true
      }).where(eq(users.email, email));
      return NextResponse.json({ success: true, message: "Updated existing user" });
    } else {
      await db.insert(users).values({
        email,
        password: hashedPassword,
        name: "Admin Doron",
        isVerified: true
      });
      return NextResponse.json({ success: true, message: "Created new admin user" });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  }
}
