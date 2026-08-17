import { Injectable } from '../../core/decorators';

export interface User {
  id: string;
  name: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [
    { id: '1', name: 'Ana' },
    { id: '2', name: 'Bruno' },
  ];

  findAll(): User[] {
    return this.users;
  }

  findOne(id: string | number): User | undefined {
    return this.users.find((u) => String(u.id) === String(id));
  }

  create(name: string): User {
    const user = { id: String(this.users.length + 1), name };
    this.users.push(user);
    return user;
  }
}
