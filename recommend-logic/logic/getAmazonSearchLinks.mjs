export default function getAmazonSearchLinks(args) {
  const { recList, isDummy } = args;

  const toReturn = {};

  for (let i = 0; i < recList.length; i++) {
    const keywords = recList[i];

    "".trim().toLowerCase().to;
    const query = keywords
      .toLowerCase()
      .replace(/[^a-z0-9]/gim, " ")
      .replace(/\s+/g, " ")
      .replace(/[\s+]/g, "+")
      .trim();

    toReturn[keywords] = `https://www.amazon.com/s?k=${query}&tag=fbdlabs-20`;
  }
  return toReturn;
}
