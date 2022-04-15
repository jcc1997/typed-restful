// routeA = route('topic/:id', async (request) => {
//     return {};
// });

// { topic: { ':id': (request: Req) => Resp } }

// allRoutes = merge(routeA)

// { topic: { ':id': (request: Req) => Resp } }

// service = setup(allRoutes)

// service.get('topic/123') // => Promise<Resp>;

// { topic: { ':id': (request: Req) => Resp } } => 'topic/$': (request: Req) => Resp
// 'topic/123' => 'topic/$'




type Method = 'GET' | 'POST';

const method = ['GET', 'POST'];

type RestFulApi = {
    get: () => void;
    // fork: () => void; // 增加中间件
}

type TestUrl = '/topic/123'; // expected match to 'topic/$', '$/123', '$/$', 'topic/123'

// type Split<T extends string, S extends string> = T extends `${infer L}${S}${infer R}` ? L | Split<R, S> : T;
// type SplitTest = Exclude<Split<TestUrl, '/'>, ''>;

type Split<T extends string, S extends string> = T extends `${infer L}${S}${infer R}` ? L extends '' ? [...Split<R, S>] : [L, ...Split<R, S>] : [T];
type SplitTest = Split<TestUrl, '/'>;

type Pattern<T extends string> = T extends `${infer L}/${infer R}` ? T | `$/${Pattern<R>}` | `${L}/${Pattern<R>}` : T | '$';
type PatternTest = Pattern<'topic/123'>;
type RemoveSlash<T extends string> = T extends `/${infer S}` ? S : T;
type RemoveSlashTest = RemoveSlash<'/topic/123'>; // 'topic/123'
type AddSlash<T extends string> = T extends `/${infer S}` ? T : `/${T}`;
type AddSlashTest = AddSlash<'topic/123'>; // 'topic/123'
type RoutePattern<T extends string> = AddSlash<Pattern<RemoveSlash<T>>>;
// type RoutePatternTest = RoutePattern<'/topic/123'>;

// ["a", "b"] => { a: { b: any } }
// type PathRecord<T extends string, V extends any> = T extends `${infer L}/${infer R}` ? Record<L, PathRecord<R, V>> : {[P in T]: V;};
type PathRecord<M extends Method, Route extends string, V extends any, T = RemoveSlash<Route>> = T extends `${infer L}/${infer R}` ? {[P in L]: PathRecord<M, R, V>;}  : {[P in Route]: { [K in M]: V };};
type PathRecordTest = PathRecord<'GET', '/topic/:id', any>;

// type TestRoute = '/topic/:id'; // expected to be 'topic/$'
type RestfulRouter<M extends Method, Route extends string, Req extends any, Resp extends any> = never; // TODO: RestfulRouter

type RestFulCall<M extends Method, URL extends string> = (method: M, url: URL) => void;

// export function createRestfulApi() {
//     return {}
// }

export {};




type TestRouter = {
    'topic': {
        'GET': (request: undefined) => Promise<{ id: string, title: string }[]>,
        ':id': {
            'GET': (request: { id: string }) => Promise<{ id: string, title: string }>,
            'POST': (request: { title: string }) => Promise<{ id: string, title: string }>,
        }
    },
    'file': {
        'GET': (request: undefined) => Promise<{ id: string, name: string }[]>,
    }
}
type Map<T extends string, V extends any = any> = { [P in T]: { [K in P]: V } }[T]

type MapTopParameter<U> = U extends any ? (arg: U) => void : never
type IntersectionFromUnion<U> =
  MapTopParameter<U> extends (arg: infer T) => void ? T : never
type PickMethod<T, K = Extract<T, Method>> = IntersectionFromUnion<K extends keyof T ? {
    [P in K]: T[P];
} : never>;

type Convert$<T extends string> = T extends `:${infer S}` ? '$' : T;

type Regenerate<
    T extends Record<string, any>,
    L extends string | number = '',
    Sub = Omit<T, Method>,
    Ms = PickMethod<T, Method>
> = Extract<keyof T, Method> extends never
    ? { [K in keyof Sub]: K extends string ? Regenerate<Sub[K], `${L}/${Convert$<K>}`> : never }[keyof Sub]
    : { [LK in L]: Ms} | { [K in keyof Sub]: K extends string ? Regenerate<Sub[K], `${L}/${Convert$<K>}`> : never }[keyof Sub];
// expect to be ['topic', { 'GET': xxx }] | ['topic/$', { 'GET': xxx, 'POST': xxx }] | ['file', {'GET': xxx}]
type RegenerateTest = IntersectionFromUnion<Regenerate<TestRouter>>;
type RegenerateTest2 = Regenerate<TestRouter['topic'], 'topic'>;

type RegenerateTest3 = Omit<TestRouter['topic'], Method>;
type RegenerateTest4 = PickMethod<TestRouter, Method>;
type RegenerateTest5 = PickMethod<TestRouter['topic'], Method>;
type RegenerateTest7 = PickMethod<TestRouter['topic'][':id'], Method>;
type RegenerateTest6 = Extract<keyof TestRouter, Method>;

type RoutePatternTest = RoutePattern<'/topic/123'>;

type IfRouteMatch = keyof RegenerateTest & RoutePatternTest extends never ? false : true;
type Overlap = keyof RegenerateTest & RoutePatternTest;
type Matcher = RegenerateTest[Overlap];


function defineRoute<M extends Method, R extends string, Cb extends (request: any) => any>(method: M, route: R, cb: Cb): PathRecord<M, R, Cb> {
    throw new Error('not implement');
}

const routeA = defineRoute('GET', '/topic/:id', () => {});
