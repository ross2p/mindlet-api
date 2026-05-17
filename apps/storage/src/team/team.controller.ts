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
import { TeamService } from "./team.service";
import {
  TEAM_UPLOAD_MAX_BYTES,
  teamImageMulterOptions,
} from "./team-upload.constants";

const teamImageParseFilePipe = new ParseFilePipe({
  fileIsRequired: true,
  validators: [
    new MaxFileSizeValidator({ maxSize: TEAM_UPLOAD_MAX_BYTES }),
    new FileTypeValidator({
      fileType: /^(image\/(jpeg|png|gif|webp))$/i,
    }),
  ],
});

@ApiTags("Team Storage")
@ApiBearerAuth()
@Controller("team")
@UseGuards(AuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post("avatar")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file", teamImageMulterOptions))
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
  @ApiOperation({ summary: "Upload team avatar image" })
  @ApiResponse({
    status: 201,
    description: "Image uploaded successfully",
    type: UrlDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public uploadTeamAvatar(
    @UploadedFile(teamImageParseFilePipe) file: Express.Multer.File,
  ): Promise<UrlDto> {
    return this.teamService.uploadTeamAvatar(file);
  }

  @Post("banner")
  @HttpCode(201)
  @UseInterceptors(FileInterceptor("file", teamImageMulterOptions))
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
  @ApiOperation({ summary: "Upload team banner image" })
  @ApiResponse({
    status: 201,
    description: "Image uploaded successfully",
    type: UrlDto,
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  public uploadTeamBanner(
    @UploadedFile(teamImageParseFilePipe) file: Express.Multer.File,
  ): Promise<UrlDto> {
    return this.teamService.uploadTeamBanner(file);
  }
}
