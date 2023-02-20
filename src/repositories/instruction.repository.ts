import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory, BelongsToAccessor} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Instruction, InstructionRelations, Step, User} from '../models';
import {StepRepository} from './step.repository';
import {UserRepository} from './user.repository';

export class InstructionRepository extends DefaultCrudRepository<
  Instruction,
  typeof Instruction.prototype.id,
  InstructionRelations
> {

  public readonly steps: HasManyRepositoryFactory<Step, typeof Instruction.prototype.id>;

  public readonly user: BelongsToAccessor<User, typeof Instruction.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('StepRepository') protected stepRepositoryGetter: Getter<StepRepository>, @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
  ) {
    super(Instruction, dataSource);
    this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter,);
    this.steps = this.createHasManyRepositoryFactoryFor('steps', stepRepositoryGetter,);
  }
}
