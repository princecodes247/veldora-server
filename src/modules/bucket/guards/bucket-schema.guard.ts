import { Request, Response, NextFunction } from 'express';
import BucketService from '../bucket.service';

const bucketSchemaGuardMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bucketID = req.params.id;
      const bucket = await BucketService.findOne(bucketID);

      if (!bucket) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const body = req.body;
      const schema = bucket.structure;
      const bodyKeys = Object.keys(body);
      const schemaKeys = schema.map((field) => field.name);
      const schemaRequiredKeys = schema
        .filter((field) => field.required)
        .map((field) => field.name);

      const missingRequiredKeys = schemaRequiredKeys.filter(
        (key) => !bodyKeys.includes(key),
      );

      if (missingRequiredKeys.length > 0) {
        res.status(401).json({
          message: `Missing required fields: ${missingRequiredKeys.join(', ')}`,
        });
        return;
      }

      const extraKeys = bodyKeys.filter((key) => !schemaKeys.includes(key));
      if (extraKeys.length > 0) {
        extraKeys.forEach((key) => delete body[key]);
      }

      req['bucket'] = bucket;
      next();
    } catch {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

export default bucketSchemaGuardMiddleware;
