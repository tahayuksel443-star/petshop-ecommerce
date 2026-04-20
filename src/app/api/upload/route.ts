import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  applyRateLimit,
  getClientIp,
  requireAdminSession,
  tooManyRequestsResponse,
  unauthorizedResponse,
} from '@/lib/security';

export const runtime = 'nodejs';

const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const maxFileSize = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) return unauthorizedResponse();

  const limiter = await applyRateLimit(`upload:${getClientIp(req)}`, 30, 10 * 60 * 1000);
  if (!limiter.allowed) return tooManyRequestsResponse();

  const formData = await req.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Dosya bulunamadi' }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Desteklenmeyen dosya formati' }, { status: 400 });
  }

  if (file.size > maxFileSize) {
    return NextResponse.json({ error: "Dosya boyutu 5MB'i asamaz" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.VERCEL === '1') {
    return NextResponse.json({
      url: `data:${file.type};base64,${buffer.toString('base64')}`,
    });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${uuidv4()}.${ext}`;
  const uploadDir = join(process.cwd(), 'public', 'uploads');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
