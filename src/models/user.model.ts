import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Group} from './group.model';
import {Instruction} from './instruction.model';

@model()
export class User extends Entity {
  @property({
    type: 'number',
    required: true,
    scale: 0,
    id: 1,
    generated: true,
    postgresql: {
      columnName: 'iduser',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  id: number;

  @property({
    type: 'string',
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
    postgresql: {
      columnName: 'username',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  username?: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'passwdsalt',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  salt: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'passdwhash',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  password: string;

  @property({
    type: 'string',
    postgresql: {
      columnName: 'nick',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  nick: string;

  @property({
    type: 'number',
    required: true,
    generated: true,
    postgresql: {
      columnName: 'idgroup',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'NO',
    },
  })
  idgroup: number;
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
