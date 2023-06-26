
export interface AnalyticsData {
    totalSubmissions: number;
    views: number;
    conversionRate: number;
    countries: {
        name: string;
        count: number;
    }[];
    devices: {
        name: string;
        count: number;
    }[];
  }
  