import {Entity, hasMany, model, property} from '@loopback/repository';
import {Group} from './group.model';
import {Instruction} from './instruction.model';
import {UserGroup} from './user-group.model';
import {UserLink} from './user-link.model';

export enum Language {
  CZ = 'CZ',
  EN = 'EN'
}

@model({
  name: 'users',
})
export class User extends Entity {
  @property({
    id: true,
    generated: true,
    postgresql: {
      columnName: 'id',
      dataLength: null,
      dataPrecision: 10,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'email',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  email: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'username',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'password_hash',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  passwordHash: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'language',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  language: Language;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'darkmode',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
  })
  darkmode: boolean = false;

  @property({
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'date',
      dataType: 'Date',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
    default: () => new Date(),
  })
  date: Date;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'name',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  name?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'surname',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  surname?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'nick',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  nick?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'bio',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  bio?: string;

  @property({
    type: 'string',
    required: false,
    postgresql: {
      columnName: 'link',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  link?: string;

  @hasMany(() => Group, {
    through: {
      model: () => UserGroup,
      keyTo: 'group_id',
      keyFrom: 'user_id'
    }
  })
  groups: Group[];

  @hasMany(() => User, {
    through: {
      model: () => UserLink,
      keyFrom: 'follower_id',
      keyTo: 'followee_id',
    },
  })
  users: User[];

  @hasMany(() => Instruction)
  instruction?: Instruction[];

  constructor(data?: Partial<User>) {
    super(data);
  }
}

export interface UserRelations {
  // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
