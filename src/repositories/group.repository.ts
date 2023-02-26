import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Group, GroupRelations, User} from '../models';

export class GroupRepository extends DefaultCrudRepository<
  Group,
  typeof Group.prototype.id,
  GroupRelations
> {

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
  ) {
    super(Group, dataSource);
  }
}
