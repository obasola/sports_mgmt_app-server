// src/presentation/controllers/PersonController.ts
import { Request, Response, NextFunction } from 'express';
import { PersonService } from '@/application/person/services/PersonService';
import { ApiResponse, PaginatedResponse } from '@/shared/types/common';
import { PersonResponseDto, PersonFiltersDto, PaginationDto, LoginResponseDto } from '@/application/person/dto/PersonDto';

export class PersonController {
  constructor(private readonly personService: PersonService) {}

  createPerson = async (
    req: Request,
    res: Response<ApiResponse<PersonResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const person = await this.personService.createPerson(req.body);
      res.status(201).json({
        success: true,
        data: person,
        message: 'Person created successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  getPersonById = async (
    req: Request,
    res: Response<ApiResponse<PersonResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pid = parseInt(req.params.pid);
      const person = await this.personService.getPersonById(pid);
      res.json({
        success: true,
        data: person,
      });
    } catch (error) {
      next(error);
    }
  };

  getPersonByUserName = async (
    req: Request,
    res: Response<ApiResponse<PersonResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userName = req.params.userName;
      const person = await this.personService.getPersonByUserName(userName);
      res.json({
        success: true,
        data: person,
      });
    } catch (error) {
      next(error);
    }
  };

  getPersonByEmailAddress = async (
    req: Request,
    res: Response<ApiResponse<PersonResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const emailAddress = req.params.emailAddress;
      const person = await this.personService.getPersonByEmailAddress(emailAddress);
      res.json({
        success: true,
        data: person,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPersons = async (
    req: Request,
    res: Response<{success:boolean, data: PersonResponseDto[], pagination: any}>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const filters: PersonFiltersDto = {
        userName: req.query.userName as string,
        emailAddress: req.query.emailAddress as string,
        firstName: req.query.firstName as string,
        lastName: req.query.lastName as string,
      };

      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const persons = await this.personService.getAllPersons(filters, pagination);
      res.json({
       success: true,
        data: persons.data,
        pagination: persons.pagination,
      });
    } catch (error) {
      next(error);
    }
  };

  searchPersonsByName = async (
    req: Request,
    res: Response<ApiResponse<PaginatedResponse<PersonResponseDto>>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const searchTerm = req.query.search as string;
      
      const pagination: PaginationDto = {
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const persons = await this.personService.searchPersonsByName(searchTerm, pagination);
      res.json({
        success: true,
        data: persons,
      });
    } catch (error) {
      next(error);
    }
  };

  updatePerson = async (
    req: Request,
    res: Response<ApiResponse<PersonResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pid = parseInt(req.params.pid);
      const person = await this.personService.updatePerson(pid, req.body);
      res.json({
        success: true,
        data: person,
        message: 'Person updated successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  deletePerson = async (
    req: Request,
    res: Response<ApiResponse>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pid = parseInt(req.params.pid);
      await this.personService.deletePerson(pid);
      res.status(204).json({
        success: true,
        message: 'Person deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  };

  checkPersonExists = async (
    req: Request,
    res: Response<ApiResponse<{ exists: boolean }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const pid = parseInt(req.params.pid);
      const exists = await this.personService.personExists(pid);
      res.json({
        success: true,
        data: { exists },
      });
    } catch (error) {
      next(error);
    }
  };

  checkUserNameExists = async (
    req: Request,
    res: Response<ApiResponse<{ exists: boolean }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userName = req.params.userName;
      const exists = await this.personService.personExistsByUserName(userName);
      res.json({
        success: true,
        data: { exists },
      });
    } catch (error) {
      next(error);
    }
  };

  checkEmailExists = async (
    req: Request,
    res: Response<ApiResponse<{ exists: boolean }>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const emailAddress = req.params.emailAddress;
      const exists = await this.personService.personExistsByEmailAddress(emailAddress);
      res.json({
        success: true,
        data: { exists },
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (
    req: Request,
    res: Response<ApiResponse<LoginResponseDto>>,
    next: NextFunction
  ): Promise<void> => {
    try {
      const result = await this.personService.login(req.body);
      res.json({
        success: true,
        data: result,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  };
}