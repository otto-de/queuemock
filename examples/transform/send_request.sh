#!/bin/bash

export AWS_DEFAULT_REGION=eu-central-1

sqsrequest=$(jq -rc . sampleRequestBody.json)

aws --no-sign-request --endpoint-url http://localhost:9324 sqs send-message --queue-url http://localhost:9324/queue/Request --message-body  "$sqsrequest"

