import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Movie } from './movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  async findAll(
    userId: number,
    page: number = 1,
    limit: number = 10,
    search?: string,
    genre?: string,
    sortBy: string = 'id',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<{ movies: Movie[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { user: { id: userId } };

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    if (genre) {
      where.genre = genre;
    }

    const [movies, total] = await this.moviesRepository.findAndCount({
      where,
      order: { [sortBy]: order },
      skip,
      take: limit,
      relations: ['user'],
    });

    return { movies, total };
  }

  async findAllWithoutPagination(
    userId: number,
    search?: string,
    genre?: string,
    sortBy: string = 'id',
    order: 'ASC' | 'DESC' = 'ASC',
  ): Promise<Movie[]> {
    const where: Record<string, unknown> = { user: { id: userId } };

    if (search) {
      where.title = ILike(`%${search}%`);
    }

    if (genre) {
      where.genre = genre;
    }

    return this.moviesRepository.find({
      where,
      order: { [sortBy]: order },
      relations: ['user'],
    });
  }

  async findAllGenres(userId: number): Promise<string[]> {
    const movies = await this.moviesRepository.find({
      where: { user: { id: userId } },
      select: ['genre'],
    });

    const genres = movies
      .map((movie) => movie.genre)
      .filter((genre): genre is string => !!genre);

    return [...new Set(genres)].sort();
  }

  async findOne(id: number, userId: number): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!movie) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    if (movie.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this movie',
      );
    }

    return movie;
  }

  async create(createMovieDto: CreateMovieDto, userId: number): Promise<Movie> {
    const movie = this.moviesRepository.create({
      ...createMovieDto,
      user: { id: userId },
    });

    return this.moviesRepository.save(movie);
  }

  async update(
    id: number,
    updateMovieDto: UpdateMovieDto,
    userId: number,
  ): Promise<Movie> {
    const movie = await this.findOne(id, userId);
    const updated = this.moviesRepository.merge(movie, updateMovieDto);
    return this.moviesRepository.save(updated);
  }

  async remove(id: number, userId: number): Promise<void> {
    const movie = await this.findOne(id, userId);
    await this.moviesRepository.remove(movie);
  }
}
