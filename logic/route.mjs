import getProductList from "./getProductList.mjs";
import getRecList from "./getRecList.mjs";
import validateInputs from "./validateInputs.mjs";

export default async function recommendLogic(searchParams) {
  const invalidInputs = validateInputs(searchParams);
  if (invalidInputs) {
    return { body: { error: invalidInputs }, statusCode: 400 };
  }

  const doRecList = searchParams["doRecList"];
  const doProductList = searchParams["doProductList"];

  let recList = [];
  if (doRecList == "1") {
    const res = await getRecList(searchParams);
    if (res.isError) {
      const statusCode = res.statusCode || 500;
      return { body: res.errorObj, statusCode: statusCode };
    }
    recList = res.recList;
  }

  let productList = [];
  let productListQuery = "";
  if (doProductList == "1") {
    const res = await getProductList(searchParams, recList);
    if (res.isError) {
      const statusCode = res.statusCode || 500;
      return { body: res.errorObj, statusCode: statusCode };
    }

    productList = res.productList;
    productListQuery = res.query;
  }

  return { body: { recList, productList, productListQuery }, statusCode: 200 };
}
