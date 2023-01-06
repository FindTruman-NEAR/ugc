import { Module } from '@nestjs/common';
import { StoryModule } from 'src/story/story.module';
import { ChainService } from './chain.service';
import { NearModule } from './near/near.module';

@Module({
  imports: [StoryModule, NearModule],
  providers: [ChainService],
  exports: [ChainService],
})
export class ChainModule {}
