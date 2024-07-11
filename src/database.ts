import { Context } from "koishi";

export enum jx3Socket {
  "开服监控" = 2001,
  "新闻资讯" = 2002,
  "八卦速报" = 2004,
  "云从预告" = 2006,
  "测试" = 10000,
}

declare module "koishi" {
  export interface Tables {
    jx3Api: jx3data;
  }
}

export interface jx3data {
  id: string;
  group_id: string;
  server: string;
  socket: jx3ws;
}
export interface jx3ws {
  2001: boolean;
  2002: boolean;
  2004: boolean;
  2006: boolean;
}

export async function models(ctx: Context) {
  ctx.model.extend("jx3Api", {
    id: "string",
    group_id: "string",
    server: "string",
    socket: {
      type: "json",
      initial: {
        2001: false,
        2002: false,
        2004: false,
        2006: false,
      },
      nullable: false,
    },
  });
}
