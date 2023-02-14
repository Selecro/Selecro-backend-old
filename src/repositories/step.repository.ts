import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Step, StepRelations, Instruction} from '../models';
import {InstructionRepository} from './instruction.repository';

export class StepRepository extends DefaultCrudRepository<
  Step,
  typeof Step.prototype.id,
  StepRelations
> {

  public readonly instruction: BelongsToAccessor<Instruction, typeof Step.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('InstructionRepository') protected instructionRepositoryGetter: Getter<InstructionRepository>,
  ) {
    super(Step, dataSource);
    this.instruction = this.createBelongsToAccessorFor('instruction', instructionRepositoryGetter,);
  }
}
