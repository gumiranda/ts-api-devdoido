export interface HttpResponse {
  statusCode: number;
  body: any;
}

export interface HttpRequest {
  body?: any;
  io?: any;
  usuarioLogado?: any;
  connectedUsers?: any;
}
