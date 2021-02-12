# Run the example

First start the containers
```shell script
docker-compose up -d
```

Then (on Linux or WSL on Windows)
```shell script
./send_request.sh
```

And finally (it will dump and then delete the response message)
```shell script
./receive_response.sh
```

Sometimes it takes a while for the SQS message to be delivered.
So if the receive script does not return anything right away, try again after a second or two.

# 'sampleTransform.js' explained

The use case of this example is to return mock responses that contain UUIDs which are only known at runtime (e.g. during an integrated system test).

Here, an incoming SQS message contains products that consist of one or more items which in turn can have one or more variants.
On each level (product, item, variant) there are technical keys (random UUIDs; called `externalId`) as well as functional keys (e.g. `productNumber`, `itemNumber`, `variantNumber`).

The REST mock response is matched by the `productNumber` and returns additional data like references in another system (`productReference`, `itemReference`, `variantReference`).
UUIDs in this mock response are fixed and don't match the UUIDs of the request at runtime.

Matching the runtime UUIDs is then done in the `sampleTransform.js`.
Using the functional keys `productNumber`, `itemNumber` and `variantNumber` request and response entities are matched and all `externalIds` of the response are updated to match those of the incoming SQS message.
In addition the transformation illustrates using runtime metadata like current timestamps and tracing information. 
