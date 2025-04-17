import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateUserDto } from './dto/create-user.dto';

interface RequestWithUser {
  user: {
    id: number;
    username: string;
    email: string;
  };
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;
    const user = await this.usersService.create(username, email, password);
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
    };
  }
}
