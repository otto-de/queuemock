const AWS = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const nodeFetch = require('node-fetch');

const transform = require('./transform.js');

const awsDefaultRegion = process.env.AWS_DEFAULT_REGION;
const requestUrl = process.env.REQUEST_URL;
const responseUrl = process.env.RESPONSE_URL;
const restEndpointUrl = process.env.REST_ENDPOINT_URL;

AWS.config.update({
  region: awsDefaultRegion,
});
const SQS = new AWS.SQS();

const app = Consumer.create({
  queueUrl: requestUrl,
  batchSize: 1,
  handleMessage: async (message) => {
    console.log('Received request message: ', message);

    nodeFetch(restEndpointUrl, {
      method: 'post',
      body: message.Body,
      headers: { 'Content-Type': 'application/json' },
    })
      .then((res) => res.text())
      .then((body) => {
        console.log('Received REST response body: ', body);

        // TODO: try/catch
        const transformedBody = transform(body, message.Body);

        const params = {
          MessageBody: transformedBody,
          QueueUrl: responseUrl,
        };
        SQS.sendMessage(
          params,
          (err, data) => {
            if (err) {
              console.log('Error sending response: ', err);
            } else {
              console.log('Sent response message: ', data);
            }
          },
        );
      });
  },
});

app.on('error', (err) => {
  console.error('Error while consuming job', err.message);
});

app.on('processing_error', (err) => {
  console.error('Error while consuming job', err.message);
});

app.start();
