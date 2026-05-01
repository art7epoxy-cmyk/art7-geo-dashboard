import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, geolocationPages, InsertGeolocationPage } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllGeolocationPages() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pages: database not available");
    return [];
  }

  try {
    return await db.select().from(geolocationPages);
  } catch (error) {
    console.error("[Database] Failed to get geolocation pages:", error);
    throw error;
  }
}

export async function getGeolocationPagesByState(state: "MA" | "CT") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get pages: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(geolocationPages)
      .where(eq(geolocationPages.state, state));
  } catch (error) {
    console.error("[Database] Failed to get pages by state:", error);
    throw error;
  }
}

export async function updateGeolocationPageStatus(
  pageId: number,
  status: "active" | "pending"
): Promise<any> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update page: database not available");
    return null;
  }

  try {
    const result = await db
      .update(geolocationPages)
      .set({ status, updatedAt: new Date() })
      .where(eq(geolocationPages.id, pageId));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update page status:", error);
    throw error;
  }
}

export async function seedGeolocationPages(pages: InsertGeolocationPage[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot seed pages: database not available");
    return;
  }

  try {
    await db.insert(geolocationPages).values(pages);
  } catch (error) {
    console.error("[Database] Failed to seed pages:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
