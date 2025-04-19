import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(_: Request, { params }: { params: { calendarId: string } }) {
  const { calendarId } = params;

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('calendar_id', calendarId)
    .order('scheduled_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
