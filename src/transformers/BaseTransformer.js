class BaseTransformer {
  constructor(options = {}) {
    this.options = options;
  }

  async transform(sharpInstance) {
    throw new Error('Method transform() must be implemented by the child class.');
  }
}

module.exports = BaseTransformer;