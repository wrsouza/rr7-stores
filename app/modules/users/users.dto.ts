import { ApiProperty } from '../../core/decorators/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Carla', description: 'Nome do usuário' })
  name!: string;
}

export class UserDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'Carla' })
  name!: string;
}
