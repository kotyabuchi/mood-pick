#!/usr/bin/env node

/**
 * Cloudflare Quick Tunnel + Supabase リダイレクトURL自動更新スクリプト
 *
 * 処理フロー:
 * 1. cloudflared / config.toml 存在確認、前回残骸の復旧
 * 2. cloudflared tunnel 起動 → stderr から Tunnel URL 抽出
 * 3. config.toml の additional_redirect_urls に Tunnel URL を追加
 * 4. supabase config push で反映
 * 5. 終了時 (SIGINT/SIGTERM) に元の値を復元
 */

import { execSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_PATH = resolve('supabase/config.toml');
const BACKUP_PATH = resolve('.tunnel-backup');
const TUNNEL_URL_RE = /https:\/\/[-a-z0-9]+\.trycloudflare\.com/;
const REDIRECT_LINE_RE = /^(additional_redirect_urls\s*=\s*)(\[.*\])\s*$/m;
const TUNNEL_TIMEOUT_MS = 30_000;

// ─── Helpers ──────────────────────────────────────────────

function die(msg) {
  console.error(`\x1b[31m[error]\x1b[0m ${msg}`);
  process.exit(1);
}

function info(msg) {
  console.log(`\x1b[36m[tunnel]\x1b[0m ${msg}`);
}

function warn(msg) {
  console.warn(`\x1b[33m[warn]\x1b[0m ${msg}`);
}

function commandExists(cmd) {
  try {
    execSync(`${cmd} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ─── config.toml 操作 ─────────────────────────────────────

function readRedirectUrls() {
  const content = readFileSync(CONFIG_PATH, 'utf-8');
  const match = content.match(REDIRECT_LINE_RE);
  if (!match) {
    die('config.toml に additional_redirect_urls が見つかりません');
  }
  return JSON.parse(match[2]);
}

function writeRedirectUrls(urls) {
  let content = readFileSync(CONFIG_PATH, 'utf-8');
  const replacement = `additional_redirect_urls = ${JSON.stringify(urls)}`;
  content = content.replace(REDIRECT_LINE_RE, replacement);
  writeFileSync(CONFIG_PATH, content, 'utf-8');
}

function configPush() {
  info('supabase config push 実行中...');
  try {
    execSync('supabase config push --yes', {
      stdio: 'inherit',
    });
    info('supabase config push 完了');
  } catch {
    warn('supabase config push に失敗しました。手動で確認してください');
  }
}

// ─── バックアップ / 復元 ──────────────────────────────────

function saveBackup(urls) {
  writeFileSync(BACKUP_PATH, JSON.stringify(urls), 'utf-8');
}

function restoreFromBackup() {
  if (!existsSync(BACKUP_PATH)) return false;
  warn('前回の残骸を検出。リダイレクトURLを復元します...');
  const original = JSON.parse(readFileSync(BACKUP_PATH, 'utf-8'));
  writeRedirectUrls(original);
  configPush();
  unlinkSync(BACKUP_PATH);
  info('復元完了');
  return true;
}

// ─── メイン ───────────────────────────────────────────────

async function main() {
  // 前提チェック
  if (!commandExists('cloudflared')) {
    die(
      'cloudflared が見つかりません。インストールしてください:\n' +
        '  Windows: scoop install cloudflared\n' +
        '  macOS:   brew install cloudflared\n' +
        '  Linux:   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/',
    );
  }
  if (!existsSync(CONFIG_PATH)) {
    die(`${CONFIG_PATH} が見つかりません。supabase init を実行してください`);
  }

  // 前回残骸の復旧
  restoreFromBackup();

  // 元のURL配列を記録
  const originalUrls = readRedirectUrls();

  info('Cloudflare Tunnel を起動中...');

  const cf = spawn(
    'cloudflared',
    ['tunnel', '--url', 'http://localhost:3000'],
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  // Tunnel URL 抽出
  const tunnelUrl = await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cf.kill();
      reject(
        new Error(
          `${TUNNEL_TIMEOUT_MS / 1000}秒以内にTunnel URLを取得できませんでした`,
        ),
      );
    }, TUNNEL_TIMEOUT_MS);

    function onData(chunk) {
      const text = chunk.toString();
      const match = text.match(TUNNEL_URL_RE);
      if (match) {
        clearTimeout(timeout);
        resolve(match[0]);
      }
    }

    cf.stderr.on('data', onData);
    cf.stdout.on('data', onData);

    cf.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });

    cf.on('close', (code) => {
      clearTimeout(timeout);
      if (code !== null && code !== 0) {
        reject(
          new Error(`cloudflared が終了コード ${code} で異常終了しました`),
        );
      }
    });
  });

  const callbackUrl = `${tunnelUrl}/auth/callback`;
  info(`Tunnel URL: ${tunnelUrl}`);
  info(`Callback URL: ${callbackUrl}`);

  // config.toml 更新
  const updatedUrls = [...new Set([...originalUrls, callbackUrl])];
  writeRedirectUrls(updatedUrls);
  saveBackup(originalUrls);
  configPush();

  console.log('');
  console.log(`\x1b[32m✔ Tunnel 稼働中: ${tunnelUrl}\x1b[0m`);
  console.log(`  Ctrl+C で終了（リダイレクトURLは自動復元されます）`);
  console.log('');

  // cloudflared の出力をそのまま転送
  cf.stdout.pipe(process.stdout);
  cf.stderr.pipe(process.stderr);

  // 終了処理
  let cleaning = false;

  async function cleanup() {
    if (cleaning) return;
    cleaning = true;

    console.log('');
    info('終了処理を開始...');

    cf.kill('SIGTERM');

    // リダイレクトURL復元
    if (existsSync(BACKUP_PATH)) {
      try {
        const backup = JSON.parse(readFileSync(BACKUP_PATH, 'utf-8'));
        writeRedirectUrls(backup);
        configPush();
        unlinkSync(BACKUP_PATH);
        info('リダイレクトURLを復元しました');
      } catch (err) {
        warn(`復元に失敗: ${err.message}`);
      }
    }

    process.exit(0);
  }

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // cloudflared が予期せず終了した場合
  cf.on('close', (code) => {
    if (!cleaning) {
      warn(`cloudflared が終了しました (code: ${code})`);
      cleanup();
    }
  });
}

main().catch((err) => {
  console.error(err.message);
  // エラー時もバックアップがあれば復元を試みる
  if (existsSync(BACKUP_PATH)) {
    try {
      const backup = JSON.parse(readFileSync(BACKUP_PATH, 'utf-8'));
      writeRedirectUrls(backup);
      info('エラー発生のためリダイレクトURLを復元');
      configPush();
      unlinkSync(BACKUP_PATH);
    } catch {
      // 復元失敗は無視
    }
  }
  process.exit(1);
});
