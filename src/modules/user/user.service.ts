import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import UserModel, { IUser } from './models/user.model';

class UserService {
  async create(createUserDto: CreateUserDto): Promise<IUser> {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashPassword;
    const createdUser = new UserModel(createUserDto);
    return await createdUser.save();
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ data: IUser[]; total: number }> {
    const { page, limit = 1 } = pagination;
    const skip = page ? (page - 1) * limit : 0;
    const total = await UserModel.countDocuments();
    const users = await UserModel.find().skip(skip).limit(limit);
    return { data: users, total };
  }

  async findOne(id: string): Promise<IUser | null> {
    try {
      return await UserModel.findById(id).exec();
    } catch (err) {
      return null;
    }
  }

  async findOneByUsername(username: string): Promise<IUser | null> {
    return await UserModel.findOne({ username }).exec();
  }

  async findOneByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email }).exec();
  }

  async isEmailOrUsernameTaken(
    email: string,
    username: string,
  ): Promise<string | null> {
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { username }],
    }).select({ _id: 0, email: 1, username: 1 });

    if (existingUser) {
      if (existingUser.email === email) {
        return 'Email already exists';
      }
      if (existingUser.username === username) {
        return 'Username is already taken';
      }
    }

    return null;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<IUser | null> {
    // You should implement your update logic here based on your requirements.
    // You may want to use UserModel.findByIdAndUpdate() or similar methods.
    // let data = await this.passageService.update(id, updateUserDto);

    return null;
  }

  async remove(id: string): Promise<void> {
    // You should implement your remove logic here based on your requirements.
  }
}

export default new UserService();
