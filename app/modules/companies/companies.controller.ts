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
  type CompanyCreateInput,
  CompanyDto,
  type CompanyUpdateInput,
  companyCreateSchema,
  companyUpdateSchema,
} from "./dtos";
import { CompaniesService } from "./companies.service";

@ApiTags("Companies")
@Controller("companies")
@UseInterceptors(LoggingInterceptor)
@UseGuards(AuthGuard, RolesGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(
    @Inject(CompaniesService)
    private readonly companiesService: CompaniesService,
  ) {}

  @Get()
  @Roles("company_list")
  @ApiOperation({ summary: "Lista todas as empresas" })
  @ApiOkResponse({ type: CompanyDto, isArray: true })
  findAll() {
    return this.companiesService.findAll();
  }

  @Post()
  @Roles("company_create")
  @ApiOperation({ summary: "Cria uma nova empresa" })
  @ApiCreatedResponse({ type: CompanyDto })
  create(
    @Body(companyCreateSchema) data: CompanyCreateInput,
  ): Promise<CompanyDto> {
    return this.companiesService.createOne(data);
  }

  @Get(":id")
  @Roles("company_show")
  @ApiOperation({ summary: "Busca uma empresa pelo id" })
  @ApiOkResponse({ type: CompanyDto })
  @ApiNotFoundResponse({ description: "Empresa não encontrada" })
  findOne(@Param("id") id: string): Promise<CompanyDto> {
    return this.companiesService.findOne(id);
  }

  @Put(":id")
  @Roles("company_update")
  @ApiOperation({ summary: "Atualiza os dados da empresa" })
  @ApiNotFoundResponse({ description: "Empresa não encontrada" })
  @ApiOkResponse({ type: CompanyDto })
  updateOne(
    @Param("id") id: string,
    @Body(companyUpdateSchema) data: CompanyUpdateInput,
  ): Promise<CompanyDto> {
    return this.companiesService.updateOne(id, data);
  }

  @Delete(":id")
  @Roles("company_delete")
  @ApiOperation({ summary: "Exclui uma empresa pelo id" })
  @ApiNotFoundResponse({ description: "Empresa não encontrada" })
  @ApiResponse({ status: 204, description: "No Response" })
  deleteOne(@Param("id") id: string): Promise<void> {
    return this.companiesService.deleteOne(id);
  }
}
