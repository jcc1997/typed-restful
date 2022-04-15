import { deepmerge } from "deepmerge-ts";
export const merge = deepmerge;

export function defineRoute<
  M extends Method,
  R extends string,
  Handler extends (request: any) => any
>(method: M, route: R, cb: Handler): PathRecord<M, RemoveSlash<R>, Handler> {
  throw new Error("not implement");
}

export function createService<T extends Record<string, any>>(
  routes: T
): Service<T> {
  throw new Error("not implement");
}

// const routeA: {
//     topic: {
//         ":id": {
//             GET: () => void;
//         };
//     };
// }
const route1 = defineRoute("GET", "/topic/:id", (request: string) => {
  return 123;
});
const route2 = defineRoute("POST", "/topic/:id", () => {});
const route3 = defineRoute("GET", "/topic", () => {});
const route4 = defineRoute("GET", "/file", (req?: {}) => {});

const routes = deepmerge(route1, route2, route3, route4);

const service = createService(routes);
service.run("GET", "/file", undefined);
service.run("GET", "/topic/123", "123").then((v) => {});

/** type utils */
type MapTopParameter<U> = U extends any ? (arg: U) => void : never;

type IntersectionFromUnion<U> = MapTopParameter<U> extends (
  arg: infer T
) => void
  ? T
  : never;

type PickMethod<T, K = Extract<T, Method>> = IntersectionFromUnion<
  K extends keyof T
    ? {
        [P in K]: T[P];
      }
    : never
>;

type Convert$<T extends string> = T extends `:${infer S}` ? "$" : T;
type RemoveSlash<T extends string> = T extends `/${infer S}` ? S : T;
type AddSlash<T extends string> = T extends `/${infer S}` ? T : `/${T}`;

/** type function */

type Method = "GET" | "POST";

type PathRecord<
  M extends Method,
  T extends string,
  V extends any
> = T extends `${infer L}/${infer R}`
  ? { [P in L]: PathRecord<M, R, V> }
  : { [P in T]: { [K in M]: V } };

type Pattern<T extends string> = T extends `${infer L}/${infer R}`
  ? T | `$/${Pattern<R>}` | `${L}/${Pattern<R>}`
  : T | "$";
type RoutePattern<T extends string> = AddSlash<Pattern<RemoveSlash<T>>>;
// type RoutePatternTest = RoutePattern<'/topic/123'>;
// type RoutePatternTest = "/topic/123" | "/$/123" | "/$/$" | "/topic/$"

// convert to be { 'topic': { 'GET': xxx }; 'topic/$': { 'GET': xxx, 'POST': xxx }; 'file': {'GET': xxx }; }
type Flatten<
  T extends Record<string, any>,
  L extends string | number = "",
  Sub = Omit<T, Method>,
  Ms = PickMethod<T, Method>
> = Extract<keyof T, Method> extends never
  ? {
      [K in keyof Sub]: K extends string
        ? Flatten<Sub[K], `${L}/${Convert$<K>}`>
        : never;
    }[keyof Sub]
  :
      | { [LK in L]: Ms }
      | {
          [K in keyof Sub]: K extends string
            ? Flatten<Sub[K], `${L}/${Convert$<K>}`>
            : never;
        }[keyof Sub];
type FlattenRoutes<T extends Record<string, any>> = IntersectionFromUnion<
  Flatten<T>
>;

/** type defination */

type Service<T extends Record<string, any>, FRoutes = FlattenRoutes<T>> = {
  run<
    M extends keyof Handlers,
    R extends Overlap extends never ? never : string,
    Req extends Handler extends (...args: any) => any
      ? Parameters<Handler>[0]
      : never,
    Resp extends Handler extends (...args: any) => any
      ? ReturnType<Handler>
      : never,
    Overlap = RoutePattern<R> & keyof FRoutes,
    Handlers = Overlap extends keyof FRoutes ? FRoutes[Overlap] : never,
    Handler = Handlers[M]
  >(
    method: M,
    url: R,
    request: Req
  ): Promise<Resp>;
};

type test = FlattenRoutes<typeof routes>;
