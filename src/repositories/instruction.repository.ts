import {Getter, inject} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Instruction, InstructionRelations, Step} from '../models';
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
