import {Getter, inject} from '@loopback/core';
import {DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Group, User, UserGroup, UserRelations} from '../models';
import {GroupRepository} from './group.repository';
import {UserGroupRepository} from './user-group.repository';

export type Credentials = {
  email: string;
  password: string;
}

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
    GroupRepositoryGetter: Getter<GroupRepository>,
    @repository.getter('UserGroupRepository')
    UserGroupRepositoryGetterGetter: Getter<UserGroupRepository>,
  ) {
    super(User, dataSource);
    this.groups = this.createHasManyThroughRepositoryFactoryFor(
      'groups',
      GroupRepositoryGetter,
      UserGroupRepositoryGetterGetter,
    );
  }
}
