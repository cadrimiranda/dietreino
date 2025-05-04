import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { XlsxService } from './xlsx.service';
import { SheetExercises } from './dto/sheet.type';
import { FileUpload, GraphQLUpload } from 'graphql-upload-minimal';

@Resolver()
export class XlsxResolver {
  constructor(private readonly xlsxService: XlsxService) {}

  @Mutation(() => [SheetExercises])
  async extractWorkoutSheet(
    @Args({ name: 'file', type: () => GraphQLUpload })
    upload: FileUpload,
  ): Promise<SheetExercises[]> {
    return this.xlsxService.extractWorkoutSheet(upload);
  }
}
