import {
  PureAbility,
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
  InferSubjects,
} from '@casl/ability';
import { Roles } from '@prisma/client';
import { Action } from './actions.enum';
import { Injectable } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { UserEntity } from 'src/user/entities/user.entity';
import { GroupEntity } from 'src/group/entities/group.entity';
import { MessageEntity } from 'src/group/message/entities/message.entity';

export type Subjects =
  | InferSubjects<typeof GroupEntity | typeof UserEntity | typeof MessageEntity>
  | 'all';
export type AppAbility = PureAbility<[string, Subjects]>;
export const nullConditionsMatcher = () => (): boolean => true;

@Injectable()
export class CaslAbilityFactory {
  constructor(private readonly userService: UserService) {}

  async createForUser(user: UserEntity) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    const userRole = await this.userService.getRole(user['sub']);

    if (userRole === Roles.admin) {
      can(Action.Manage, 'all');
    }

    if (userRole === Roles.user) {
      can(Action.Read, GroupEntity);
      can(Action.Create, GroupEntity);
      can(Action.SendMessage, MessageEntity);
    }

    if (userRole === Roles.groupCreator) {
      can(Action.Read, GroupEntity);
      can(Action.Create, GroupEntity);
      can(Action.Update, GroupEntity);
      can(Action.SendMessage, MessageEntity);
      can(Action.Update, GroupEntity, { creatorId: user.id });
      can(Action.Delete, GroupEntity, { creatorId: user.id });
      can(Action.Invite, GroupEntity, { creatorId: user.id });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
      conditionsMatcher: nullConditionsMatcher,
    });
  }
}
