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
      ":pid": {
        detail: {
          GET: (request: string) => 2,
          POST: () => undefined,
        },
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
});
