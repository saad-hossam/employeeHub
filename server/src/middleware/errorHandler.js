module.exports = function errorHandler(err, req, res, next) {
// A bad ObjectId like /api/employees/123
if (err.name === 'CastError') {
return res.status(400).json({ message: `Invalid ${err.path}: ${err.value}` });
}
// Mongoose schema rules failed (required, min, ...)
if (err.name === 'ValidationError') {
const errors = Object.values(err.errors).map((e) => e.message);
return res.status(400).json({ message: 'Validation failed', errors });
}
// Unique index violated, e.g. two departments called "IT"
if (err.code === 11000) {
const field = Object.keys(err.keyValue)[0];
return res.status(409).json({ message: `${field} "${err.keyValue[field]}" already
exists` });
}
// Invalid JSON body
if (err.type === 'entity.parse.failed') {
return res.status(400).json({ message: 'Invalid JSON body' });
}
// Errors we created on purpose with a status
if (err.statusCode) {
return res.status(err.statusCode).json({ message: err.message });
}
console.error(err);
res.status(500).json({ message: 'Something went wrong' });
};