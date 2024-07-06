import { Context, Schema } from "koishi";
import { Jx3Api } from "./type/Interface";
import * as Api from "./type/API";
import { sendUrl } from "./utils/method";
import { ItemPriceRequest, RolePropertyRequest } from "./type/Request";

export const name = "jx3";

export interface Config {
  机器人昵称: string;
  推栏ticket: string;
  API_TOKEN: string;
}

export const Config: Schema<Config> = Schema.object({
  机器人昵称: Schema.string().default("小情鸽"),
  推栏ticket: Schema.string(),
  API_TOKEN: Schema.string(),
});

export function apply(ctx: Context, config: Config) {
  Api;
  const api = new Jx3Api(ctx);
  ctx.command("更新公告", "获取最新的官方公告").action(async ({ session }) => {
    const data = await api.getNotice({ limit: 1 });
    const [notice] = data.data;
    await session.send(
      <>
        {notice.type}
        <br />
        {notice.title}
      </>
    );
    await sendUrl(session, notice.url);
  });

  ctx
    .command("属性 [server:string] [name:string]", "查询角色属性")
    .action(async ({ session }, server, name) => {
      if (!server && !name) return `请输入服务器 角色名`;
      const mid = server;
      server = name ? server : "绝代天骄";
      name = name ? name : mid;
      server = server === "地狱之门" ? "绝代天骄" : server;
      const mainserver = await api.getMainServer({ name: server });
      server = mainserver ? mainserver.data.name : server;
      const request: RolePropertyRequest = {
        browser: 1,
        server,
        name,
        nickname: config.机器人昵称,
        cache: 1,
        ticket: config.推栏ticket,
        token: config.API_TOKEN,
      };
      const data = await api.getRoleProperty(request);
      switch (data.code) {
        case 200:
          await session.send(
            <>
              <img src={data.data.url} />
            </>
          );
          break;
        case 404:
          await session.send(data.msg);
          break;
      }
    });
  ctx
    .command("物价 <name:string>", "查询物品价格")
    .action(async ({ session }, name) => {
      if (!name) return `请输入物品名称`;
      const request: ItemPriceRequest = {
        browser: 1,
        name,
        nickname: config.机器人昵称,
        cache: 1,
        token: config.API_TOKEN,
      };
      const data = await api.getItemPrice(request);

      switch (data.code) {
        case 200:
          await session.send(
            <>
              <img src={data.data.url} />
            </>
          );
          break;
        case 404:
          await session.send(data.msg);
          break;
      }
    });
}
