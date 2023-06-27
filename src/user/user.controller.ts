import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from './dto/pagination.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { GetUserDto } from './dto/get-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.userService.findAll(pagination);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async findUserProfile(@Request() req): Promise<GetUserDto> {
    try {
      console.log({ requser: req.user });
      const user = req.user;
      if (!user) {
        throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      throw new HttpException('Could not find user', HttpStatus.NOT_FOUND);
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('me')
  @UseGuards(AuthGuard)
  async update(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(req.user.userID, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
