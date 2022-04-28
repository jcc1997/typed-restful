import { deepmerge } from "deepmerge-ts";
import { DefineRoute, CreateService, Middleware, Method } from "./interface";
import { get, checkRoutes } from "./utils";
export const merge: typeof deepmerge = function (...args) {
  const routes = deepmerge(...args);
  checkRoutes(routes);
  return routes;
};

export const defineRoute: DefineRoute = function (method, route, cb) {
  const paths = route.split("/");
  const val = {
    [method]: cb,
  };
  let result: Record<string, any> = {};
  paths
    .filter((v) => !!v)
    .forEach((v) => {
      result[v] = {};
      result = result[v];
    });
  result = val;
  return result as ReturnType<DefineRoute>;
};

export const createService: CreateService = function (
  routes,
  middlewares = []
) {
  const run = async function (method: Method, url: string, request: any) {
    const paths = url.split("/").filter((v) => !!v);
    const $collections = {};
    const result = get(routes, paths, $collections);
    if (result && result[method]) {
      function dispatch(
        i: number, info: { method: Method; url: string }
      ): (request: any) => Promise<any> {
        if (i === middlewares.length) {
          return (req) => result[method](req, $collections);
        } else {
          const mid = middlewares[i];
          return (req) => mid(req, info, dispatch(i + 1, info));
        }
      }
      return dispatch(0, { method, url })(request);
    }
    throw new Error("no matcher");
  };
  return {
    run,
    get(...args: any[]) {
      return (run as any)("GET", ...args);
    },
    post(...args: any[]) {
      return (run as any)("POST", ...args);
    },
    fork(addMids: Middleware[]) {
      return createService(routes, middlewares.slice(0).concat(addMids));
    },
  } as any;
};
