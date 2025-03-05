// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';  //este es para que salga en la documentacion de swagger y tambien tiene su funcionalidad original de hacer opcionales los campos
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
