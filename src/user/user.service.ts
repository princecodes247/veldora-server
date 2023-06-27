import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { catchError, firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';
import { PassageService } from 'src/passage/passage.service';

@Injectable()
export class UserService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
    private passageService: PassageService,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashPassword;
    const createdUser = new this.userModel(createUserDto);
    return await createdUser.save();
  }

  async findAll(
    pagination: PaginationDto,
  ): Promise<{ data: UserDocument[]; total: number }> {
    const { page, limit = 1 } = pagination;
    const skip = page ? (page - 1) * limit : 0;
    const total = await this.userModel.countDocuments();
    const users = await this.userModel.find().skip(skip).limit(limit);
    return { data: users, total };
  }

  async findOne(id: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user.toObject();
    } catch (err) {
      throw new Error('User not found');
    }
  }

  async findOneByUsername(username: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ username });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async findOneByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async isEmailOrUsernameTaken(
    email: string,
    username: string,
  ): Promise<string | null> {
    // const userExists = await this.userModel.exists({
    //   $or: [{ email }, { username }],
    // });

    const existingUser = await this.userModel.findOne(
      {
        $or: [{ email }, { username }],
      },
      { _id: 0, email: 1, username: 1 },
    );
    console.log({ existingUser });
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

  async update(id: string, updateUserDto: UpdateUserDto) {
    let data = await this.passageService.update(id, updateUserDto);
    console.log({ data });
    return data;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
