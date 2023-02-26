import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Instruction, InstructionRelations, Step, User} from '../models';
import {StepRepository} from './step.repository';

export class InstructionRepository extends DefaultCrudRepository<
  Instruction,
  typeof Instruction.prototype.id,
  InstructionRelations
> {

  public readonly steps: HasManyRepositoryFactory<
  Step,
  typeof Step.prototype.id
>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('StepRepository')
    stepRepositoryGetter: Getter<StepRepository>,
  ) {
    super(Instruction, dataSource);
    this.steps = this.createHasManyRepositoryFactoryFor(
      'steps',
      stepRepositoryGetter,
    );
  }
}
