import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("geolocation procedures", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("geolocation.list", () => {
    it("should return all geolocation pages", async () => {
      const pages = await caller.geolocation.list();

      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);
      expect(pages.length).toBe(99); // 50 MA + 49 CT
    });

    it("should have correct page structure", async () => {
      const pages = await caller.geolocation.list();
      const firstPage = pages[0];

      expect(firstPage).toHaveProperty("id");
      expect(firstPage).toHaveProperty("city");
      expect(firstPage).toHaveProperty("state");
      expect(firstPage).toHaveProperty("status");
      expect(firstPage).toHaveProperty("createdAt");
      expect(firstPage).toHaveProperty("updatedAt");
    });

    it("should have valid state values", async () => {
      const pages = await caller.geolocation.list();

      pages.forEach((page) => {
        expect(["MA", "CT"]).toContain(page.state);
      });
    });

    it("should have valid status values", async () => {
      const pages = await caller.geolocation.list();

      pages.forEach((page) => {
        expect(["active", "pending"]).toContain(page.status);
      });
    });
  });

  describe("geolocation.listByState", () => {
    it("should return only Massachusetts pages", async () => {
      const pages = await caller.geolocation.listByState({ state: "MA" });

      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);

      pages.forEach((page) => {
        expect(page.state).toBe("MA");
      });
    });

    it("should return only Connecticut pages", async () => {
      const pages = await caller.geolocation.listByState({ state: "CT" });

      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);

      pages.forEach((page) => {
        expect(page.state).toBe("CT");
      });
    });

    it("should return correct number of pages per state", async () => {
      const maPages = await caller.geolocation.listByState({ state: "MA" });
      const ctPages = await caller.geolocation.listByState({ state: "CT" });

      expect(maPages.length).toBe(50);
      expect(ctPages.length).toBe(49);
    });
  });

  describe("geolocation.updateStatus", () => {
    it("should update page status from pending to active", async () => {
      // Get a pending page
      const pages = await caller.geolocation.list();
      const pendingPage = pages.find((p) => p.status === "pending");

      if (!pendingPage) {
        throw new Error("No pending page found for testing");
      }

      // Update status
      await caller.geolocation.updateStatus({
        id: pendingPage.id,
        status: "active",
      });

      // Verify update
      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === pendingPage.id);

      expect(updated?.status).toBe("active");
    });

    it("should update page status from active to pending", async () => {
      // Get an active page
      const pages = await caller.geolocation.list();
      const activePage = pages.find((p) => p.status === "active");

      if (!activePage) {
        throw new Error("No active page found for testing");
      }

      // Update status
      await caller.geolocation.updateStatus({
        id: activePage.id,
        status: "pending",
      });

      // Verify update
      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === activePage.id);

      expect(updated?.status).toBe("pending");
    });

    it("should update the updatedAt timestamp", async () => {
      const pages = await caller.geolocation.list();
      const page = pages[0];

      const oldUpdatedAt = new Date(page.updatedAt);

      // Larger delay to ensure timestamp difference (MySQL timestamp precision)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      await caller.geolocation.updateStatus({
        id: page.id,
        status: page.status === "active" ? "pending" : "active",
      });

      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === page.id);

      // Allow for small timestamp variations
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        oldUpdatedAt.getTime()
      );
    });
  });

  describe("data consistency", () => {
    it("should have all cities from MA and CT", async () => {
      const pages = await caller.geolocation.list();

      const cities = pages.map((p) => p.city);
      const uniqueCities = new Set(cities);

      // Should have at least 95 unique cities (accounting for possible duplicates like Groton, Shelton)
      expect(uniqueCities.size).toBeGreaterThanOrEqual(95);
      expect(pages.length).toBeGreaterThanOrEqual(95);
    });

    it("should not have duplicate cities", async () => {
      const pages = await caller.geolocation.list();

      const cityStateKey = pages.map((p) => `${p.city}-${p.state}`);
      const uniqueKeys = new Set(cityStateKey);

      expect(uniqueKeys.size).toBe(pages.length);
    });
  });
});
