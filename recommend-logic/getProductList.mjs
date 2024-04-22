import { DUMMY_REC_PRODUCT_MAP } from "../constants/dummy.mjs";
import { encodeObject } from "../utilities/helpers.mjs";

export default async function getProductList(searchParams, recList) {
  const returnDummy = searchParams["returnDummy"];
  const isDummy = returnDummy === "1";

  const searchKeyWords = searchParams["searchKeyWords"];
  let query = searchKeyWords;
  if (!searchKeyWords) {
    if (recList.length) {
      query = recList[0];
    }
  }
  if (!query)
    return {
      isError: true,
      errorObj: { error: "Invalid inputs" },
      statusCode: 400,
    };

  // Add pronouns to query
  let modifiedQuery = query;
  const pronouns = searchParams["pronouns"];
  if (pronouns) {
    if (pronouns == "male") {
      modifiedQuery += " for men";
    }
    if (pronouns == "female") {
      modifiedQuery += " for women";
    }
  }

  if (isDummy) {
    const dummyList = DUMMY_REC_PRODUCT_MAP[query] || [];
    return { isError: false, productList: dummyList, query };
  }

  const productList = [];
  const params = {
    api_key: process.env.RAINFOREST_API_KEY,
    type: "search",
    amazon_domain: "amazon.com",
    search_term: modifiedQuery,
    associate_id: "fbdlabs-20",
    language: "en_US",
    currency: "usd",
    sort_by: "featured",
    page: "1",
    max_page: "1",
    output: "json",
  };

  try {
    const res = await fetch(
      `https://api.rainforestapi.com/request?` + encodeObject(params),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const resObj = await res.json();
    const resList = resObj.search_results;
    for (let j = 0; j < resList.length; j++) {
      const curr = resList[j];
      let price = "";
      let priceNum = 0;
      try {
        price = curr.price.symbol + curr.price.value;
        priceNum = parseFloat(curr.price.value);
      } catch {
        price = undefined;
        priceNum = undefined;
      }

      const toAdd = {
        title: curr.title,
        asin: curr.asin,
        linkUrl: curr.link,
        imageUrl: curr.image,
        rating: curr.rating,
        ratingsTotal: curr.ratings_total,
        price,
        priceNum,
        isPrime: curr.is_prime || false,
      };
      productList.push(toAdd);
    }
  } catch (e) {
    console.error("Retrieve product list failed", e);
    return {
      isError: true,
      errorObj: { error: "Failed to retrieve product list" },
      statusCode: 500,
    };
  }

  return { isError: false, productList, query };
}
