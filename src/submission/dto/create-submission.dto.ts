export class CreateSubmissionDto {
  bucket: string;
  data: any;
  meta?: {
    country: string;
    countryCode: string;
    isp: string;
    ip: string;
    device: string;
    platform: string;
  };
}
