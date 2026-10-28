import sharp from 'sharp';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../app/assets/', import.meta.url);
await mkdir(new URL('generated/', root), { recursive: true });
for (const name of ['main_1', 'back']) {
    const input = fileURLToPath(new URL(`${name}.png`, root));
    const image = sharp(input);
    const metadata = await image.metadata();
    const avif = fileURLToPath(new URL(`generated/${name}.avif`, root));
    const webp = fileURLToPath(new URL(`generated/${name}.webp`, root));
    await image.clone().avif({ quality: name === 'main_1' ? 80 : 55, effort: 4 }).toFile(avif);
    await image.clone().webp({ quality: name === 'main_1' ? 95 : 85, effort: 4 }).toFile(webp);
    for (const output of [avif, webp]) {
        const result = await sharp(output).metadata();
        if (result.width !== metadata.width || result.height !== metadata.height) {
            throw new Error(`Image dimensions changed: ${name}`);
        }
    }
    console.log(`${name}: ${metadata.width}x${metadata.height}; PNG ${(await stat(input)).size}; AVIF ${(await stat(avif)).size}; WebP ${(await stat(webp)).size} bytes (lossy)`);
}
