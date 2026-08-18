import { ApiProperty } from "../../../core/swagger";

export class CustomerDto {
  @ApiProperty({
    type: String,
    example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed",
  })
  readonly id: string;

  @ApiProperty({
    type: String,
    example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed",
  })
  readonly companyId: string;

  @ApiProperty({ type: String, example: "John Doe" })
  readonly name: string;

  @ApiProperty({ type: String, example: "john.doe@domain.com" })
  readonly email: string;

  @ApiProperty({ type: Boolean, example: false })
  readonly isActive: boolean;

  @ApiProperty({ type: String, example: "2026-01-01T10:25:19.419Z" })
  readonly createdAt: Date;

  constructor(data: CustomerDto) {
    this.id = data.id;
    this.companyId = data.companyId;
    this.name = data.name;
    this.email = data.email;
    this.isActive = data.isActive;
    this.createdAt = data.createdAt;
  }
}
