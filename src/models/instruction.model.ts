import {
  Entity,
  belongsTo,
  hasMany,
  model,
  property,
} from '@loopback/repository';
import {Step, User} from '.';

enum Type {
  lehky = 'lehky',
  stredni = 'stredni',
  tezky = 'tezky',
}

@model({
  name: 'instructions',
})
export class Instruction extends Entity {
  @property({
    id: true,
    generated: true,
    required: true,
    postgresql: {
      columnName: 'id',
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
    required: true,
    postgresql: {
      columnName: 'name',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  name: string;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'type',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  type: Type;

  @property({
    type: 'string',
    required: true,
    postgresql: {
      columnName: 'link',
      dataType: 'text',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
    },
  })
  link: string;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'private',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
  })
  private: boolean;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'favourite',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
  })
  favourite: boolean;

  @property({
    type: 'boolean',
    required: true,
    postgresql: {
      columnName: 'saved',
      dataType: 'boolean',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'NO',
      default: false,
    },
  })
  saved: boolean;

  @property({
    type: 'date',
    required: true,
    postgresql: {
      columnName: 'date',
      dataType: 'timestamp with time zone',
      nullable: 'NO',
    },
    default: () => new Date(),
    valueGenerator: () => 'NOW()',
  })
  date: Date;

  @hasMany(() => Step, {keyTo: 'id'})
  steps: Step[];

  @belongsTo(() => User, {name: 'id'})
  userId: number;

  constructor(data?: Partial<Instruction>) {
    super(data);
  }
}

export interface InstructionRelations {
  // describe navigational properties here
}

export type InstructionWithRelations = Instruction & InstructionRelations;
