import { deepmerge } from "deepmerge-ts";
import { DefineRoute, CreateService } from "./interface";
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

export const createService: CreateService = function (routes) {
  const run = async function (method: string, url: string, request: any) {
    const paths = url.split("/").filter((v) => !!v);
    const result = await get(routes, paths);
    if (result && result[method]) {
      return result[method](request);
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
  } as any;
};
