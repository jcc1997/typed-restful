import "../src/index";
import { createService, defineRoute, merge } from "../src/index";

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

const service = createService(routes);
service.run("GET", "/file", undefined);
service.get("/file", undefined);
// @ts-expect-error
service.post("/file", undefined);
service.run("GET", "/topic/123", "123").then((v) => {});
// @ts-expect-error
service.run("GET", "/topic/123", 123).then((v) => {});
service.get("/topic/123", "123").then((v) => {});
