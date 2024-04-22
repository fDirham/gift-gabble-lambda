export function encodeObject(obj) {
  var str = [];
  for (var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}
export function randomIntFromInterval(min, max, inclusiveMax = false) {
  if (!inclusiveMax) max = max - 1;
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
