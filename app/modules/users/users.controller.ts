import { AuthGuard } from '../../common/auth.guard';
import { LoggingInterceptor } from '../../common/logging.interceptor';
import { HttpException } from '../../core/application';
import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '../../core/decorators';
import { Inject } from '../../core/decorators/injectable.decorator';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '../../core/decorators/swagger';
import { ParseIntPipe } from '../../core/pipes';
import { CreateUserDto, UserDto } from './users.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
@UseInterceptors(LoggingInterceptor) // aplica a todos os métodos do controller
export class UsersController {
  // Injeção explícita por token (a própria classe) — não depende de
  // reflection automática de tipos, então funciona com o esbuild do Vite.
  constructor(@Inject(UsersService) private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiOkResponse({ type: UserDto, isArray: true })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo id' })
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOkResponse({ type: UserDto })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    const user = this.usersService.findOne(id);
    if (!user) throw new HttpException('Usuário não encontrado', 404);
    return user;
  }

  @Post()
  @UseGuards(AuthGuard) // só este endpoint exige x-api-key
  @ApiSecurity('api_key') // ...e o doc anuncia isso (scheme registrado no DocumentBuilder)
  @ApiOperation({ summary: 'Cria um novo usuário (requer x-api-key: secret)' })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'name é obrigatório' })
  create(@Body('name') name: string) {
    if (!name) throw new HttpException('name é obrigatório', 400);
    return this.usersService.create(name);
  }
}
