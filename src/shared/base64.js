export const encode = (data) => new Buffer(data, 'binary').toString('base64');
export const decode = (data) => new Buffer(data, 'base64');
