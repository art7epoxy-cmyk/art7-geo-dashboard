import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getAllGeolocationPages, getGeolocationPagesByState, updateGeolocationPageStatus, updateGeolocationPageUrl, getAllListingPortals, updateListingPortalStatus } from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  geolocation: router({
    list: publicProcedure.query(() => getAllGeolocationPages()),
    listByState: publicProcedure
      .input((input: any) => input.state as "MA" | "CT")
      .query(({ input }) => getGeolocationPagesByState(input)),
    updateStatus: publicProcedure
      .input((input: any) => ({ id: input.id, status: input.status as "active" | "pending" }))
      .mutation(({ input }) => updateGeolocationPageStatus(input.id, input.status)),
    updateUrl: publicProcedure
      .input((input: any) => ({ id: input.id, url: input.url as string | null }))
      .mutation(({ input }) => updateGeolocationPageUrl(input.id, input.url)),
  }),

  listing: router({
    list: publicProcedure.query(() => getAllListingPortals()),
    updateStatus: publicProcedure
      .input((input: any) => ({ id: input.id, status: input.status as "not_started" | "in_progress" | "completed" }))
      .mutation(({ input }) => updateListingPortalStatus(input.id, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
