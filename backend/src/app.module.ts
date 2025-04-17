import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',  // Change (unless self-hosted)
      port: 5432, // Default port
      username: 'postgres', // Change to your own.
      password: 'postgres', // Change to your own.
      database: 'movie_list', // Change to your own.
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true, // Only use in development!
    }),
    UsersModule,
    AuthModule,
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
