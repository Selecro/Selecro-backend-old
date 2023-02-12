import {Entity, model, property, hasMany} from '@loopback/repository';
import {User} from './user.model';

enum Role {
  admin = 'admin',
  user = 'user'
}

@model()
export class Group extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  role: Role;

  @hasMany(() => User)
  users: User[];

  constructor(data?: Partial<Group>) {
    super(data);
  }
}

export interface GroupRelations {
  // describe navigational properties here
}

export type GroupWithRelations = Group & GroupRelations;
