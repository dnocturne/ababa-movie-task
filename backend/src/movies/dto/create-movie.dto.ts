import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateMovieDto {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  @MaxLength(255, { message: 'Title must be 255 characters or less' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'Director name must be 100 characters or less' })
  director?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Release year must be a number' })
  @Min(1880, { message: 'Release year must be at least 1880' })
  @Max(new Date().getFullYear() + 5, {
    message: `Release year cannot be more than ${new Date().getFullYear() + 5}`,
  })
  @Transform(({ value }): number | undefined => {
    if (value === '') return undefined;
    return typeof value === 'string' ? parseInt(value, 10) : value;
  })
  releaseYear?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50, { message: 'Genre must be 50 characters or less' })
  genre?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Rating must be a number' })
  @Min(0, { message: 'Rating must be at least 0' })
  @Max(10, { message: 'Rating cannot be more than 10' })
  @Transform(({ value }): number | undefined => {
    if (value === '') return undefined;
    return typeof value === 'string' ? parseFloat(value) : value;
  })
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Description must be 2000 characters or less' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Poster URL must be a valid URL' })
  @MaxLength(500, { message: 'Poster URL must be 500 characters or less' })
  posterUrl?: string;
}
