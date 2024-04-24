export default async function getImages(args) {
  const { retrieveList, isDummy } = args;

  const toReturn = {};
  for (let i = 0; i < retrieveList.length; i++) {
    const keywords = retrieveList[i];
    // TODO
    toReturn[keywords] = "http://someimage.com";
  }
  return toReturn;
}
