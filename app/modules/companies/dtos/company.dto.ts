import { ApiProperty } from "../../../core/swagger";

export class CompanyDto {
  @ApiProperty({
    type: String,
    example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed",
  })
  readonly id: string;

  @ApiProperty({
    type: String,
    example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed",
  })
  readonly storeId: string;

  @ApiProperty({ type: String, example: "Acme Ltda" })
  readonly name: string;

  @ApiProperty({ type: Boolean, example: false })
  readonly isActive: boolean;

  @ApiProperty({ type: String, example: "2026-01-01T10:25:19.419Z" })
  readonly createdAt: Date;

  constructor(data: CompanyDto) {
    this.id = data.id;
    this.storeId = data.storeId;
    this.name = data.name;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
  }
}
