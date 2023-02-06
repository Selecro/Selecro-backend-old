import {Entity, model, property} from '@loopback/repository';

@model()
export class Photo extends Entity {
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
  link: string;

  @property({
    type: 'number',
    required: true,
  })
  instruction_id: number;

  constructor(data?: Partial<Photo>) {
    super(data);
  }
}

export interface PhotoRelations {
  // describe navigational properties here
}

export type PhotoWithRelations = Photo & PhotoRelations;
