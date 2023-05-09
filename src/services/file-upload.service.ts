import {ImageResizeProvider} from './resize';
const path = require('path');
export class ImageUploadProvider {
  constructor() { }
  async uploadImage(req: any) {
    console.log(req);
    const promise = new Promise(async (resolve, reject) => {
      try {
        let imagePath = path.join(__dirname, '/public/images');
        let fileUpload = new ImageResizeProvider(imagePath);
        if (!req) {
          return resolve({error: 'Please provide an image'});
        }
        const filename = await fileUpload.save(req);
        return resolve({name: filename});
      } catch (error) {
        return reject(error);
      }
    });
  }
}
