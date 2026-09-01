/**
 * Builds the video manifest from whatever is in public/video.
 *
 * The clips themselves are produced offline (ffmpeg, 12 s, 720p on the long
 * side) and committed; this script only reads their real dimensions so the
 * player can reserve the right box instead of letterboxing 9:16 phone footage
 * into a 16:9 frame. Run it after adding or replacing a clip:
 *
 *   node scripts/prepare-video.mjs
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const DIR = path.join(process.cwd(), 'public', 'video');
const OUT = path.join(process.cwd(), 'src', 'content', 'video.generated.ts');

const entries = readdirSync(DIR)
  .filter((f) => f.endsWith('.mp4'))
  .sort();

const manifest = {};
for (const file of entries) {
  const full = path.join(DIR, file);
  let data;
  try {
    data = JSON.parse(
      execFileSync(
        'ffprobe',
        ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
         'stream=width,height:format=duration', '-of', 'json', full],
        { encoding: 'utf8' },
      ),
    );
  } catch {
    // Обрыв при перекодировании даёт файл без moov-атома: он не проигрывается
    // ни в одном браузере, поэтому падаем здесь, а не на проде.
    throw new Error(`Повреждённый файл: public/video/${file} — перекодируйте его заново.`);
  }
  const stream = data.streams?.[0] ?? {};
  manifest[path.basename(file, '.mp4')] = {
    w: stream.width,
    h: stream.height,
    seconds: Math.round(Number(data.format?.duration ?? 0)),
    kb: Math.round(statSync(full).size / 1024),
  };
}

const body = `// СГЕНЕРИРОВАНО scripts/prepare-video.mjs — не редактировать вручную.
export type VideoMeta = { w: number; h: number; seconds: number; kb: number };

export const VIDEO_MANIFEST = ${JSON.stringify(manifest, null, 2)} as const satisfies Record<string, VideoMeta>;

export type VideoKey = keyof typeof VIDEO_MANIFEST;
`;

writeFileSync(OUT, body);

const total = Object.values(manifest).reduce((sum, v) => sum + v.kb, 0);
console.log(`${entries.length} роликов, ${(total / 1024).toFixed(0)} МБ → ${path.relative(process.cwd(), OUT)}`);
