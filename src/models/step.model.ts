import {Entity, model, property} from '@loopback/repository';

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

  constructor(data?: Partial<Step>) {
    super(data);
  }
}

export interface StepRelations {
  // describe navigational properties here
}

export type StepWithRelations = Step & StepRelations;
