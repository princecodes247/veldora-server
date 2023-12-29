import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import UserModel, { IUser } from './models/user.model';
import { BucketService } from '../bucket';
import { UserService } from '../user';
import { SubmissionService } from '../submission';

class AdminService {
  async getStats() {
    const data = Promise.all([
      UserService.countUsers(),
      BucketService.countBuckets(),
      SubmissionService.countSubmissions(),
    ]);
    return { users: data[0], buckets: data[1], submissions: data[2] };
  }
}

export default new AdminService();
