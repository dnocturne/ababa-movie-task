import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Put,
  ParseIntPipe,
  BadRequestException,
  HttpStatus,
  HttpCode,
  NotFoundException,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

// Define a type for the request with user property
interface RequestWithUser extends Request {
  user: { id: number; username: string; email: string; [key: string]: any };
}

// Define error types
interface DatabaseError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
}

@Controller('movies')
@UseGuards(JwtAuthGuard)
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User is not authenticated');
      }

      return await this.moviesService.create(createMovieDto, req.user.id);
    } catch (error) {
      const err = error as DatabaseError;
      const errorMsg = err.message || 'Unknown error';

      if (
        errorMsg.includes('duplicate') ||
        errorMsg.includes('already exists')
      ) {
        throw new BadRequestException('A movie with this title already exists');
      }
      throw new InternalServerErrorException(
        `Failed to create movie: ${errorMsg}`,
      );
    }
  }

  @Get()
  async findAll(
    @Req() req: RequestWithUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('genre') genre?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: 'ASC' | 'DESC',
    @Query('getAllMovies') getAllMovies?: string,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User is not authenticated');
      }

      // Check if request is for all movies without pagination
      if (getAllMovies === 'true') {
        return await this.moviesService.findAllWithoutPagination(
          req.user.id,
          search,
          genre,
          sortBy,
          order,
        );
      }

      // Validate pagination parameters
      const pageNum = page ? parseInt(page, 10) : 1;
      const limitNum = limit ? parseInt(limit, 10) : 10;

      if (isNaN(pageNum) || pageNum < 1) {
        throw new BadRequestException('Page number must be a positive integer');
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new BadRequestException('Limit must be between 1 and 100');
      }

      // Validate sort parameters if provided
      const validSortFields = [
        'id',
        'title',
        'director',
        'releaseYear',
        'rating',
        'createdAt',
      ];
      if (sortBy && !validSortFields.includes(sortBy)) {
        throw new BadRequestException(
          `Sort field must be one of: ${validSortFields.join(', ')}`,
        );
      }

      return await this.moviesService.findAll(
        req.user.id,
        pageNum,
        limitNum,
        search,
        genre,
        sortBy,
        order,
      );
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      const err = error as Error;
      throw new BadRequestException(`Failed to get movies: ${err.message}`);
    }
  }

  @Get('genres')
  async getAllGenres(@Req() req: RequestWithUser) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User is not authenticated');
      }

      return await this.moviesService.findAllGenres(req.user.id);
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      const err = error as Error;
      throw new BadRequestException(`Failed to get genres: ${err.message}`);
    }
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User is not authenticated');
      }

      return await this.moviesService.findOne(id, req.user.id);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      const err = error as Error;
      if (err.name === 'NotFoundException') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to find movie: ${err.message}`,
      );
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto,
    @Req() req: RequestWithUser,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User is not authenticated');
      }

      return await this.moviesService.update(id, updateMovieDto, req.user.id);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const err = error as Error;
      const errorMsg = err.message || '';

      if (
        errorMsg.includes('duplicate') ||
        errorMsg.includes('already exists')
      ) {
        throw new BadRequestException('A movie with this title already exists');
      }
      if (err.name === 'NotFoundException') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to update movie: ${errorMsg}`,
      );
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: RequestWithUser,
  ) {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException('User is not authenticated');
      }

      await this.moviesService.remove(id, req.user.id);
      return { message: 'Movie deleted successfully' };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      const err = error as Error;
      if (err.name === 'NotFoundException') {
        throw new NotFoundException(`Movie with ID ${id} not found`);
      }
      throw new InternalServerErrorException(
        `Failed to delete movie: ${err.message}`,
      );
    }
  }
}
