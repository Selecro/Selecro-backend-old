import {Getter, inject, injectable} from '@loopback/core';
import {
  DefaultCrudRepository,
  HasManyThroughRepositoryFactory,
  repository,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Group, User, UserGroup, UserLink, UserRelations} from '../models';
import {GroupRepository} from './group.repository';
import {UserGroupRepository} from './user-group.repository';
import {UserLinkRepository} from './user-link.repository';

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

  public readonly users: HasManyThroughRepositoryFactory<
    User,
    typeof User.prototype.id,
    UserLink,
    typeof User.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('GroupRepository')
    groupRepositoryGetter: Getter<GroupRepository>,
    @repository.getter('UserGroupRepository')
    userGroupRepositoryGetter: Getter<UserGroupRepository>,
    @repository.getter('UserLinkRepository')
    userLinkRepositoryGetter: Getter<UserLinkRepository>,
  ) {
    super(User, dataSource);
    this.groups = this.createHasManyThroughRepositoryFactoryFor(
      'groups',
      groupRepositoryGetter,
      userGroupRepositoryGetter,
    );
    this.users = this.createHasManyThroughRepositoryFactoryFor(
      'users',
      Getter.fromValue(this),
      userLinkRepositoryGetter,
    );
  }
}
