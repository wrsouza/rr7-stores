import { ApiProperty } from "../../../core/swagger";
import type { JwtPayload } from "../interfaces";

export class AuthValidateTokenResultDto {
  @ApiProperty({
    type: String,
    example: "61b9c2f5-ddac-47eb-bb71-7dc1d41c09ed",
  })
  readonly sub: string;

  @ApiProperty({ type: String, example: "john.doe@domain.com" })
  readonly email: string;

  @ApiProperty({ type: String, example: "user", enum: ["user", "customer"] })
  readonly type: JwtPayload["type"];

  constructor(data: JwtPayload) {
    this.sub = data.sub;
    this.email = data.email;
    this.type = data.type;
  }
}
