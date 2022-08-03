/* eslint-disable max-len */
const jose = require('node-jose');

export const zakljucajToken = async (data) => {
  const privateKey = localStorage.privateKey;
  const simKey = localStorage.simKey;
  const dt = new Date();
  const exp = new Date(dt.getTime() + (1 * 60 * 1000));
  const payload =
  {
    'JsonPodaci': data,
    'nbf': Math.floor((dt.getTime() / 1000)),
    'exp': Math.floor(exp.getTime() / 1000),
    'iat': Math.floor((dt.getTime() / 1000)),
    'iss': 'Blagajna',
    'aud': 'RestoranAPI',
  };

  const key = await jose.JWK.asKey(privateKey, 'pem');
  const jws = await jose.JWS.createSign({alg: 'RS256', format: 'compact'}, key).update(JSON.stringify(payload), 'utf8').final();
  const jwe = await jose.JWE.createEncrypt({alg: 'A128KW', enc: 'A128CBC-HS256', format: 'compact'}, {kty: 'oct', k: btoa(simKey)}).update(jws, 'utf8').final();

  return jwe;
};

export const otkljucajToken = async (jweToken) => {
  // TODO: upisati produkcijski javni kljuc
  const publicKey = '';
  const simKey = localStorage.simKey;
  const simKeyDefinition = await jose.JWK.asKey({kty: 'oct', k: btoa(simKey), kid: btoa(simKey)});
  const pubKeyDefinition = await jose.JWK.asKey(publicKey, 'pem');
  const jws = await jose.JWE.createDecrypt(simKeyDefinition).decrypt(jweToken);
  const jwsPayload = Buffer.from(jws.payload).toString();
  const jwt = await jose.JWS.createVerify(pubKeyDefinition, {algorithms: ['RS256']}).verify(jwsPayload);
  const jwtPayload = Buffer.from(jwt.payload).toString();
  const {JsonPodaci} = JSON.parse(jwtPayload);

  return JSON.parse(JsonPodaci);
};

