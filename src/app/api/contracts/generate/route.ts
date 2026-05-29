import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateContractPDF } from '@/lib/pdf/generateContract';
import { ROLE_LABELS } from '@/types/database';
import type { ContractLanguage } from '@/types/database';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { language } = await request.json() as { language: ContractLanguage };

  const { data: profile } = await supabase
    .from('users')
    .select('full_name, role, email')
    .eq('id', user.id)
    .single();

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

  const ctx = {
    full_name: profile.full_name,
    role: ROLE_LABELS[profile.role as keyof typeof ROLE_LABELS],
    email: profile.email,
    language,
    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }),
  };

  const pdfBuffer = await generateContractPDF(ctx);

  // Upload to Supabase storage
  const filename = `contract_${user.id}_${Date.now()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from('contracts')
    .upload(filename, pdfBuffer, { contentType: 'application/pdf', upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from('contracts').getPublicUrl(filename);

  // Save contract record
  await supabase.from('contracts').insert({
    user_id: user.id,
    pdf_url: publicUrl,
    signed: true,
    signed_at: new Date().toISOString(),
    language,
    version: '1.0',
  });

  // Update user contract_pdf_url
  await supabase.from('users').update({ contract_pdf_url: publicUrl }).eq('id', user.id);

  return NextResponse.json({ url: publicUrl });
}
