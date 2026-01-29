/**
 * Batch processing utility
 * Process large datasets efficiently in batches
 */

/**
 * Process items in batches
 * @param {Array} items - Items to process
 * @param {number} batchSize - Number of items per batch
 * @param {Function} processor - Async function to process each item
 * @param {object} options - Additional options
 * @returns {Promise<Array>} Processed results
 */
export const batchProcess = async (items, batchSize, processor, options = {}) => {
  const { 
    onBatchComplete = null, 
    onError = null,
    continueOnError = false,
  } = options;
  
  const results = [];
  const errors = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(items.length / batchSize);
    
    try {
      const batchResults = await Promise.all(
        batch.map(async (item, index) => {
          try {
            return await processor(item, i + index);
          } catch (error) {
            if (!continueOnError) throw error;
            errors.push({ item, index: i + index, error });
            return null;
          }
        })
      );
      
      results.push(...batchResults.filter(r => r !== null));
      
      if (onBatchComplete) {
        onBatchComplete({
          batchNumber,
          totalBatches,
          processedCount: results.length,
          errorCount: errors.length,
        });
      }
    } catch (error) {
      if (onError) {
        onError(error, batchNumber);
      }
      if (!continueOnError) {
        throw error;
      }
    }
  }
  
  return { results, errors };
};

/**
 * Process items in parallel with concurrency limit
 * @param {Array} items - Items to process
 * @param {number} concurrency - Maximum concurrent operations
 * @param {Function} processor - Async function to process each item
 * @returns {Promise<Array>} Processed results
 */
export const parallelProcess = async (items, concurrency, processor) => {
  const results = [];
  const executing = new Set();
  
  for (const [index, item] of items.entries()) {
    const promise = Promise.resolve().then(() => processor(item, index));
    results.push(promise);
    executing.add(promise);
    
    const cleanup = () => executing.delete(promise);
    promise.then(cleanup, cleanup);
    
    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }
  
  return Promise.all(results);
};

/**
 * Async generator for batch iteration
 * @param {Array} items - Items to iterate
 * @param {number} batchSize - Size of each batch
 */
export async function* batchIterator(items, batchSize) {
  for (let i = 0; i < items.length; i += batchSize) {
    yield items.slice(i, i + batchSize);
  }
}

export default {
  batchProcess,
  parallelProcess,
  batchIterator,
};
