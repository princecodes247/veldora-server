import { Request } from 'express';
export function extractDeviceInfo(req: Request): {
  ip: string;
  device: string;
  platform: string;
  host: string;
} {
  // Retrieve the device and country information from the request, for example:
  const device =
    req.header('User-Agent') || req.header('sec-ch-ua') || 'Unknown Device';
  const ip = req.header('true-client-ip') || 'Unknown IP';
  const host = req.header('host') || 'Unknown Host';
  const platform = parsePlatform(device);
  console.log({ header: req.headers });
  return { platform, ip, device, host };
}

export function parsePlatform(userAgent: string): string {
  let platform = 'Unknown Platform';

  if (userAgent.includes('Windows')) {
    platform = 'Windows';
  } else if (userAgent.includes('Macintosh')) {
    platform = 'Macintosh';
  } else if (userAgent.includes('Linux')) {
    platform = 'Linux';
  } else if (userAgent.includes('Android')) {
    platform = 'Android';
  } else if (userAgent.includes('iOS')) {
    platform = 'iOS';
  }

  return platform;
}
