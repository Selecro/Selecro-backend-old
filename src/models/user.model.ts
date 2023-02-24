import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Group} from './group.model';
import {Instruction} from './instruction.model';

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
  passwdhash: string = "mfjenvn22";
  @hasMany(() => Instruction)
  instructions: Instruction[];

  @belongsTo(() => Group)
  groupId: number;

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
