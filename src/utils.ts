export function is$(str: string) {
  if (str.startsWith(":")) return true;
  return false;
}

export function findMatchers(path: string, keys: string[]) {
  return keys.filter((v) => is$(v) || path === v);
}

export function get(obj: any, paths: string[]): any {
  if (paths.length < 1) return undefined;
  const matchers = findMatchers(paths[0], Object.keys(obj));
  if (matchers.length < 1) return undefined;
  if (paths.length === 1) {
    for (let i = 0; i < matchers.length; i++) {
      return obj[matchers[0]];
    }
  } else {
    let result;
    for (let i = 0; i < matchers.length; i++) {
      result = get(obj[matchers[i]], paths.slice(1));
      if (result) return result;
    }
  }
  return undefined;
}

export function checkRoutes(routes: any, path = "") {
  const keys = Object.keys(routes);
  const hasMulti$ =
    keys.map<number>((v) => (is$(v) ? 1 : 0)).reduce((p, c) => p + c) > 1;
  if (hasMulti$) {
    console.warn(`${path} has multiple variable`);
  }
  keys.forEach((v) => {
    checkRoutes(routes[v], `${path}/v`);
  });
}
