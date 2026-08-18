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
  type CustomerCreateInput,
  CustomerDto,
  type CustomerUpdateInput,
  customerCreateSchema,
  customerUpdateSchema,
} from "./dtos";
import { CustomersService } from "./customers.service";

@ApiTags("Customers")
@Controller("customers")
@UseInterceptors(LoggingInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(
    @Inject(CustomersService)
    private readonly customersService: CustomersService,
  ) {}

  @Get()
  @Roles("customer_list")
  @ApiOperation({ summary: "Lista todos os clientes" })
  @ApiOkResponse({ type: CustomerDto, isArray: true })
  findAll() {
    return this.customersService.findAll();
  }

  @Post()
  @Roles("customer_create")
  @ApiOperation({ summary: "Cria um novo cliente" })
  @ApiCreatedResponse({ type: CustomerDto })
  create(
    @Body(customerCreateSchema) data: CustomerCreateInput,
  ): Promise<CustomerDto> {
    return this.customersService.createOne(data);
  }

  @Get(":id")
  @Roles("customer_show")
  @ApiOperation({ summary: "Busca um cliente pelo id" })
  @ApiOkResponse({ type: CustomerDto })
  @ApiNotFoundResponse({ description: "Cliente não encontrado" })
  findOne(@Param("id") id: string): Promise<CustomerDto> {
    return this.customersService.findOne(id);
  }

  @Put(":id")
  @Roles("customer_update")
  @ApiOperation({ summary: "Atualiza os dados do cliente" })
  @ApiNotFoundResponse({ description: "Cliente não encontrado" })
  @ApiOkResponse({ type: CustomerDto })
  updateOne(
    @Param("id") id: string,
    @Body(customerUpdateSchema) data: CustomerUpdateInput,
  ): Promise<CustomerDto> {
    return this.customersService.updateOne(id, data);
  }

  @Delete(":id")
  @Roles("customer_delete")
  @ApiOperation({ summary: "Exclui um cliente pelo id" })
  @ApiNotFoundResponse({ description: "Cliente não encontrado" })
  @ApiResponse({ status: 204, description: "No Response" })
  deleteOne(@Param("id") id: string): Promise<void> {
    return this.customersService.deleteOne(id);
  }
}
