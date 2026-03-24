const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'Server Error';

    // Mongoose duplicate key error
    if (err?.code === 11000) {
        statusCode = 400;
        const duplicateField = Object.keys(err.keyValue || {})[0];
        message = duplicateField
            ? `${duplicateField} already exists`
            : 'Duplicate value error';
    }

    // Mongoose validation error
    if (err?.name === 'ValidationError') {
        statusCode = 400;
        const validationMessages = Object.values(err.errors || {}).map((e) => e.message);
        message = validationMessages.join(', ') || 'Validation failed';
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export { notFound, errorHandler };
