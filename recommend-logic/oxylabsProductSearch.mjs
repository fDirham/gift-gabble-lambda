import { getTimeDifference, timeoutPromise } from "../utilities/helpers.mjs";

export default async function oxylabsProductSearch(args) {
  const RETRIEVE_DELAY_MS = 250;

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

        const reqBody = {
          source: "google_search",
          domain: "com",
          query: kw + " site:amazon.com",
          parse: true,
          geo_location: "California,United States", //TODO: Localize per user
          limit: 6,
        };

        const auth = {
          username: process.env.OXYLABS_USERNAME,
          password: process.env.OXYLABS_PASSWORD,
        };

        const reqHeaders = new Headers();
        reqHeaders.set(
          "Authorization",
          "Basic " +
            Buffer.from(auth.username + ":" + auth.password).toString("base64")
        );

        const res = await fetch("https://realtime.oxylabs.io/v1/queries", {
          method: "POST",
          body: JSON.stringify(reqBody),
          headers: reqHeaders,
        });

        const resData = await res.json();
        const resultsObj = resData.results[0].content.results;
        const organicResults = resultsObj.organic;
        const productList = [];

        // Process organic results
        if (organicResults && organicResults.length) {
          for (let i = 0; i < organicResults.length; i++) {
            const obj = organicResults[i];
            const { url, price, title, images, currency, rating } = obj;
            if (!url.includes("/dp/")) {
              continue;
            }

            const toAdd = { url, title, images };
            if (currency && currency == "USD" && price) {
              toAdd.price = price;
            }
            if (rating) {
              toAdd.rating = rating;
            }
            productList.push(toAdd);
          }
        }

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
