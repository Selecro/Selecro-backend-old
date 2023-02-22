import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Group, Instruction, User, UserRelations} from '../models';
import {GroupRepository} from './group.repository';
import {InstructionRepository} from './instruction.repository';

export type Credentials = {
  email: string;
  passwdhash: string;
}

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly instructions: HasManyRepositoryFactory<Instruction, typeof User.prototype.id>;

  public readonly group: BelongsToAccessor<Group, typeof User.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource, @repository.getter('InstructionRepository') protected instructionRepositoryGetter: Getter<InstructionRepository>, @repository.getter('GroupRepository') protected groupRepositoryGetter: Getter<GroupRepository>,
  ) {
    super(User, dataSource);
    this.group = this.createBelongsToAccessorFor('group', groupRepositoryGetter,);
    this.instructions = this.createHasManyRepositoryFactoryFor('instructions', instructionRepositoryGetter,);
  }
}
