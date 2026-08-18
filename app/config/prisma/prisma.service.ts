import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../../generated/prisma/client";
import { Injectable } from "../../core/decorators";

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(url: string) {
    const adapter = new PrismaBetterSqlite3({ url });
    super({ adapter });
  }
}
