// as default, no transformation is done between the response we get from the REST service
// and the response we send back via SQS
//
// to see an example how to do a transformation, check the 'examples/transform' folder
//
// eslint-disable-next-line no-unused-vars
const transform = (restResponseBody, sqsRequestBody) => restResponseBody;

module.exports = transform;
