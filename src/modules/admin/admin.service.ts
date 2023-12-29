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
