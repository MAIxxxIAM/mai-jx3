import { promises } from "dns";
import { Session } from "koishi";

export function urlbutton(a: string, b: string, c: string) {
  return {
    id: c,
    render_data: {
      label: a,
      visited_label: a,
      style: 1,
    },
    action: {
      type: 0,
      permission: {
        type: 2,
        specify_user_ids: [""],
      },
      click_limit: 10,
      unsupport_tips: "",
      data: b,
    },
  };
}

export async function sendUrl(session: Session, url: string): Promise<void> {
  session.bot.internal.sendMessage(session.channelId, {
    content: "111",
    msg_type: 2,
    keyboard: {
      content: {
        rows: [
          {
            buttons: [urlbutton("点击跳转", url, "url")],
          },
        ],
      },
    },
    timestamp: session.timestamp,
    msg_seq: Math.floor(Math.random() * 1000000),
  });
}
