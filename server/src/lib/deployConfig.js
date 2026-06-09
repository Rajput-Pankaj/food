import fs from 'fs';

const ENV_PATH = process.env.DEPLOY_ENV_PATH || '';

function envWriteEnabled() {
  return process.env.ENABLE_SETUP_ENV_WRITE === 'true' && Boolean(ENV_PATH);
}

export function isDeployEnvWritable() {
  return envWriteEnabled() && fs.existsSync(ENV_PATH);
}

export function buildTraefikHostRule(primary, legacy) {
  const p = primary?.trim().toLowerCase();
  if (!p) return '';
  const primaryRule = `Host(\`${p}\`)`;
  const l = legacy?.trim().toLowerCase();
  if (l && l !== p) {
    return `${primaryRule} || Host(\`${l}\`)`;
  }
  return primaryRule;
}

export function updateDeployEnv(updates) {
  if (!envWriteEnabled()) {
    return { ok: false, skipped: true, reason: 'Env write disabled or path not configured.' };
  }
  if (!fs.existsSync(ENV_PATH)) {
    return { ok: false, skipped: true, reason: 'Deploy env file not found.' };
  }

  let content = fs.readFileSync(ENV_PATH, 'utf8');

  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}=${value}`;
    const regex = new RegExp(`^${key}=.*$`, 'm');
    if (regex.test(content)) {
      content = content.replace(regex, line);
    } else {
      content = `${content.trimEnd()}\n${line}\n`;
    }
  }

  fs.writeFileSync(ENV_PATH, content, 'utf8');
  return { ok: true, updated: Object.keys(updates) };
}

/**
 * Apply public domain from setup wizard — updates .env for Traefik, CORS, cookies.
 * Keeps Hostinger subdomain as legacy host during switch to reduce downtime.
 */
export function applyDomainDeployConfig(domain, options = {}) {
  const normalized = domain.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, skipped: true, reason: 'No domain provided.' };
  }

  const previousDomain = (options.previousDomain || process.env.DOMAIN || '').trim().toLowerCase();
  const useTraefik = process.env.TRAEFIK_AVAILABLE === 'true';
  const appPort = process.env.APP_PORT || '8080';
  const domainChanged = Boolean(previousDomain && normalized !== previousDomain);

  // Keep previous auto-deploy URL working while DNS propagates to a custom domain
  const keepLegacy = domainChanged && Boolean(previousDomain);
  const legacyDomain = keepLegacy ? previousDomain : '';

  const appUrl = useTraefik ? `https://${normalized}` : `http://${normalized}:${appPort}`;
  const hostRule = buildTraefikHostRule(normalized, legacyDomain);

  const updates = {
    DOMAIN: normalized,
    APP_URL: appUrl,
    CORS_ORIGIN: appUrl,
    COOKIE_SECURE: useTraefik ? 'true' : 'false',
    TRAEFIK_HOST_RULE: hostRule,
    TRAEFIK_LEGACY_DOMAIN: legacyDomain,
  };

  if (useTraefik) {
    updates.USE_TRAEFIK = 'true';
  }

  const result = updateDeployEnv(updates);
  if (!result.ok) return result;

  return {
    ok: true,
    domain: normalized,
    previousDomain: previousDomain || null,
    legacyDomain: legacyDomain || null,
    domainChanged,
    appUrl,
    useTraefik,
    hostRule,
    redeployRequired: true,
    redeployCommand: './scripts/redeploy-domain.sh',
    message: domainChanged
      ? `Domain updated to ${normalized}. Run ./scripts/deploy.sh on the server to apply Traefik HTTPS (old URL kept briefly if applicable).`
      : `Domain confirmed as ${normalized}. Run ./scripts/deploy.sh if Traefik labels need refresh.`,
  };
}
