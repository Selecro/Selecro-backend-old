import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Instruction} from './instruction.model';

@model()
export class Step extends Entity {
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
  style: string;

  @property({
    type: 'string',
    required: true,
  })
  title: string;

  @property({
    type: 'string',
    required: true,
  })
  pomucky: string;

  @property({
    type: 'string',
    required: true,
  })
  popis: string;

  @property({
    type: 'number',
    required: true,
  })
  navod_idnavod: number;

  @belongsTo(() => Instruction)
  instructionId: number;

  constructor(data?: Partial<Step>) {
    super(data);
  }
}

export interface StepRelations {
  // describe navigational properties here
}

export type StepWithRelations = Step & StepRelations;
