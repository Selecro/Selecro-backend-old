const sharp = require('sharp');
const uuidv4 = require('uuid/v4');
const path = require('path');

export class ImageResizeProvider {
  private folder: object;
  constructor(folder: object) {
    this.folder = folder;
  }
  async save(buffer: object) {
    const filename = ImageResizeProvider.filename();
    const filepath = this.filepath(filename);
    await sharp(buffer)
      .resize(300, 300, {
        fit: sharp.fit.inside,
        withoutEnlargement: true,
      })
      .toFile("pro.png");

    return filename;
  }
  static filename() {
    return `xd.png`;
  }
  filepath(filename: String) {
    return path.resolve(`${this.folder}/${filename}`);
  }
}
