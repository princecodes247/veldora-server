export interface AnalyticsData {
  totalSubmissions: number;

  conversionRate: number;
  countries: {
    name: string;
    count: number;
  }[];
  devices: {
    name: string;
    count: number;
  }[];
  views: {
    country: string;
    device: string;
    countryCode: string;
    isp: string;
    ip: string;
    platform: string;
  }[];
}
