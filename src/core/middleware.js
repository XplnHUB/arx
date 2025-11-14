async function runMiddleware(middlewares, req, res, finalHandler) {
  let index = 0;
  const next = async (err) => {
    // Handle error case
    if (err) {
      // Find error handling middleware (4 parameters)
      const errorMiddleware = middlewares.slice(index).find(mw => mw.length === 4);
      if (errorMiddleware) {
        try {
          await errorMiddleware(err, req, res, () => {});
          return;
        } catch (e) {
          // If error handler throws, continue to next error handler
          return next(e);
        }
      }
      // No more error handlers, pass to final handler
      return finalHandler(err);
    }

    // Normal middleware execution
    if (index >= middlewares.length) {
      return finalHandler();
    }

    const middleware = middlewares[index++];
    
    // Skip error handling middleware (4 parameters) during normal flow
    if (middleware.length === 4) {
      return next();
    }

    try {
      // Handle async middleware
      const result = middleware(req, res, (err) => {
        if (err) return next(err);
        return next();
      });

      // Handle async middleware that returns a promise
      if (result && typeof result.then === 'function') {
        return result.catch(next).then(() => {
          if (!res.headersSent) next();
        });
      }
      
      // Handle sync middleware that doesn't call next()
      if (!res.headersSent && !res.writableEnded) {
        next();
      }
    } catch (err) {
      next(err);
    }
  };

  // Start the middleware chain
  await next();
}

export default runMiddleware;