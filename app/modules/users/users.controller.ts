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
  type UserCreateInput,
  UserDto,
  type UserUpdateInput,
  userCreateSchema,
  userUpdateSchema,
} from "./dtos";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
@UseInterceptors(LoggingInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
  ) {}

  @Get()
  @Roles("user_list")
  @ApiOperation({ summary: "Lista todos os usuários" })
  @ApiOkResponse({ type: UserDto, isArray: true })
  findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles("user_create")
  @ApiOperation({ summary: "Cria um novo usuário" })
  @ApiCreatedResponse({ type: UserDto })
  create(@Body(userCreateSchema) data: UserCreateInput): Promise<UserDto> {
    return this.usersService.createOne(data);
  }

  @Get(":id")
  @Roles("user_show")
  @ApiOperation({ summary: "Busca um usuário pelo id" })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  findOne(@Param("id") id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Put(":id")
  @Roles("user_update")
  @ApiOperation({ summary: "Atualiza os dados do usuario" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiOkResponse({ type: UserDto })
  updateOne(
    @Param("id") id: string,
    @Body(userUpdateSchema) data: UserUpdateInput,
  ): Promise<UserDto> {
    return this.usersService.updateOne(id, data);
  }

  @Delete(":id")
  @Roles("user_delete")
  @ApiOperation({ summary: "Exclui um usuário pelo id" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  @ApiResponse({ status: 204, description: "No Response" })
  deleteOne(@Param("id") id: string): Promise<void> {
    return this.usersService.deleteOne(id);
  }
}
