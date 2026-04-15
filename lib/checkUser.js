import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import crypto from "crypto";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = db
      .prepare('SELECT * FROM users WHERE clerkUserId = ?')
      .get(user.id);

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;
    const newId = crypto.randomUUID();

    db.prepare(`
      INSERT INTO users (id, clerkUserId, name, imageUrl, email)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      newId,
      user.id,
      name,
      user.imageUrl,
      user.emailAddresses[0].emailAddress
    );

    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);

    return newUser;
  } catch (error) {
    console.log(error.message);
  }
};
