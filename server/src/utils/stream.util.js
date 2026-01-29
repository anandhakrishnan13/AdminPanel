/**
 * Streaming utility functions
 * Handle streaming responses for large data sets
 */

/**
 * Stream data as JSON array
 * @param {import('express').Response} res
 * @param {AsyncIterable|Iterable} dataGenerator - Data source
 * @param {Function} transform - Optional transform function for each item
 */
export const streamJsonArray = async (res, dataGenerator, transform = null) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  
  res.write('{"success":true,"data":[');
  
  let first = true;
  
  try {
    for await (const item of dataGenerator) {
      const data = transform ? transform(item) : item;
      
      if (!first) {
        res.write(',');
      }
      res.write(JSON.stringify(data));
      first = false;
    }
    
    res.write(']}');
    res.end();
  } catch (error) {
    // If we've already started streaming, we can't change status code
    // Write error as part of the response
    if (!first) {
      res.write(',');
    }
    res.write(`{"__error":"${error.message}"}`);
    res.write(']}');
    res.end();
  }
};

/**
 * Stream data as newline-delimited JSON (NDJSON)
 * @param {import('express').Response} res
 * @param {AsyncIterable|Iterable} dataGenerator - Data source
 */
export const streamNdjson = async (res, dataGenerator) => {
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.setHeader('Cache-Control', 'no-cache');
  
  try {
    for await (const item of dataGenerator) {
      res.write(JSON.stringify(item) + '\n');
    }
    res.end();
  } catch (error) {
    res.write(JSON.stringify({ error: error.message }) + '\n');
    res.end();
  }
};

/**
 * Create a readable generator from an array with optional delay
 * Useful for simulating streaming or rate-limiting output
 * @param {Array} items - Array to stream
 * @param {number} delayMs - Delay between items (0 for no delay)
 */
export async function* createArrayGenerator(items, delayMs = 0) {
  for (const item of items) {
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    yield item;
  }
}

export default {
  streamJsonArray,
  streamNdjson,
  createArrayGenerator,
};
