import {Entity, model, property} from '@loopback/repository';

@model({
  name: 'users_instructions',
})
export class UserInstruction extends Entity {
  @property({
    type: 'number',
    required: false,
    postgresql: {
      columnName: 'group_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'YES',
    },
  })
  group_id: number;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      columnName: 'instruction_id',
      dataType: 'integer',
      dataLength: null,
      dataPrecision: null,
      dataScale: 0,
      nullable: 'YES',
    },
  })
  instruction_id: number;

  constructor(data?: Partial<UserInstruction>) {
    super(data);
  }
}

export interface UserInstructionRelations {
  // describe navigational properties here
}

export type UserInstructionWithRelations = UserInstruction & UserInstructionRelations;
