import {
  encodeObject,
  getTimeDifference,
  timeoutPromise,
} from "../../utilities/helpers.mjs";

export default async function rainforestAmazonSearch(args) {
  const RETRIEVE_DELAY_MS = 50;

  const { isDummy } = args;
  if (isDummy) {
    // TODO
    return { isError: false, searchDataDict: {}, timeDiff: 0 };
  }

  const startDate = new Date();

  const { inList } = args;
  const searchDataList = await Promise.all(
    inList.map(async (kw, kwIdx) => {
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
          let priceNum = 0;
          try {
            priceNum = parseFloat(curr.price.value);
          } catch {
            priceNum = null;
          }

          let priceSymbol = null;
          if (priceNum) {
            priceSymbol = curr.price.symbol || null;
          }

          return {
            title: curr.title,
            asin: curr.asin,
            linkUrl: curr.link,
            imageUrl: curr.image,
            rating: curr.rating,
            ratingsTotal: curr.ratings_total,
            priceNum,
            priceSymbol,
            priceStr: priceNum ? priceNum + "" : null,
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
  searchDataList.forEach((obj) => {
    if (!obj.isError) {
      const data = [];
      const asinSet = new Set();
      obj.data.forEach((product) => {
        const asin = product.asin;
        if (!asinSet.has(asin)) {
          data.push(product);
          asinSet.add(asin);
        }
      });
      toReturn[obj.kw] = obj.data;
    }
  });

  const endDate = new Date();
  const timeDiff = getTimeDifference(startDate, endDate);

  return { isError: false, searchDataDict: toReturn, timeDiff };
}
