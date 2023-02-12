import {Entity, model, property, hasMany, belongsTo} from '@loopback/repository';
import {Step} from './step.model';
import {User} from './user.model';

enum Type {
  lehky = 'lehky',
  stredni = 'stredni',
  tezky = 'tezky'
}

@model()
export class Instruction extends Entity {
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
  type: Type;

  @property({
    type: 'string',
    required: true,
  })
  link: string;

  @property({
    type: 'number',
    required: true,
  })
  user_id: number;
  @hasMany(() => Step)
  steps: Step[];

  @belongsTo(() => User)
  userId: number;

  constructor(data?: Partial<Instruction>) {
    super(data);
  }
}

export interface InstructionRelations {
  // describe navigational properties here
}

export type InstructionWithRelations = Instruction & InstructionRelations;
