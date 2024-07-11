import { $, Context, Logger, Schema } from "koishi";
import { Jx3Api } from "./type/Interface";
import * as Api from "./type/API";
import { keyboardItem, sendButton, sendUrl } from "./utils/method";
import { ItemPriceRequest, RolePropertyRequest } from "./type/Request";
import { ActionRequest } from "koishi-plugin-actionbuttonsim";
import { jx3data, models, jx3Socket } from "./database";
import { WebSocket } from "ws";
import {} from "@koishijs/plugin-adapter-qq";

export const name = "mai-jx3";
export const inject = {
  required: ["database", "actionButtonSim"],
};

export interface Config {
  机器人昵称: string;
  推栏ticket: string;
  API_TOKEN: string;
  官方BOT_APPID: string;
}

export const Config: Schema<Config> = Schema.object({
  机器人昵称: Schema.string().default("小情鸽"),
  推栏ticket: Schema.string(),
  API_TOKEN: Schema.string(),
  官方BOT_APPID: Schema.string(),
});

export function apply(ctx: Context, config: Config) {
  Api;
  const api = new Jx3Api(ctx);

  ctx.plugin(models);
  const logger = new Logger("jx3");
  ctx.on("interaction/button", async (session) => {
    const eventId = session.event._data.id;
    const data = session.event.button as any;
    switch (data.id) {
      case "推送":
        const msg = JSON.parse(data?.data);
        const code = msg.action;
        const [group] = await ctx.database.get("jx3Api", (row) =>
          $.eq(row.id, session.channelId)
        );
        switch (code) {
          case jx3Socket["测试"]:
            logger.info("ws连接成功，推送正常");
            break;
          case jx3Socket["开服监控"]:
            const status = msg?.data.status == 1 ? "已开服" : "开始维护";
            const server = await api.getMainServer({ name: group.server });
            const serverName = server.data.name;
            const sendCheck = serverName == msg.data.server;
            if (!sendCheck) return;
            const message = `${serverName} ${status}`;
            await session.qq.sendMessage(session.channelId, {
              content: message,
              msg_type: 0,
              event_id: eventId,
              msg_seq: Math.floor(Math.random() * 1000000),
            });
            break;
          case jx3Socket["八卦速报"]:
          case jx3Socket["新闻资讯"]:
            const tittle = msg?.data.title;
            const rows = keyboardItem(
              2,
              [
                [
                  (msg.action == 2002 ? "📰 官方新闻" : "🎯 追击八卦") +
                    msg?.data.date,
                  msg.data.url,
                ],
              ],
              true
            );
            await session.qq.sendMessage(session.channelId, {
              content: tittle,
              msg_type: 0,
              event_id: eventId,
              msg_seq: Math.floor(Math.random() * 1000000),
            });
            await session.qq.sendMessage(session.channelId, {
              content: "111",
              msg_type: 2,
              keyboard: {
                content: {
                  rows: rows,
                },
              },
              msg_seq: Math.floor(Math.random() * 1000000),
              event_id: eventId,
            });
            break;
          case jx3Socket["云从预告"]:
            const time =
              new Date(msg?.data.time * 1000)
                .getHours()
                .toString()
                .padStart(2, "0") +
              ":" +
              new Date(msg?.data.time * 1000)
                .getMinutes()
                .toString()
                .padStart(2, "0");
            const site = msg?.data.site;
            const event_name = msg?.data.name;
            const event_message = `${site} 将在 ${time} 开启事件${event_name}`;
            await session.qq.sendMessage(session.channelId, {
              content: event_message,
              msg_type: 0,
              event_id: eventId,
              msg_seq: Math.floor(Math.random() * 1000000),
            });
            break;
        }
        break;
      case "绑定验证1":
        await session.qq.sendMessage(session.channelId, {
          content: "111",
          msg_type: 2,
          keyboard: {
            content: {
              rows: [
                {
                  buttons: [
                    {
                      id: "绑定验证2",
                      render_data: {
                        label: "点击验证群组",
                        visited_label: "点击验证群组",
                      },
                      action: {
                        type: 1,
                        permission: {
                          type: 1,
                          specify_user_ids: [""],
                        },
                        click_limit: 10,
                        unsupport_tips: "请输入@Bot 1",
                        data: data.data,
                      },
                    },
                  ],
                },
              ],
            },
          },
          msg_seq: Math.floor(Math.random() * 1000000),
          event_id: eventId,
        });
        break;
      case "绑定验证2":
        const [channelId, qq] = data.data.split("^");
        if (channelId !== session.channelId) return;
        const [group_a] = await ctx.database.get("jx3Api", { id: channelId });
        if (group_a) {
          if (group_a.server == "") {
            await session.qq.sendMessage(session.channelId, {
              content: "已绑定该群，点击服务器名绑定服务器",
              msg_type: 0,
              event_id: eventId,
              msg_seq: Math.floor(Math.random() * 1000000),
            });
            const rows = keyboardItem(1, [["点击输入", ""]], false);
            await session.qq.sendMessage(session.channelId, {
              content: "111",
              msg_type: 2,
              keyboard: {
                content: {
                  rows: rows,
                },
              },
              msg_seq: Math.floor(Math.random() * 1000000),
              event_id: eventId,
            });
            const input = await session.prompt(20000);
            if (!input) {
              await session.qq.sendMessage(session.channelId, {
                content: "输入超时",
                msg_type: 0,
                event_id: eventId,
                msg_seq: Math.floor(Math.random() * 1000000),
              });
              return;
            }
            const server = await api.getMainServer({ name: input });
            if (server.code !== 200) {
              await session.qq.sendMessage(session.channelId, {
                content: "服务器名错误",
                msg_type: 0,
                event_id: eventId,
                msg_seq: Math.floor(Math.random() * 1000000),
              });
              return;
            }
            await ctx.database.set(
              "jx3Api",
              { id: channelId },
              {
                server: server.data.name,
              }
            );
            await session.qq.sendMessage(session.channelId, {
              content: "绑定成功",
              msg_type: 0,
              event_id: eventId,
              msg_seq: Math.floor(Math.random() * 1000000),
            });
          } else {
            await session.qq.sendMessage(session.channelId, {
              content: "已绑定该群组",
              msg_type: 0,
              event_id: eventId,
              msg_seq: Math.floor(Math.random() * 1000000),
            });
          }
          return;
        }
        await ctx.database.create("jx3Api", {
          id: channelId,
          group_id: qq,
        });
        await session.qq.sendMessage(session.channelId, {
          content: "绑定成功",
          msg_type: 0,
          event_id: eventId,
          msg_seq: Math.floor(Math.random() * 1000000),
        });
        break;
    }
  });
  ctx.on("ready", async () => {
    const apiWS = (await ctx.http.ws(
      "wss://socket.nicemoe.cn"
    )) as unknown as WebSocket;
    apiWS.on("message", async (data) => {
      const msg = JSON.parse(data.toString());
      logger.info(msg);
      if (msg.action === 10000) {
        let actionreq: ActionRequest = {
          g: "685130953",
          a: config.官方BOT_APPID,
          b: `推送`,
          d: data.toString(),
        };
        await ctx.sleep(1000);
        await ctx.actionButtonSim.action(actionreq);
      }
      const groups: jx3data[] = await ctx.database
        .select("jx3Api")
        .where((row) => $.and($.eq(row.socket[msg.action], true)))
        .execute();
      for (let group of groups) {
        let actionreq: ActionRequest = {
          g: group.group_id,
          a: config.官方BOT_APPID,
          b: `推送`,
          d: data.toString(),
        };
        await ctx.actionButtonSim.action(actionreq);
      }
    });
  });

  ctx.command("绑定群组 <qq:string>").action(async ({ session }, qq) => {
    if (!qq) return `请输入QQ群号`;
    let actionreq: ActionRequest = {
      g: qq,
      a: config.官方BOT_APPID,
      b: `绑定验证1`,
      d: session.channelId + "^" + qq,
    };
    await ctx.actionButtonSim.action(actionreq);
  });

  // ctx.command("test111").action(async ({ session }) => {
  //   const groups: jx3data[] = await ctx.database
  //     .select("jx3Api")
  //     .where((row) => $.eq(row.socket[2001], false))
  //     .execute();
  //   console.log(groups);
  // });

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
      const [group] = await ctx.database.get("jx3Api", (row) =>
        $.eq(row.id, session.channelId)
      );
      if (!server && !name) return `请输入服务器 角色名`;
      const mid = server;
      server = name ? server : group?.server ? group?.server : "绝代天骄";
      name = name ? name : mid;
      server = server === "地狱之门" ? "绝代天骄" : server;
      const mainserver = await api.getMainServer({ name: server });
      server = mainserver.code == 200 ? mainserver.data.name : server;
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
  ctx.command("骚话").action(async ({ session }) => {
    const { data } = await api.Saohua();
    await session.send(<>{data?.text}</>);
    const rows = keyboardItem(2, [["再来一句", "骚话", "1"]], false);
    // console.log(JSON.stringify(rows, null, 2));
    try {
      await sendButton(session, rows);
    } catch (e) {}
  });
  ctx.command("查人 <uid:string>", "查人").action(async ({ session }, uid) => {
    const data = await api.Fraud({ uid });
    if (data.data.records.length === 0) {
      await session.send("未找到危险信息");
      return;
    }
    const poster = data.data.records.flatMap((tieba) => tieba.data);
    const posterList: string[][] = poster.slice(0, 5).map((item) => {
      return [item.title, item.url];
    });
    const rows = keyboardItem(1, posterList);
    await session.send("该QQ含有危险信息，点击下方按钮查看相关贴");
    await sendButton(session, rows);
  });

  ctx
    .command("金价 <server:string>", "查询金价")
    .action(async ({ session }, server) => {
      const [group] = await ctx.database.get("jx3Api", (row) =>
        $.eq(row.id, session.channelId)
      );
      server = server ? server : group?.server ? group.server : null;
      if (!server) {
        try {
          await sendButton(
            session,
            keyboardItem(1, [["重新查询", "/金价 "]], false)
          );
        } catch (e) {}
        return `请输入服务器名`;
      }
      server = server === "地狱之门" ? "绝代天骄" : server;
      const mainserver = await api.getMainServer({ name: server });
      server = mainserver.code == 200 ? mainserver.data.name : server;
      const data = await api.GoldPrice({
        browser: 1,
        server,
        nickname: config.机器人昵称,
        cache: 1,
      });
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
    .command("招募 <server:string> [keyword:string]", "查询招募")
    .action(async ({ session }, server, keyword) => {
      const serverName = await api.getMainServer({
        name: server,
      });
      let group: jx3data;
      if (serverName.code == 400) {
        keyword = server;
        [group] = await ctx.database.get("jx3Api", (row) =>
          $.eq(row.id, session.channelId)
        );
        server = group?.server ? group.server : null;
      }
      if (!server) {
        try {
          await sendButton(
            session,
            keyboardItem(1, [["重新查询", "/招募 "]], false)
          );
        } catch (e) {}
        return `请输入服务器名`;
      }
      server = server === "地狱之门" ? "绝代天骄" : server;
      const mainserver = await api.getMainServer({ name: server });
      server = mainserver ? mainserver.data.name : server;
      const data = await api.getRecruit({
        browser: 1,
        server: server,
        keyword: keyword,
        nickname: config.机器人昵称,
        cache: 1,
        token: config.API_TOKEN,
      });
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
    .command("奇遇 <server:string> <name:string>", "查询角色奇遇")
    .action(async ({ session }, server, name) => {
      server = server === "地狱之门" ? "绝代天骄" : server;
      const middle = server;
      const serverCheck = await api.getMainServer({ name: server });
      const [group] = await ctx.database.get("jx3Api", (row) =>
        $.eq(row.id, session.channelId)
      );
      server =
        serverCheck.code == 200
          ? serverCheck.data.name
          : group?.server
          ? group.server
          : null;
      if (!server) {
        try {
          await sendButton(
            session,
            keyboardItem(1, [["重新查询", "/奇遇 "]], false)
          );
        } catch (e) {}
        return `请输入服务器名，例如：/奇遇 绝代天骄 小情鸽`;
      }
      if (!name) {
        name = middle;
      }

      const data = await api.PrivateLuck({
        browser: 1,
        server,
        nickname: config.机器人昵称,
        name,
        ticket: config.推栏ticket,
        token: config.API_TOKEN,
      });
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
