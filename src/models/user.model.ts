import {Entity, model, property} from '@loopback/repository';

@model()
export class User extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  email: string;

  @property({
    type: 'string',
    required: false,
  })
  name?: string;

  @property({
    type: 'string',
    required: false,
  })
  surname?: string;

  @property({
    type: 'string',
    required: false,
  })
  username?: string;

  @property({
    type: 'string',
    required: true,
  })
  passwdsalt: string;

  @property({
    type: 'string',
    required: true,
  })
  passwdhash: string;

  @property({
    type: 'string',
    required: true,
  })
  nick: string;

  @property({
    type: 'number',
    required: true,
  })
  group_idgroup: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
