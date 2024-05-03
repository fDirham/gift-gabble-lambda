import { getTimeDifference, timeoutPromise } from "../../utilities/helpers.mjs";

export default async function oxylabsAmazonProductSearch(args) {
  const RETRIEVE_DELAY_MS = 250;

  const { isDummy } = args;
  if (isDummy) {
    // TODO
    return null;
  }

  const startDate = new Date();

  let { inList } = args;
  const MAX_RETRIEVE_SIZE = 6;
  if (inList.length > MAX_RETRIEVE_SIZE) {
    inList = inList.slice(0, MAX_RETRIEVE_SIZE);
  }

  const productDataList = await Promise.all(
    inList.map(async (kw, kwIdx) => {
      try {
        await timeoutPromise(kwIdx * RETRIEVE_DELAY_MS);

        const reqBody = {
          source: "amazon_search",
          domain: "com",
          domain: "com",
          query: kw,
          parse: true,
          // geo_location: "California,United States", //TODO: Localize per user
          limit: 6,
        };

        const auth = {
          username: process.env.OXYLABS_ECOM_USERNAME,
          password: process.env.OXYLABS_ECOM_PASSWORD,
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
            const {
              url,
              price,
              title,
              url_image,
              currency,
              rating,
              is_prime,
              asin,
              reviews_count,
            } = obj;
            if (!url.includes("/dp/")) {
              continue;
            }

            const toAdd = {
              title,
              isPrime: is_prime,
              imageUrl: url_image,
              asin,
            };
            if (currency && currency == "USD" && price) {
              toAdd.price = price;
              toAdd.currencySymbol = "$";
            }
            if (rating) {
              toAdd.rating = rating;
            }
            if (reviews_count) {
              toAdd.reviewsCount = reviews_count;
            }

            // Format url
            let linkUrl = url;
            if (!url.includes("amazon.com"))
              linkUrl = "https://amazon.com" + linkUrl;
            if (url.includes("?")) linkUrl += "&";
            else linkUrl += "?";
            linkUrl += "tag=fbdlabs-20";

            toAdd.linkUrl = linkUrl;

            productList.push(toAdd);
          }
        }

        return {
          isError: false,
          kw,
          data: productList,
        };
      } catch (error) {
        console.error(kw, error);
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
