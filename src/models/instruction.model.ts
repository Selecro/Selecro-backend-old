import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {Step} from './step.model';
import {User} from './user.model';

enum Type {
  lehky = 'lehky',
  stredni = 'stredni',
  tezky = 'tezky'
}

@model({
  name: 'instructions',
})
export class Instruction extends Entity {
  @property({
    type: 'number',
    required: true,
    scale: 0,
    id: 1,
    postgresql: {
      columnName: 'instruction_id',
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

  @hasMany(() => Step)
  steps: Step[];

  @belongsTo(() => User)
  user_id: number;

  constructor(data?: Partial<Instruction>) {
    super(data);
  }
}

export interface InstructionRelations {
  // describe navigational properties here
}

export type InstructionWithRelations = Instruction & InstructionRelations;
