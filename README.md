# restful

## purpose

REST(Representational State Transfer) RESTful is always used in HTTP api design.

Here is a tool of using it in common service design, and of course support typescript.

## usage

### defineRoute

just like define a server router

```typescript
import { defineRoute, merge } from "typed-restful";

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

const routes = merge(route1, route2, route3, route4);
```

### createSerivce

from routes create service

```typescript
import { createService } from "typed-restful";


const service = createService(routes);
service.run("GET", "/file", undefined);
service.get("/file", undefined);
// @ts-expect-error
service.post("/file", undefined);
service.run("GET", "/topic/123", "123").then((v) => {});
// @ts-expect-error
service.run("GET", "/topic/123", 123).then((v) => {});
service.get("/topic/123", "123").then((v) => {});
```

<!-- ### middleware

you can add middleware to every route

```typescript
import { createService } from "typed-restful";

const service = createService(routes, [async function (request, next) {
  // you can do something to options
  const response = await next(request);
  // you can do something to response
  return response;
}]);

// add service by fork a new service

const forked = service.fork([async function (request, next) {
  // you can do something to options
  const response = await next(request);
  // you can do something to response
  return response;
}]);
``` -->
