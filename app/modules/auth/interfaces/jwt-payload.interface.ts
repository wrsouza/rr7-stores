export interface JwtPayload {
  sub: string;
  email: string;
  type: "user" | "customer";
}
