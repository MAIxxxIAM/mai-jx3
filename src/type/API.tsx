import { Jx3Api } from "./Interface";
import {
  ExamRequest,
  ItemPriceRequest,
  MainServerRequest,
  NewsOfficialRequest,
  NoticeRequest,
  RolePropertyRequest,
  ServerCheckRequest,
} from "./Request";

declare module "./Interface" {
  export interface Jx3Api {
    //获取公告
    getNotice(request: NoticeRequest): Promise<any>;
    //获取新闻
    getNews(request: NewsOfficialRequest): Promise<any>;
    //获取主服
    getMainServer(request: MainServerRequest): Promise<any>;
    //开服检查
    serverCheck(request: ServerCheckRequest): Promise<any>;
    //获取服务器状态
    getServerStatus(request: ServerCheckRequest): Promise<any>;
    //获取科举题目
    getExam(request: ExamRequest): Promise<any>;
    //获取角色属性
    getRoleProperty(request: RolePropertyRequest): Promise<any>;
    //物品价格
    getItemPrice(request: ItemPriceRequest): Promise<any>;
  }
}

Jx3Api.define({
  "/data/news/announce": {
    POST: "getNotice",
  },
  "/data/news/allnews": {
    POST: "getNews",
  },
  "/data/server/master": {
    POST: "getMainServer",
  },
  "/data/server/check": {
    POST: "serverCheck",
  },
  "/data/server/status": {
    POST: "getServerStatus",
  },
  "/data/exam/answer": {
    POST: "getExam",
  },
  "/view/role/attribute": {
    POST: "getRoleProperty",
  },
  "/view/trade/record": {
    POST: "getItemPrice",
  },
});
