// src/presentation/controllers/auth/RegisterController.ts
import { Request, Response } from "express";
import { RegisterUseCase } from "@/application/auth/register/RegisterUseCase";

export class RegisterController {
  constructor(private registerUseCase: RegisterUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const result = await this.registerUseCase.execute(req.body);
      res.json(result);                     // ✅ Correct: res is Response
    } catch (err: any) {
      res.status(400).json({ error: err.message });   // ✅ Correct
    }
  }
}
