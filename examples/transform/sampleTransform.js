const transform = (restResponseBody, sqsRequestBody) => {
  const result = JSON.parse(restResponseBody);
  const sqsRequest = JSON.parse(sqsRequestBody);

  result.metainfo.traceId = sqsRequest.metainfo.traceId;
  result.metainfo.timestamp = new Date().toISOString();

  result.productStates.forEach((product) => {
    const inputProduct = sqsRequest.products.find((p) => p.productNumber === product.productNumber);
    if (inputProduct) {
      product.externalId = inputProduct.externalId;

      product.itemStates.forEach((item) => {
        const inputItem = inputProduct.items.find((i) => i.itemNumber === item.itemNumber);
        if (inputItem) {
          item.externalId = inputItem.externalId;

          item.variantStates.forEach((variant) => {
            const inputVariant = inputItem.variants.find((i) => i.variantNumber === variant.variantNumber);
            if (inputVariant) {
              variant.externalId = inputVariant.externalId;
            }
          });
        }
      });
    }
  });

  return JSON.stringify(result);
};

module.exports = transform;
