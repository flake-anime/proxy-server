function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?','i'); // fragment locator
    return !!pattern.test(str);
  }

const url = "https://bcboltbde696aa-a.akamaihd.net/media/v1/hls/v4/clear/6303329907001/2a7c6797-c5a6-4290-8411-f7ef2565994b/ffcfe000-b6e5-4839-876a-38d0c466719a/3x/segment44.ts?akamai_token=exp=1650814569~acl=/media/v1/hls/v4/clear/6303329907001/2a7c6797-c5a6-4290-8411-f7ef2565994b/ffcfe000-b6e5-4839-876a-38d0c466719a/*~hmac=82e787c0b5eb29e7d7e8315979dbe409a8e3ef49cb6c804dd73abf628bf04ddc"
console.log(validURL(url))