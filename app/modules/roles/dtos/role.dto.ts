import { ApiProperty } from "../../../core/swagger";

export class RoleDto {
  @ApiProperty({
    type: String,
    example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed",
  })
  readonly id: string;

  @ApiProperty({ type: String, example: "Administrador" })
  readonly name: string;

  @ApiProperty({ type: String, example: "Acesso total ao sistema" })
  readonly description: string;

  @ApiProperty({ type: Boolean, example: false })
  readonly isActive: boolean;

  @ApiProperty({ type: String, example: "2026-01-01T10:25:19.419Z" })
  readonly createdAt: Date;

  constructor(data: RoleDto) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
  }
}
