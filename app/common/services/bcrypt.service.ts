import { compareSync, hashSync } from "bcryptjs";
import { Injectable } from "../../core/decorators";

@Injectable()
export class BcryptService {
  hashSync(value: string): string {
    return hashSync(value);
  }

  compareSync(value: string, hash: string) {
    return compareSync(value, hash);
  }
}
