import { ApiProperty } from "../../../core/swagger";

export class StoreDto {
  @ApiProperty({
    type: String,
    example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed",
  })
  readonly id: string;

  @ApiProperty({ type: String, example: "Loja Centro" })
  readonly name: string;

  @ApiProperty({ type: String, example: "2026-01-01T10:25:19.419Z" })
  readonly createdAt: Date;

  constructor(data: StoreDto) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
  }
}
