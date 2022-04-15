import { deepmerge } from "deepmerge-ts";
import { DefineRoute, CreateService } from './interface';
export const merge = deepmerge;

export const defineRoute: DefineRoute = function (method, route, cb) {
  throw new Error("not implement");
}

export const createService: CreateService = function (routes) {
  throw new Error("not implement");
}
