import { Reflector } from '@nestjs/core';
import { ForbiddenError } from '@casl/ability';
import { CaslAbilityFactory } from './casl-ability.factory';
import { CHECK_ABILITY, RequiredRule } from './check-ability.decorator';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class CaslAbilityGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRules =
      this.reflector.get<RequiredRule[]>(CHECK_ABILITY, context.getHandler()) ||
      [];
    const { user } = context.switchToHttp().getRequest();
    const ability = this.caslAbilityFactory.createForUser(user);

    requiredRules.forEach((rule) => {
      ForbiddenError.from(ability).throwUnlessCan(rule.action, rule.subject);
    });

    return true;
  }
}
