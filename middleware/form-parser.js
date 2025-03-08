// Middleware to parse form data for server-side handler
import formidable from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function parseForm(req, res, next) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      req.body = fields;
      resolve();
    });
  });
} 