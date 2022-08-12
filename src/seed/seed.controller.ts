import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators';
import { EValidRoles } from 'src/auth/interfaces';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Get()
  // @Auth(EValidRoles.admin)
  executeSeed() {
    return this.seedService.runSeed();
  }
}
