import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  director: string;

  @Column({ nullable: true })
  releaseYear: number;

  @Column({ nullable: true })
  genre: string;

  @Column({ nullable: true })
  rating: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true })
  posterUrl: string;

  @ManyToOne(() => User, (user) => user.movies)
  user: User;
}
