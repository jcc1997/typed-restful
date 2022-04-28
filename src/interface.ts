export type DefineRoute = <
  M extends Method,
  R extends string,
  Handler extends (request: any, vars?: any) => any
>(
  method: M,
  route: R,
  cb: Handler
) => PathRecord<M, RemoveSlash<R>, Handler>;

export type CreateService = <T extends Record<string, any>>(
  routes: T,
  middlewares?: Middleware[]
) => Service<T>;

export type Method = "GET" | "POST";

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

export type Service<
  T extends Record<string, any>,
  FRoutes = FlattenRoutes<T>
> = {
  run<
    M extends keyof Handlers,
    R extends Overlap extends never ? never : string,
    Req extends (Handler extends ((...args: any) => any)
      ? Parameters<Handler>[0]
      : never),
    Resp extends (Handler extends ((...args: any) => any)
      ? ReturnType<Handler>
      : never),
    Overlap = RoutePattern<R> & keyof FRoutes,
    Handlers = Overlap extends keyof FRoutes ? FRoutes[Overlap] : never,
    Handler = Handlers[M]
  >(
    method: M,
    url: R,
    request: Req
  ): Promise<Resp>;
  get<
    R extends Overlap extends never ? never : string,
    Req extends (Handler extends ((...args: any) => any)
      ? Parameters<Handler>[0]
      : never),
    Resp extends (Handler extends ((...args: any) => any)
      ? ReturnType<Handler>
      : never),
    Overlap = RoutePattern<R> & keyof FRoutes,
    Handlers = Overlap extends keyof FRoutes ? FRoutes[Overlap] : never,
    Handler = "GET" extends keyof Handlers ? Handlers["GET"] : never
  >(
    url: R,
    request: Req
  ): Promise<Resp>;
  post<
    R extends Overlap extends never ? never : string,
    Req extends (Handler extends ((...args: any) => any)
      ? Parameters<Handler>[0]
      : never),
    Resp extends (Handler extends ((...args: any) => any)
      ? ReturnType<Handler>
      : never),
    Overlap = RoutePattern<R> & keyof FRoutes,
    Handlers = Overlap extends keyof FRoutes ? FRoutes[Overlap] : never,
    Handler = "POST" extends keyof Handlers ? Handlers["POST"] : never
  >(
    url: R,
    request: Req
  ): Promise<Resp>;
  fork(middlewares: Middleware[]): Service<T>;
};

export type Middleware<Request = any, Response = any> = (
  request: Request,
  info: { method: Method; url: string },
  next: (request: any) => Promise<any>
) => Promise<Response>;
