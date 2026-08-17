import { ApiProperty } from "../../../core/swagger";

export class AuthLoginDataDto {
  @ApiProperty({
    type: String,
    example: "john.doe@domain.com",
  })
  declare readonly email: string;

  @ApiProperty({
    type: String,
    example: "",
  })
  declare readonly password: string;
}
