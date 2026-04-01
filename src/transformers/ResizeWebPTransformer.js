const BaseTransformer = require('./BaseTransformer');

class ResizeWebPTransformer extends BaseTransformer {

  constructor(options = {}) {
    super(options);
    
    this.width = Number(options.width) || 800;
    this.height = Number(options.height) || 800;
    this.quality = Number(options.quality) || 80;
  }

  /**
   * 
   * @param {import('sharp').Sharp} sharpInstance 
   * @returns 
   */
  async transform(sharpInstance) {
    console.log(`Applying Resize (w: ${this.width}, h: ${this.height}) and Webp compression...`);
    
    return sharpInstance
      .resize({ 
        width: this.width, 
        height: this.height, 
        fit: 'cover', 
        withoutEnlargement: true })
      .webp({ quality: this.quality });
  }
}

module.exports = ResizeWebPTransformer;