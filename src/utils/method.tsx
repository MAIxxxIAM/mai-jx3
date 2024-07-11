import { promises } from "dns";
import { Session } from "koishi";

export function urlbutton(
  权限: number,
  a: string,
  b: string,
  c: string,
  enter: boolean = true
) {
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
        type: 权限,
        specify_user_ids: [""],
      },
      click_limit: 10,
      unsupport_tips: "",
      data: b,
    },
  };
}
export function button(
  权限: number,
  文本: string,
  数据: string,
  id: string,
  enter = true
) {
  return {
    id: id,
    render_data: {
      label: 文本,
      visited_label: 文本,
    },
    action: {
      type: 2,
      permission: {
        type: 权限,
        specify_user_ids: [""],
      },
      click_limit: 10,
      unsupport_tips: "请输入@Bot 1",
      data: 数据,
      enter: enter,
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
            buttons: [urlbutton(2, "点击跳转", url, "url")],
          },
        ],
      },
    },
    timestamp: session.timestamp,
    msg_id: session.messageId,
    msg_seq: Math.floor(Math.random() * 1000000),
  });
}

export function keyboardItem<T extends any[]>(
  line: number,
  links: string[][],
  isUrl = true
) {
  let buttonList: any[] = [];
  let rowList: any[] = [];
  for (let i = 0; i < links.length; i++) {
    buttonList.push(
      (isUrl ? urlbutton : button)(
        2,
        links[i][0],
        links[i][1],
        links[i][1],
        links[i]?.[2] ? true : false
      )
    );
    if (buttonList.length == line) {
      rowList.push({
        buttons: buttonList,
      });
      buttonList = [];
    }
    if (i == links.length - 1) {
      rowList.push({
        buttons: buttonList,
      });
      buttonList = [];
    }
  }
  return rowList.filter((item) => item.buttons.length > 0);
}

export async function sendButton(session: Session, row: any): Promise<void> {
  session.bot.internal.sendMessage(session.channelId, {
    content: "111",
    msg_type: 2,
    keyboard: {
      content: {
        rows: row,
      },
    },
    timestamp: session.timestamp,
    msg_seq: Math.floor(Math.random() * 1000000),
    msg_id: session.messageId,
  });
}
