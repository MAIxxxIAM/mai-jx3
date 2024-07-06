import { Context, Dict, HTTP, makeArray } from "koishi";

export class Jx3Internal {
  private http: () => HTTP;
  constructor(ctx: Context) {
    this.http = () =>
      ctx.http.extend({
        headers: { "Content-Type": "application/json" },
      });
  }
  static define(routes: Dict<Partial<Record<HTTP.Method, string | string[]>>>) {
    console.log(routes);
    for (const path in routes) {
      for (const key in routes[path]) {
        const method = key as HTTP.Method;
        for (const name of makeArray(routes[path][method])) {
          Jx3Internal.prototype[name] = async function (
            this: Jx3Internal,
            ...args: any[]
          ) {
            const url = "https://www.jx3api.com" + path;
            const config: HTTP.RequestConfig = {};
            if (args.length == 0) {
              throw new Error(`缺少参数`);
            }
            config.data = args[0];
            const http = this.http();
            try {
              const response = await http(url, { ...config, method });
              return response.data;
            } catch (error) {
              if (!http.isError(error) || !error.response) throw error;
              throw error;
            }
          };
        }
      }
    }
  }
}

export class Jx3Api extends Jx3Internal {}
