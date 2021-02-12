#!/bin/bash

export AWS_DEFAULT_REGION=eu-central-1

response=$(aws --no-sign-request --endpoint-url http://localhost:9324 sqs receive-message --queue-url http://localhost:9324/queue/Response)

echo "Response from SQS"
echo $response

if [ -z "$response" ]
then
  exit
fi

aws --no-sign-request --endpoint-url http://localhost:9324 sqs delete-message --queue-url http://localhost:9324/queue/Response --receipt-handle $(echo $response | jq '.Messages[0].ReceiptHandle')
if [ $? -eq 0 ]
then
   echo "Message deleted"
fi
