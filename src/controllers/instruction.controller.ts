import {authenticate} from '@loopback/authentication';
import {JWTService, TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {
  Count, Filter,
  FilterExcludingWhere,
  repository,
  Where
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param, patch, post, put, requestBody,
  response
} from '@loopback/rest';
import {Instruction} from '../models';
import {InstructionRepository} from '../repositories';

export class InstructionController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: JWTService,
    @repository(InstructionRepository) public instructionRepository: InstructionRepository,
  ) { }

  @authenticate('jwt')
  @post('/instructions')
  @response(200, {
    description: 'Instruction model instance',
    content: {'application/json': {schema: getModelSchemaRef(Instruction)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instruction, {
            title: 'NewInstruction',
            exclude: ['id'],
          }),
        },
      },
    })
    instruction: Omit<Instruction, 'id'>,
  ): Promise<Instruction> {
    return this.instructionRepository.create(instruction);
  }

  @get('/instructions/count')
  @response(200, {
    description: 'Instruction model count',
  })
  async count(
    @param.where(Instruction) where?: Where<Instruction>,
  ): Promise<Count> {
    return this.instructionRepository.count(where);
  }

  @get('/instructions')
  @response(200, {
    description: 'Array of Instruction model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Instruction, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Instruction) filter?: Filter<Instruction>,
  ): Promise<Instruction[]> {
    return this.instructionRepository.find();
  }

  @authenticate('jwt')
  @get('/instructions/{id}')
  @response(200, {
    description: 'Instruction model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Instruction, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Instruction, {exclude: 'where'}) filter?: FilterExcludingWhere<Instruction>
  ): Promise<Instruction> {
    return this.instructionRepository.findById(id, filter);
  }

  @authenticate('jwt')
  @patch('/instructions/{id}')
  @response(204, {
    description: 'Instruction PATCH success',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Instruction, {partial: true}),
        },
      },
    })
    instruction: Instruction,
  ): Promise<void> {
    await this.instructionRepository.updateById(id, instruction);
  }

  @authenticate('jwt')
  @put('/instructions/{id}')
  @response(204, {
    description: 'Instruction PUT success',
  })
  async replaceById(
    @param.path.number('id') id: number,
    @requestBody() instruction: Instruction,
  ): Promise<void> {
    await this.instructionRepository.replaceById(id, instruction);
  }

  @authenticate('jwt')
  @del('/instructions/{id}')
  @response(204, {
    description: 'Instruction DELETE success',
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.instructionRepository.deleteById(id);
  }
}
