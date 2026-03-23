import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class RecommendDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true }) // each item must be string
  products: string[];
}