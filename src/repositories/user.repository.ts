import {Getter, inject, injectable} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Group, User, UserGroup, UserRelations} from '../models';
import {GroupRepository} from './group.repository';
import {UserGroupRepository} from './user-group.repository';

export type Credentials = {
  email: string;
  passwordHash: string;
}

@injectable()
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly groups: HasManyThroughRepositoryFactory<
  Group,
  typeof Group.prototype.id,
  UserGroup,
  typeof User.prototype.id
>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('GroupRepository')
    groupRepositoryGetter: Getter<GroupRepository>,
    @repository.getter('UserGroupRepository')
    userGroupRepositoryGetter: Getter<UserGroupRepository>,
  ) {
    super(User, dataSource);
    this.groups = this.createHasManyThroughRepositoryFactoryFor(
      'groups',
      groupRepositoryGetter,
      userGroupRepositoryGetter,
    );
  }
}
