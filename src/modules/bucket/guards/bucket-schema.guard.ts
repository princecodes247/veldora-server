import { Request, Response, NextFunction } from 'express';
import BucketService from '../bucket.service';
import { RequestWithBucket } from '../bucket.type';
import { StatusCodes } from 'http-status-codes';

const checkBucketSchema = () => {
  return async (req: RequestWithBucket, res: Response, next: NextFunction) => {
    try {
      // const bucketID = req.params.id;
      // const bucket = await BucketService.findOne(bucketID);
      const bucket = req.bucket;

      if (!bucket) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const body = req.body;
      console.log('HIITTT');
      const schema = bucket.structure;
      if (schema.length !== 0) {
        const bodyKeys = Object.keys(body);
        const schemaKeys = schema.map((field) => field.name);
        const schemaRequiredKeys = schema
          .filter((field) => field.required)
          .map((field) => field.name);

        const missingRequiredKeys = schemaRequiredKeys.filter(
          (key) => !bodyKeys.includes(key),
        );

        if (missingRequiredKeys.length > 0) {
          res.status(StatusCodes.BAD_REQUEST).json({
            message: `Missing required fields: ${missingRequiredKeys.join(
              ', ',
            )}`,
          });
          return;
        }

        const extraKeys = bodyKeys.filter((key) => !schemaKeys.includes(key));
        if (extraKeys.length > 0) {
          extraKeys.forEach((key) => delete body[key]);
        }

        if (Object.values(body).length === 0) {
          res.status(401).json({
            message: `No valid fields: ${schemaKeys.join(', ')}`,
          });
          return;
        }
      }
      next();
    } catch {
      res.status(401).json({ message: 'Unauthorized' });
    }
  };
};

export default checkBucketSchema;
