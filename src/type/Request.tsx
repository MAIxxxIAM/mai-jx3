export interface ExamRequest {
  match: string;
  limit?: number;
}

export interface NewsOfficialRequest {
  limit?: number;
}

export interface NoticeRequest {
  limit?: number;
}

export interface MainServerRequest {
  name: string;
}

export interface ServerCheckRequest {
  server: string;
}

export interface ServerStatusRequest {
  server: string;
}

export interface RolePropertyRequest {
  browser: 1;
  server: string;
  name: string;
  nickname: string;
  cache: 1;
  ticket: string;
  token: string;
}

export interface ItemPriceRequest {
  browser: number;
  name: string;
  nickname: string;
  cache: number;
  token: string;
}
