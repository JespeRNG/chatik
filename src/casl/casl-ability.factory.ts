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
  createForUser(user: UserEntity) {
    const { can, build } = new AbilityBuilder<AppAbility>(
      PureAbility as AbilityClass<AppAbility>,
    );

    if (user.role === Roles.admin) {
      can(Action.Manage, 'all');
    }

    if (user.role === Roles.user) {
      can(Action.Read, GroupEntity);
      can(Action.Create, GroupEntity);
      can(Action.SendMessage, MessageEntity);
    }

    if (user.role === Roles.groupCreator) {
      can(Action.Create, GroupEntity);
      can(Action.Update, GroupEntity);
      can(Action.SendMessage, MessageEntity);
      can(Action.Update, GroupEntity, { creatorId: user.id });
      can(Action.Delete, GroupEntity, { 'group.creatorId': user.id });
      can(Action.Invite, GroupEntity, { 'group.creatorId': user.id });
    }

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
      conditionsMatcher: nullConditionsMatcher,
    });
  }
}
