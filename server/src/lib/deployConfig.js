import fs from 'fs';

const ENV_PATH = process.env.DEPLOY_ENV_PATH || '';

function envWriteEnabled() {
  return process.env.ENABLE_SETUP_ENV_WRITE === 'true' && Boolean(ENV_PATH);
}

export function isDeployEnvWritable() {
  return envWriteEnabled() && fs.existsSync(ENV_PATH);
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

export function applyDomainDeployConfig(domain) {
  const normalized = domain.trim().toLowerCase();
  if (!normalized) {
    return { ok: false, skipped: true, reason: 'No domain provided.' };
  }

  const useTraefik = process.env.TRAEFIK_AVAILABLE === 'true';
  const appPort = process.env.APP_PORT || '8080';
  const appUrl = useTraefik ? `https://${normalized}` : `http://${normalized}:${appPort}`;

  const updates = {
    DOMAIN: normalized,
    APP_URL: appUrl,
    CORS_ORIGIN: appUrl,
    COOKIE_SECURE: useTraefik ? 'true' : 'false',
  };

  if (useTraefik) {
    updates.USE_TRAEFIK = 'true';
  }

  const result = updateDeployEnv(updates);
  if (!result.ok) return result;

  return {
    ok: true,
    domain: normalized,
    appUrl,
    useTraefik,
    redeployRequired: true,
    redeployCommand: './scripts/deploy.sh',
  };
}
