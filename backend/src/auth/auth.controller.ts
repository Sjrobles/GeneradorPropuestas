import {
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password-recovery.dto'
import { PasswordRecoveryService } from './password-recovery.service'
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import { AuthService } from './auth.service'
import type { AuthenticatedUser } from './auth.types'
import { CurrentUser } from './current-user.decorator'
import { LoginDto } from './dto/login.dto'
import { GoogleLoginDto } from './dto/google-login.dto'
import { RegisterDto } from './dto/register.dto'
import { JwtAuthGuard } from './jwt-auth.guard'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly recovery: PasswordRecoveryService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Crear una cuenta y abrir sesión' })
  @ApiCreatedResponse({ description: 'Cuenta creada' })
  @ApiConflictResponse({ description: 'Correo ya registrado' })
  register(@Body() input: RegisterDto) {
    return this.authService.register(input)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiOkResponse({ description: 'Sesión iniciada' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  login(@Body() input: LoginDto) {
    return this.authService.login(input)
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con Google' })
  @ApiOkResponse({ description: 'Sesión iniciada con Google' })
  @ApiUnauthorizedResponse({ description: 'Token de Google inválido' })
  loginWithGoogle(@Body() input: GoogleLoginDto) {
    return this.authService.loginWithGoogle(input)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Solicitar un enlace de recuperación por correo' })
  forgotPassword(@Body() input: ForgotPasswordDto) {
    return this.recovery.request(input.email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restablecer la contraseña con un enlace de un solo uso',
  })
  resetPassword(@Body() input: ResetPasswordDto) {
    return this.recovery.reset(input.token, input.password)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar el usuario autenticado' })
  @ApiOkResponse({ description: 'Usuario autenticado' })
  me(@CurrentUser() user: AuthenticatedUser) {
    return user
  }
}
