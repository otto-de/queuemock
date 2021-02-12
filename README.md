# queuemock

This is a tool to help mocking services that listen to incoming messages and sending a response via SQS.
The main purpose is to be used during testing,
i.e. in combination with a local SQS like softwaremill/elasticmq
and some other mocking server that communicates via REST like mockserver/mockserver.
This tool is implemented with Node and serves as a bridge between SQS and REST. 

## Usage example

### Simple "bridge"

Here is a `docker-compose.yml` that starts two containers, configures a local `Request` and `Response`
SQS queue and sets up a fixed REST response.

```
version: '3'
services:
  sqs:
    image: softwaremill/elasticmq
    ports:
    - "9324:9324"
    volumes:
      - ./custom.conf:/opt/elasticmq.conf
  mockserver:
    image: mockserver/mockserver
    ports:
      - "1080:1080"
    environment:
      MOCKSERVER_INITIALIZATION_JSON_PATH: /config/initializerJson.json
    volumes:
      - ./mockdata.json:/config/initializerJson.json

```

Configs used in this example are
* `custom.conf` to set up the queue
```
include classpath("application.conf")

node-address {
    protocol = http
    host = localhost
    port = 9324
    context-path = ""
}

queues {
    Request {
        defaultVisibilityTimeout = 10 seconds
        delay = 5 seconds
        receiveMessageWait = 0 seconds
        fifo = false
        contentBasedDeduplication = false
    }
    Response {
        defaultVisibilityTimeout = 10 seconds
        delay = 5 seconds
        receiveMessageWait = 0 seconds
        fifo = false
        contentBasedDeduplication = false
    }
}
```
* `mockdata.json` to set up the mocked REST response
```
[
  {
    "httpRequest": {
      "path": "/queuemock/simple"
    },
    "httpResponse": {
      "body": "Response from REST mock"
    }
  }
]
```

Both configs and the compose file can be found in the `examples/simple` folder.

After building the docker image with `docker build --tag queuemock .` you can start the container via
```shell script
export REQUEST_URL="http://192.168.178.29:9324/queue/Request"
export RESPONSE_URL="http://192.168.178.29:9324/queue/Response"
export REST_ENDPOINT_URL="http://192.168.178.29:1080/queuemock/simple"
docker run -e REQUEST_URL=$REQUEST_URL -e RESPONSE_URL=$RESPONSE_URL -e REST_ENDPOINT_URL=$REST_ENDPOINT_URL --name queuemock queuemock
```

Create a test message via
```shell script
aws --no-sign-request --endpoint-url http://localhost:9324 sqs send-message --queue-url http://localhost:9324/queue/Request --message-body  "message from SQS"
```

Once the tools has relayed the message to the REST mock server and the REST response back as an SQS message you can see the SQS response via

```shell script
aws --no-sign-request --endpoint-url http://localhost:9324 sqs receive-message --queue-url http://localhost:9324/queue/Response
```

### Applying a transformation on the REST response

If it is not enough to simply return the REST response as body of the SQS response there is the possibility to execute a transformation first.
The transformation function must have the following signature: `(restResponseBody, sqsRequestBody)`.
Per default the transformation returns `restResponseBody` as is.

To see a more complex transformation, have a look at the `examples/transform` folder.
There, the fixed UUIDs from the mockserver response are mapped to the dynamic UUIDs in the SQS request.

### Using a ready-made Docker image

Instead of building the Docker image yourself locally, you can use

```shell script
docker pull queuemock/queuemock:latest
```

## Configuration

The tool is configured via environment variables

* `REQUEST_URL`: the (local) queue URL, e.g. http://192.168.178.29:9324/queue/Request
* `RESPONSE_URL`: the (local) queue URL, e.g. http://192.168.178.29:9324/queue/Response
* `REST_ENDPOINT_URL`: the URL that the SQS message body gets relayed to as a HTTP POST request, e.g. http://192.168.178.29:8383/queuemock

Use IP addresses, not `localhost`.

As the primary use case is during testing (with a local SQS), the following AWS environment variables
are hardcoded in the `Dockerfile` as the assumption is to not require real credentials (dummy values are used).

* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `AWS_DEFAULT_REGION`

## Troubleshooting

### SQS messages are received multiple times

When using softwaremill/elasticmq as local SQS it is not sufficient to create queue with default values.
The following will not work as desired:

```
queues {
    Request { }
    Response { }
}
```
For a working queue configuration see the basic usage example above.

## ToDos

- [ ] handle errors in the transform step
- [ ] add tests
- [ ] use logging framework instead of `console.log`
