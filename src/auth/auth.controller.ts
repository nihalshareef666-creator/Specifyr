import { Body, Controller, Post, Get, UseGuards, Request, Put, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard)
  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        return cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async uploadPhoto(@UploadedFile() file: any) {
    return {
      success: true,
      photoUrl: `/uploads/${file.filename}`
    };
  }

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: any) {
    return this.authService.login(body.email, body.password);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.email);
  }

  @UseGuards(AuthGuard)
  @Put('profile')
  async updateProfile(@Request() req: any, @Body() body: any) {
     // Implementation for updating profile details (name, phone, etc.)
     // For now, simplicity is kept for the auth flow
     return { success: true, message: 'Profile update endpoint ready' };
  }
}
