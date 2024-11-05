import { Controller } from '@nestjs/common'
import { JobService } from './job.service'
import { ResponseUtil } from '../common/utils/response.util'

@Controller('job')
export class JobController {
  constructor(
    private readonly jobService: JobService,
    private readonly responseUtil: ResponseUtil,
  ) {}
}
