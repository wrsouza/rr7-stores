import type { DynamicModule } from "../../core/constants";
import { Module } from "../../core/decorators";
import { PrismaService } from "./prisma.service";

export interface PrismaModuleOptions {
  url: string;
}

@Module({})
export class PrismaModule {
  static forRoot(options: PrismaModuleOptions): DynamicModule {
    return {
      module: PrismaModule,
      global: true,
      providers: [
        {
          provide: PrismaService,
          useFactory: () => new PrismaService(options.url),
        },
      ],
      exports: [PrismaService],
    };
  }
}
