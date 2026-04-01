const BaseTransformer = require('./BaseTransformer');

class GrayscaleTransformer extends BaseTransformer {

  /**
   * 
   * @param {import('sharp').Sharp} sharpInstance 
   * @returns 
   */
  async transform(sharpInstance) {
    console.log('Applying Grayscale filter...');
    return sharpInstance.grayscale().jpeg(); 
  }
}

module.exports = GrayscaleTransformer;