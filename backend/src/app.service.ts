import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Did you seriously think you would find something here? This is the backend of the movie app, not the frontend. If you did everything according to the README.md file, you should be good to go. If you have any questions, please refer to the README.md file, you should probably go to: <a href="http://localhost:3001">http://localhost:3001</a> instead.';
  }
}
