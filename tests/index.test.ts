import { it, describe, vi, expect } from "vitest";
import { get } from "../src/utils";
import { createService } from "../src/index";

describe("di tests", () => {
  vi.useFakeTimers();

  const routes = {
    topic: {
      GET: () => undefined,
      ":id": {
        GET: (request: string) => 1,
        POST: () => undefined,
      },
    },
    file: {
      GET: (req?: {}) => undefined,
    },
  };

  it("should work", () => {
    const result = get(routes, ["topic", "123"]);
    expect(result).toBe(routes["topic"][":id"]);
  });

  it("should work 2", async () => {
    const service = createService(routes);
    const result = await service.get("/topic/123", undefined);
    expect(result).toEqual(1);
  });

  it("should work with middleware", async () => {
    const service = createService(routes, [
      async function (request, { method, url }, next) {
        expect(request).toEqual("1");
        expect(method).toEqual("GET");
        expect(url).toEqual("/topic/123");
        const response = await next(request + "2");
        expect(response).toEqual(2); // because of the inner middleware below
        return 3;
      },
      async function (request, { method, url }, next) {
        expect(request).toEqual("12"); // because of the outer middleware upper
        expect(method).toEqual("GET");
        expect(url).toEqual("/topic/123");
        const response = await next(request);
        expect(response).toEqual(1);
        return 2;
      },
    ]);
    const result = await service.get("/topic/123", "1");
    expect(result).toEqual(3);
  });
});
