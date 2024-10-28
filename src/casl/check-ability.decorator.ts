import { SetMetadata } from '@nestjs/common';
import { Subjects } from './casl-ability.factory';

export interface RequiredRule {
  action: string;
  subject: Subjects;
}

export const CHECK_ABILITY = 'check_ability';
export const CheckAbility = (...requirements: RequiredRule[]) =>
  SetMetadata(CHECK_ABILITY, requirements);
