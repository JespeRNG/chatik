import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { CaslAbilityFactory } from './casl-ability.factory';

@Module({
  imports: [UserModule],
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
