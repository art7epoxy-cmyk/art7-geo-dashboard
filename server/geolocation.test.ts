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
      expect(pages.length).toBe(36); // 26 MA + 10 NH (premium cities)
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
        expect(["MA", "NH"]).toContain(page.state);
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

    it("should return only New Hampshire pages", async () => {
      const pages = await caller.geolocation.listByState({ state: "NH" });

      expect(Array.isArray(pages)).toBe(true);
      expect(pages.length).toBeGreaterThan(0);

      pages.forEach((page) => {
        expect(page.state).toBe("NH");
      });
    });

    it("should return correct number of pages per state", async () => {
      const maPages = await caller.geolocation.listByState({ state: "MA" });
      const nhPages = await caller.geolocation.listByState({ state: "NH" });

      expect(maPages.length).toBe(31);
      expect(nhPages.length).toBe(5);
    });
  });

  describe("geolocation.updateStatus", () => {
    it("should update page status from pending to active", async () => {
      const pages = await caller.geolocation.list();
      const pendingPage = pages.find((p) => p.status === "pending");

      if (!pendingPage) {
        throw new Error("No pending page found for testing");
      }

      await caller.geolocation.updateStatus({
        id: pendingPage.id,
        status: "active",
      });

      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === pendingPage.id);

      expect(updated?.status).toBe("active");

      // Restore
      await caller.geolocation.updateStatus({
        id: pendingPage.id,
        status: "pending",
      });
    });

    it("should update page status from active to pending", async () => {
      const pages = await caller.geolocation.list();
      const activePage = pages.find((p) => p.status === "active");

      if (!activePage) {
        throw new Error("No active page found for testing");
      }

      await caller.geolocation.updateStatus({
        id: activePage.id,
        status: "pending",
      });

      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === activePage.id);

      expect(updated?.status).toBe("pending");

      // Restore
      await caller.geolocation.updateStatus({
        id: activePage.id,
        status: "active",
      });
    });
  });

  describe("geolocation.updateUrl", () => {
    it("should add URL to a page", async () => {
      const pages = await caller.geolocation.list();
      const testPage = pages.find((p) => p.city === "Wellesley");

      if (!testPage) {
        throw new Error("Wellesley page not found for testing");
      }

      const testUrl = "https://art7epoxy.com/garage-floor-coating-in-wellesley-ma/";
      await caller.geolocation.updateUrl({
        id: testPage.id,
        url: testUrl,
      });

      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === testPage.id);

      expect(updated?.url).toBe(testUrl);
    });

    it("should update existing URL", async () => {
      const pages = await caller.geolocation.list();
      const testPage = pages.find((p) => p.city === "Wellesley");

      if (!testPage) {
        throw new Error("Wellesley page not found for testing");
      }

      const newUrl = "https://art7epoxy.com/garage-floor-coating-in-wellesley-ma-2/";
      await caller.geolocation.updateUrl({
        id: testPage.id,
        url: newUrl,
      });

      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === testPage.id);

      expect(updated?.url).toBe(newUrl);
    });

    it("should clear URL by setting to null", async () => {  
      const pages = await caller.geolocation.list();
      const testPage = pages.find((p) => p.city === "Wellesley");

      if (!testPage) {
        throw new Error("Wellesley page not found for testing");
      }

      await caller.geolocation.updateUrl({
        id: testPage.id,
        url: null,
      });

      const updatedPages = await caller.geolocation.list();
      const updated = updatedPages.find((p) => p.id === testPage.id);

      expect(updated?.url).toBeNull();
    });
  });

  describe("data consistency", () => {
    it("should have all cities from MA and NH", async () => {
      const pages = await caller.geolocation.list();

      const cities = pages.map((p) => p.city);
      const uniqueCities = new Set(cities.map((c, i) => `${c}-${pages[i].state}`));

      expect(uniqueCities.size).toBe(36);
      expect(pages.length).toBe(36);
    });

    it("should not have duplicate cities", async () => {
      const pages = await caller.geolocation.list();

      const cityStateKey = pages.map((p) => `${p.city}-${p.state}`);
      const uniqueKeys = new Set(cityStateKey);

      expect(uniqueKeys.size).toBe(pages.length);
    });
  });
});

describe("listing procedures", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    const ctx = createPublicContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("listing.list", () => {
    it("should return all listing portals", async () => {
      const portals = await caller.listing.list();

      expect(Array.isArray(portals)).toBe(true);
      expect(portals.length).toBe(37);
    });

    it("should have correct portal structure", async () => {
      const portals = await caller.listing.list();
      const first = portals[0];

      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("name");
      expect(first).toHaveProperty("category");
      expect(first).toHaveProperty("status");
      expect(first).toHaveProperty("isPaid");
      expect(first).toHaveProperty("smsVerification");
      expect(first).toHaveProperty("priority");
      expect(first).toHaveProperty("portalUrl");
    });

    it("should have valid status values", async () => {
      const portals = await caller.listing.list();

      portals.forEach((portal) => {
        expect(["not_started", "in_progress", "completed"]).toContain(portal.status);
      });
    });

    it("should include Google Business Profile as first priority", async () => {
      const portals = await caller.listing.list();
      const sorted = [...portals].sort((a, b) => a.priority - b.priority);

      expect(sorted[0].name).toBe("Google Business Profile");
      expect(sorted[0].priority).toBe(1);
    });
  });

  describe("listing.updateStatus", () => {
    it("should update portal status", async () => {
      const portals = await caller.listing.list();
      const testPortal = portals[0];

      await caller.listing.updateStatus({
        id: testPortal.id,
        status: "in_progress",
      });

      const updated = await caller.listing.list();
      const updatedPortal = updated.find((p) => p.id === testPortal.id);

      expect(updatedPortal?.status).toBe("in_progress");

      // Restore original status
      await caller.listing.updateStatus({
        id: testPortal.id,
        status: testPortal.status,
      });
    });

    it("should cycle through all status values", async () => {
      const portals = await caller.listing.list();
      const testPortal = portals[portals.length - 1]; // Use last portal to avoid conflicts

      // Set to in_progress
      await caller.listing.updateStatus({ id: testPortal.id, status: "in_progress" });
      let updated = await caller.listing.list();
      expect(updated.find((p) => p.id === testPortal.id)?.status).toBe("in_progress");

      // Set to completed
      await caller.listing.updateStatus({ id: testPortal.id, status: "completed" });
      updated = await caller.listing.list();
      expect(updated.find((p) => p.id === testPortal.id)?.status).toBe("completed");

      // Set back to not_started
      await caller.listing.updateStatus({ id: testPortal.id, status: "not_started" });
      updated = await caller.listing.list();
      expect(updated.find((p) => p.id === testPortal.id)?.status).toBe("not_started");
    });
  });
});
