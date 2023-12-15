import { ExceptionFilter, ArgumentsHost, BadRequestException } from '@nestjs/common';
import { ValidationError } from 'class-validator';
export declare class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost): void;
    formatValidationErrors(errors: ValidationError[]): any;
}
