export default function getAmazonSearchLinks(args) {
  const { recList, isDummy } = args;

  const toReturn = {};

  for (let i = 0; i < recList.length; i++) {
    const keywords = recList[i];
    // TODO
    toReturn[keywords] = "http://someamazonlink.com";
  }
  return toReturn;
}
