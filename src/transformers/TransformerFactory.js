const GrayscaleTransformer = require('./GrayscaleTransformer');
const ResizeTransformer = require('./ResizeWebPTransformer');


const transformerRegistry = {
  'resize': ResizeTransformer,
};

const filterRegistry = {
  'grayscale': GrayscaleTransformer,
};

class TransformerFactory {
  static buildPipeline(transformationsJSON) {
    const pipeline = [];

    if (!transformationsJSON) return pipeline;

    // Process transformations
    for (const [key, options] of Object.entries(transformationsJSON)) {
      if (transformerRegistry[key]) {
        pipeline.push(new transformerRegistry[key](options));
      }
    }

    // Process filters
    if (transformationsJSON.filters) {
      for (const [filterName, isEnabled] of Object.entries(transformationsJSON.filters)) {

        if (typeof isEnabled !== 'boolean') {
          console.warn(`Invalid value for filter ${filterName}: expected boolean, got ${typeof isEnabled}`);
          continue;
        }

        if (isEnabled && filterRegistry[filterName]) {
          pipeline.push(new filterRegistry[filterName]());
        }
      }
    }

    return pipeline;
  }
}

module.exports = TransformerFactory;