import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import UserModel, { IUser } from './models/user.model';

class UserService {
  async create(createUserDto: CreateUserDto): Promise<IUser> {
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

  async countUsers(): Promise<number> {
    try {
      const total = await UserModel.countDocuments();
      return total;
    } catch (error) {
      return -1;
    }
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
    delete updateUserDto.password;
    return await UserModel.findByIdAndUpdate(id, updateUserDto, {
      new: true,
    });
  }

  async remove(id: string): Promise<void> {
    // You should implement your remove logic here based on your requirements.
  }

  async changePassword(id: string, newPassword: string) {
    console.log({ id, newPassword });
    const user = await UserModel.findById(id);
    console.log({ user });
    if (!user) {
      console.log('{user}');
      return;
    }
    user.password = newPassword;
    const { password, ...updatedUser } = (await user.save()).toObject();
    console.log({ password, updatedUser });
    return updatedUser;
  }
}

export default new UserService();
