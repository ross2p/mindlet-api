import {
  Controller,
  FileTypeValidator,
  HttpCode,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AuthGuard } from "@ross2p/common";
import { UrlDto } from "@ross2p/types";
import { UserService } from "./user.service";
import {
  USER_UPLOAD_MAX_BYTES,
  userImageMulterOptions,
} from "./user-upload.constants";

const userImageParseFilePipe = new ParseFilePipe({
  fileIsRequired: true,
  validators: [
    new MaxFileSizeValidator({ maxSize: USER_UPLOAD_MAX_BYTES }),
    new FileTypeValidator({
      fileType: /^(image\/(jpeg|png|gif|webp))$/i,
    }),
  ],
});

@ApiTags("User Storage")
@ApiBearerAuth()
@Controller()
@UseGuards(AuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("avatar")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file", userImageMulterOptions))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
      required: ["file"],
    },
  })
  @ApiOperation({ summary: "Upload user avatar image" })
  @ApiResponse({
    status: 201,
    description: "Image uploaded successfully",
    type: UrlDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public uploadUserAvatar(
    @UploadedFile(userImageParseFilePipe) file: Express.Multer.File,
  ): Promise<UrlDto> {
    return this.userService.uploadUserAvatar(file);
  }

  @Post("banner")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file", userImageMulterOptions))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: { type: "string", format: "binary" },
      },
      required: ["file"],
    },
  })
  @ApiOperation({ summary: "Upload user profile banner image" })
  @ApiResponse({
    status: 201,
    description: "Image uploaded successfully",
    type: UrlDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public uploadUserBanner(
    @UploadedFile(userImageParseFilePipe) file: Express.Multer.File,
  ): Promise<UrlDto> {
    return this.userService.uploadUserBanner(file);
  }
}
