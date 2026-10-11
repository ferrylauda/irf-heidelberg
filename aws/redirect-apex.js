// CloudFront Function (viewer request): irf-heidelberg.org -> https://www.irf-heidelberg.org
function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;
  if (host === "irf-heidelberg.org") {
    var qs = Object.keys(request.querystring)
      .map(function (k) {
        var q = request.querystring[k];
        return q.value === "" ? k : k + "=" + q.value;
      })
      .join("&");
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://www.irf-heidelberg.org" + request.uri + (qs ? "?" + qs : "") } }
    };
  }
  return request;
}
