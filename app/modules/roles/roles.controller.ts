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
  type RoleCreateInput,
  RoleDto,
  type RoleUpdateInput,
  roleCreateSchema,
  roleUpdateSchema,
} from "./dtos";
import { RolesService } from "./roles.service";

@ApiTags("Roles")
@Controller("roles")
@UseInterceptors(LoggingInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class RolesController {
  constructor(
    @Inject(RolesService) private readonly rolesService: RolesService,
  ) {}

  @Get()
  @Roles("role_list")
  @ApiOperation({ summary: "Lista todos os perfis" })
  @ApiOkResponse({ type: RoleDto, isArray: true })
  findAll() {
    return this.rolesService.findAll();
  }

  @Post()
  @Roles("role_create")
  @ApiOperation({ summary: "Cria um novo perfil" })
  @ApiCreatedResponse({ type: RoleDto })
  create(@Body(roleCreateSchema) data: RoleCreateInput): Promise<RoleDto> {
    return this.rolesService.createOne(data);
  }

  @Get(":id")
  @Roles("role_show")
  @ApiOperation({ summary: "Busca um perfil pelo id" })
  @ApiOkResponse({ type: RoleDto })
  @ApiNotFoundResponse({ description: "Perfil não encontrado" })
  findOne(@Param("id") id: string): Promise<RoleDto> {
    return this.rolesService.findOne(id);
  }

  @Put(":id")
  @Roles("role_update")
  @ApiOperation({ summary: "Atualiza os dados do perfil" })
  @ApiNotFoundResponse({ description: "Perfil não encontrado" })
  @ApiOkResponse({ type: RoleDto })
  updateOne(
    @Param("id") id: string,
    @Body(roleUpdateSchema) data: RoleUpdateInput,
  ): Promise<RoleDto> {
    return this.rolesService.updateOne(id, data);
  }

  @Delete(":id")
  @Roles("role_delete")
  @ApiOperation({ summary: "Exclui um perfil pelo id" })
  @ApiNotFoundResponse({ description: "Perfil não encontrado" })
  @ApiResponse({ status: 204, description: "No Response" })
  deleteOne(@Param("id") id: string): Promise<void> {
    return this.rolesService.deleteOne(id);
  }
}
