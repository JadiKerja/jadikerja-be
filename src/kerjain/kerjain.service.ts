import { Injectable } from '@nestjs/common'
import { CreateKerjainDto } from './dto/create-kerjain.dto'
import { UpdateKerjainDto } from './dto/update-kerjain.dto'

@Injectable()
export class KerjainService {
  create(createKerjainDto: CreateKerjainDto) {
    return 'This action adds a new kerjain'
  }

  findAll() {
    return `This action returns all kerjain`
  }

  findOne(id: number) {
    return `This action returns a #${id} kerjain`
  }

  update(id: number, updateKerjainDto: UpdateKerjainDto) {
    return `This action updates a #${id} kerjain`
  }

  remove(id: number) {
    return `This action removes a #${id} kerjain`
  }
}
