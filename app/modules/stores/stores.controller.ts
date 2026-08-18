import { AuthGuard } from "../../common/auth.guard";
import { LoggingInterceptor } from "../../common/logging.interceptor";
import { RolesGuard } from "../../common/roles.guard";
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Roles,
  UseGuards,
  UseInterceptors,
} from "../../core/decorators";
import { Inject } from "../../core/decorators/injectable.decorator";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "../../core/decorators/swagger";
import {
  type StoreCreateInput,
  StoreDto,
  type StoreUpdateInput,
  storeCreateSchema,
  storeUpdateSchema,
} from "./dtos";
import { StoresService } from "./stores.service";

@ApiTags("Stores")
@Controller("stores")
@UseInterceptors(LoggingInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class StoresController {
  constructor(
    @Inject(StoresService) private readonly storesService: StoresService,
  ) {}

  @Get()
  @Roles("store_list")
  @ApiOperation({ summary: "Lista todas as lojas" })
  @ApiOkResponse({ type: StoreDto, isArray: true })
  findAll() {
    return this.storesService.findAll();
  }

  @Post()
  @Roles("store_create")
  @ApiOperation({ summary: "Cria uma nova loja" })
  @ApiCreatedResponse({ type: StoreDto })
  create(@Body(storeCreateSchema) data: StoreCreateInput): Promise<StoreDto> {
    return this.storesService.createOne(data);
  }

  @Get(":id")
  @Roles("store_show")
  @ApiOperation({ summary: "Busca uma loja pelo id" })
  @ApiOkResponse({ type: StoreDto })
  @ApiNotFoundResponse({ description: "Loja não encontrada" })
  findOne(@Param("id") id: string): Promise<StoreDto> {
    return this.storesService.findOne(id);
  }

  @Put(":id")
  @Roles("store_update")
  @ApiOperation({ summary: "Atualiza os dados da loja" })
  @ApiNotFoundResponse({ description: "Loja não encontrada" })
  @ApiOkResponse({ type: StoreDto })
  updateOne(
    @Param("id") id: string,
    @Body(storeUpdateSchema) data: StoreUpdateInput,
  ): Promise<StoreDto> {
    return this.storesService.updateOne(id, data);
  }

  @Delete(":id")
  @Roles("store_delete")
  @ApiOperation({ summary: "Exclui uma loja pelo id" })
  @ApiNotFoundResponse({ description: "Loja não encontrada" })
  @ApiResponse({ status: 204, description: "No Response" })
  deleteOne(@Param("id") id: string): Promise<void> {
    return this.storesService.deleteOne(id);
  }
}
