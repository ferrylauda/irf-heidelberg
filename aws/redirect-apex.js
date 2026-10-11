// CloudFront Function (viewer request), attached to the distribution as "irf-apex-redirect".
//  1. irf-heidelberg.org      -> https://www.irf-heidelberg.org (301)
//  2. /id and /de             -> /id/ and /de/ (301)
//  3. folder URLs (/, /id/, /de/) are served from their index.html
function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;
  var uri = request.uri;

  var qs = Object.keys(request.querystring)
    .map(function (k) {
      var q = request.querystring[k];
      return q.value === "" ? k : k + "=" + q.value;
    })
    .join("&");

  function redirect(path) {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://www.irf-heidelberg.org" + path + (qs ? "?" + qs : "") } }
    };
  }

  if (host === "irf-heidelberg.org") {
    return redirect(uri === "/id" || uri === "/de" ? uri + "/" : uri);
  }
  if (uri === "/id" || uri === "/de") {
    return redirect(uri + "/");
  }
  if (uri.charAt(uri.length - 1) === "/") {
    request.uri = uri + "index.html";
  }
  return request;
}
