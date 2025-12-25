// src/presentation/controllers/AuthController.ts
import { Request, Response } from "express";
import {
  verifyEmailUseCase,
  loginUseCase,
  refreshTokenUseCase,
  logoutUseCase,
  forgotPasswordUseCase,
  resetPasswordUseCase,
} from "@/infrastructure/dependencies";
import { RegisterInputDTO } from "@/application/auth/register/RegisterDTO";
import { RegisterUseCase } from '@/application/auth/register/RegisterUseCase';
import { LoginUseCase } from "@/application/auth/login/LoginUseCase";

export class AuthController {
  
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { userName, password } = req.body as { userName: string; password: string };

      const result = await this.loginUseCase.execute({ userName, password });

      //res.status(200).json(result);
      // right now LoginResponseDTO = { accessToken, personId, userName }
      // Your frontend only cares about accessToken.
      res.status(200).json({
        accessToken: result.accessToken,
        personId: result.personId,
        userName: result.userName,
      });
    } catch (err) {
      console.error('[login] error:', err);
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    console.log('REGISTER body:', req.body);

    try {
      const input = req.body as RegisterInputDTO;

      // optional basic validation
      if (!input.userName || !input.emailAddress || !input.password) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const result = await this.registerUseCase.execute(input);
      res.status(201).json(result);
    } catch (err: unknown) {
      const e = err as Error;
      console.error('REGISTER error:', e);
      res.status(400).json({ error: e.message });
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      await verifyEmailUseCase.execute(token);
      res.json({ message: "Email verified successfully" });
    } catch (err: unknown) {
      const e = err as Error;
      res.status(400).json({ error: e.message });
    }
  }

  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const refreshToken = req.cookies.refreshToken;
      const personId = Number(req.body.personId);

      if (!refreshToken) {
        res.status(400).json({ error: "Missing refresh token" });
        return;
      }

      const result = await refreshTokenUseCase.execute(refreshToken, personId);

      // Rotate cookie
      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      res.json({ accessToken: result.accessToken });
    } catch (err: unknown) {
      const e = err as Error;
      res.status(400).json({ error: e.message });
    }
  }



async logout(req: Request, res: Response): Promise<void> {
  const body = req.body as { refreshToken?: string } | undefined;
  const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.refreshToken;

  // Support both body and cookie-based refresh token (optional)


  // If there’s nothing to revoke, don’t throw. Just succeed.
  if (!refreshToken) {
    res.status(204).send();
    return;
  }

  // TODO: revoke token in DB/allowlist/denylist (your implementation)
  // await authService.revokeRefreshToken(refreshToken)

  res.status(204).send();
}

  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      await forgotPasswordUseCase.execute(email);
      res.json({ message: "If a user exists with that email, a link was sent." });
    } catch (err: unknown) {
      const e = err as Error;
      res.status(400).json({ error: e.message });
    }
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      await resetPasswordUseCase.execute(token, newPassword);
      res.json({ message: "Password updated" });
    } catch (err: unknown) {
      const e = err as Error;
      res.status(400).json({ error: e.message });
    }
  }
}
