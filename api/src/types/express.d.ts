export interface TypedRequestBody<T> extends Express.Request {
  body: T;
  params: Record<string, string>;
}
