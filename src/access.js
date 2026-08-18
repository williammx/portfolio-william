/* ============================================================
   Cloudflare Access — verificação do JWT
   O Access coloca o token no header Cf-Access-Jwt-Assertion.
   Aqui validamos a assinatura contra as chaves públicas da sua
   equipe, além de audience (aud), emissor (iss) e validade (exp).

   FALHA FECHADA: se as variáveis não estiverem configuradas,
   nenhuma rota protegida é liberada em produção.
   ============================================================ */

const encoder = new TextEncoder();
let keyCache = { at: 0, keys: null };

function b64urlToBytes(s) {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(s.length / 4) * 4, '=');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function decodeJson(part) {
  return JSON.parse(new TextDecoder().decode(b64urlToBytes(part)));
}

/* baixa e cacheia as chaves públicas da equipe (rotacionam de tempos em tempos) */
async function getKeys(teamDomain) {
  const now = Date.now();
  if (keyCache.keys && now - keyCache.at < 60 * 60 * 1000) return keyCache.keys;

  const url = `https://${teamDomain}/cdn-cgi/access/certs`;
  const res = await fetch(url, { cf: { cacheTtl: 3600 } });
  if (!res.ok) throw new Error(`Não consegui buscar as chaves do Access (${res.status})`);
  const { keys } = await res.json();

  const imported = {};
  for (const jwk of keys) {
    imported[jwk.kid] = await crypto.subtle.importKey(
      'jwk',
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true },
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
      false,
      ['verify']
    );
  }
  keyCache = { at: now, keys: imported };
  return imported;
}

/**
 * Retorna { ok:true, email } se o pedido vier autenticado pelo Access,
 * ou { ok:false, status, message } caso contrário.
 */
export async function verifyAccess(request, env) {
  // Em desenvolvimento local o Access não existe; liberamos explicitamente.
  if (env.ENVIRONMENT === 'development') {
    return { ok: true, email: 'dev@local', dev: true };
  }

  const teamDomain = env.ACCESS_TEAM_DOMAIN; // ex.: suaequipe.cloudflareaccess.com
  const aud = env.ACCESS_AUD;                // Application Audience Tag

  if (!teamDomain || !aud) {
    return {
      ok: false, status: 503,
      message: 'Cloudflare Access ainda não foi configurado. ' +
               'Defina ACCESS_TEAM_DOMAIN e ACCESS_AUD antes de usar o painel.'
    };
  }

  const token = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!token) return { ok: false, status: 401, message: 'Sem token do Access.' };

  const parts = token.split('.');
  if (parts.length !== 3) return { ok: false, status: 401, message: 'Token malformado.' };

  let header, payload;
  try {
    header = decodeJson(parts[0]);
    payload = decodeJson(parts[1]);
  } catch {
    return { ok: false, status: 401, message: 'Token ilegível.' };
  }

  if (header.alg !== 'RS256') return { ok: false, status: 401, message: 'Algoritmo não aceito.' };

  let keys;
  try { keys = await getKeys(teamDomain); }
  catch (e) { return { ok: false, status: 503, message: e.message }; }

  const key = keys[header.kid];
  if (!key) return { ok: false, status: 401, message: 'Chave do token não reconhecida.' };

  const valid = await crypto.subtle.verify(
    'RSASSA-PKCS1-v1_5', key,
    b64urlToBytes(parts[2]),
    encoder.encode(`${parts[0]}.${parts[1]}`)
  );
  if (!valid) return { ok: false, status: 401, message: 'Assinatura inválida.' };

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) return { ok: false, status: 401, message: 'Token expirado.' };
  if (payload.nbf && payload.nbf > now) return { ok: false, status: 401, message: 'Token ainda não válido.' };

  const audList = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audList.includes(aud)) return { ok: false, status: 403, message: 'Audience não confere.' };

  if (payload.iss !== `https://${teamDomain}`) {
    return { ok: false, status: 403, message: 'Emissor não confere.' };
  }

  return { ok: true, email: payload.email || '' };
}
