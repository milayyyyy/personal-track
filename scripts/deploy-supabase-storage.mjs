import { createClient } from '@supabase/supabase-js';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const DIST_DIR = path.resolve('dist');
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'lifeflow-web';
const linkedProject = JSON.parse(
  await readFile(path.resolve('supabase/linked-project.json'), 'utf8'),
);

const url = process.env.SUPABASE_URL || linkedProject.url;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some(bucket => bucket.name === BUCKET);

  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw error;
  }
}

async function uploadFile(filePath) {
  const relative = path.relative(DIST_DIR, filePath).replaceAll('\\', '/');
  const body = await readFile(filePath);
  const contentType = relative.endsWith('.html')
    ? 'text/html'
    : relative.endsWith('.js')
      ? 'text/javascript'
      : relative.endsWith('.css')
        ? 'text/css'
        : relative.endsWith('.svg')
          ? 'image/svg+xml'
          : relative.endsWith('.webmanifest')
            ? 'application/manifest+json'
            : 'application/octet-stream';

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(relative, body, { upsert: true, contentType, cacheControl: '3600' });

  if (error) throw error;
  console.log(`Uploaded ${relative}`);
}

const distStats = await stat(DIST_DIR).catch(() => null);
if (!distStats?.isDirectory()) {
  console.error('dist/ not found. Run npm run build first.');
  process.exit(1);
}

await ensureBucket();
const files = await walk(DIST_DIR);
for (const file of files) {
  await uploadFile(file);
}

const siteUrl = `${url}/storage/v1/object/public/${BUCKET}/index.html`;
console.log(`Supabase static deploy complete: ${siteUrl}`);
