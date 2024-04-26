import {
  encodeObject,
  getTimeDifference,
  timeoutPromise,
} from "../../utilities/helpers.mjs";

export default async function rainforestProductSearch(args) {
  const RETRIEVE_DELAY_MS = 50;

  const { isDummy } = args;
  if (isDummy) {
    // TODO
    return { isError: false, dataDict: {}, timeDiff: 0 };
  }

  const startDate = new Date();

  let { retrieveList } = args;
  const MAX_RETRIEVE_SIZE = 6;
  if (retrieveList.length > MAX_RETRIEVE_SIZE) {
    retrieveList = retrieveList.slice(0, MAX_RETRIEVE_SIZE);
  }

  const productDataList = await Promise.all(
    retrieveList.map(async (kw, kwIdx) => {
      try {
        await timeoutPromise(kwIdx * RETRIEVE_DELAY_MS);

        const params = {
          api_key: process.env.RAINFOREST_API_KEY,
          type: "search",
          amazon_domain: "amazon.com",
          search_term: kw,
          associate_id: "fbdlabs-20",
          language: "en_US",
          currency: "usd",
          sort_by: "featured",
          page: "1",
          max_page: "1",
          output: "json",
        };

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

        const productList = resList.map((curr) => {
          let price = "";
          let priceNum = 0;
          try {
            price = curr.price.symbol + curr.price.value;
            priceNum = parseFloat(curr.price.value);
          } catch {
            price = undefined;
            priceNum = undefined;
          }

          return {
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
        });

        return {
          isError: false,
          kw,
          data: productList,
        };
      } catch (error) {
        console.log(kw, error);
        return { isError: true, kw, error };
      }
    })
  );

  const toReturn = {};
  productDataList.forEach((obj) => {
    if (!obj.isError) {
      toReturn[obj.kw] = obj.data;
    }
  });

  const endDate = new Date();
  const timeDiff = getTimeDifference(startDate, endDate);

  return { isError: false, productDataDict: toReturn, timeDiff };
}
