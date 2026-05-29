'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { createClient } from '@/lib/supabase/client';
import { filterMessage } from '@/lib/chatFilter';
import { formatDateTime } from '@/lib/utils';
import { Send, AlertTriangle, MessageSquare } from 'lucide-react';

interface Conversation {
  partnerId: string;
  partnerName: string;
  lastMessage: string;
  lastTs: string;
  unread: number;
}

interface Msg {
  id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  is_flagged: boolean;
}

export default function MessagesPage() {
  const params = useSearchParams();
  const { t } = useTranslation();
  const [userId, setUserId] = useState<string>('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string>(params.get('with') ?? '');
  const [activePartnerName, setActivePartnerName] = useState('');
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [filterWarning, setFilterWarning] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      await loadConversations(user.id);
      setLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (activeId && userId) loadMessages(userId, activeId);
  }, [activeId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversations = async (uid: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('messages')
      .select('sender_id, receiver_id, text, timestamp')
      .or(`sender_id.eq.${uid},receiver_id.eq.${uid}`)
      .order('timestamp', { ascending: false });

    if (!data) return;

    const seen = new Set<string>();
    const convs: Conversation[] = [];
    for (const m of data) {
      const partnerId = m.sender_id === uid ? m.receiver_id : m.sender_id;
      if (seen.has(partnerId)) continue;
      seen.add(partnerId);
      const { data: partner } = await supabase.from('user_name_lookup').select('full_name').eq('id', partnerId).single();
      convs.push({ partnerId, partnerName: partner?.full_name ?? 'Unknown', lastMessage: m.text, lastTs: m.timestamp, unread: 0 });
    }

    if (params.get('with') && !seen.has(params.get('with')!)) {
      const pid = params.get('with')!;
      const { data: partner } = await supabase.from('user_name_lookup').select('full_name').eq('id', pid).single();
      convs.unshift({ partnerId: pid, partnerName: partner?.full_name ?? 'Unknown', lastMessage: '', lastTs: '', unread: 0 });
    }

    setConversations(convs);
    if (convs.length > 0 && !activeId) setActiveId(convs[0].partnerId);
  };

  const loadMessages = async (uid: string, partnerId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, text, timestamp, is_flagged')
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${uid})`)
      .order('timestamp', { ascending: true });

    setMessages(data ?? []);

    const conv = conversations.find(c => c.partnerId === partnerId);
    if (conv) setActivePartnerName(conv.partnerName);
    else {
      const { data: partner } = await supabase.from('user_name_lookup').select('full_name').eq('id', partnerId).single();
      setActivePartnerName(partner?.full_name ?? '');
    }

    await supabase.from('messages').update({ read_at: new Date().toISOString() })
      .eq('receiver_id', uid).eq('sender_id', partnerId).is('read_at', null);
  };

  const handleSend = async () => {
    if (!text.trim() || !activeId || sending) return;

    const { filtered, text: filteredText, originalText, detectedPatterns } = filterMessage(text);

    if (filtered) {
      setFilterWarning(true);
      setTimeout(() => setFilterWarning(false), 6000);
    }

    setSending(true);
    const supabase = createClient();

    const { data: inserted, error } = await supabase.from('messages').insert({
      sender_id: userId,
      receiver_id: activeId,
      text: filteredText,
      original_text: filtered ? originalText : null,
      is_flagged: filtered,
      flag_reason: filtered ? detectedPatterns.join('; ') : null,
    }).select().single();

    if (error) { toast.error(error.message); setSending(false); return; }

    if (filtered) {
      const { data: updatedUser } = await supabase
        .rpc('increment_bypass_count', { user_id: userId });

      await supabase.from('bypass_violations').insert({
        user_id: userId,
        message_id: inserted.id,
        detected_pattern: detectedPatterns.join('; '),
        bypass_count_at_time: updatedUser ?? 0,
      });
    }

    setMessages(prev => [...prev, { id: inserted.id, sender_id: userId, text: filteredText, timestamp: inserted.timestamp, is_flagged: filtered }]);
    setText('');
    setSending(false);
  };

  if (loading) return <div className="text-center py-20 text-gray-400">{t('common.loading')}</div>;

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 rounded-xl overflow-hidden ring-1 ring-gray-200 bg-white">
      {/* Conversation list */}
      <div className="w-64 border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">{t('messages.title')}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">{t('messages.noConversations')}</div>
          ) : (
            conversations.map(conv => (
              <button
                key={conv.partnerId}
                onClick={() => setActiveId(conv.partnerId)}
                className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition ${
                  activeId === conv.partnerId ? 'bg-brand-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex-shrink-0">
                    {conv.partnerName.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{conv.partnerName}</p>
                    <p className="text-xs text-gray-400 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        {!activeId ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-gray-400">
            <MessageSquare className="h-12 w-12" />
            <p className="text-sm">{t('messages.selectChat')}</p>
          </div>
        ) : (
          <>
            <div className="border-b border-gray-200 px-5 py-3">
              <p className="font-semibold text-gray-900">{activePartnerName || '...'}</p>
              <p className="text-xs text-gray-400">{t('messages.contactInfoNote')}</p>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {filterWarning && (
                <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 flex gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-orange-700">{t('messages.filterWarning')}</p>
                </div>
              )}

              {messages.map(msg => {
                const isMine = msg.sender_id === userId;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-2.5 ${
                      isMine ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      {msg.is_flagged && (
                        <p className={`text-xs mt-1 flex items-center gap-1 ${isMine ? 'text-brand-200' : 'text-orange-500'}`}>
                          <AlertTriangle className="h-3 w-3" /> {t('messages.contentFiltered')}
                        </p>
                      )}
                      <p className={`text-xs mt-1 ${isMine ? 'text-brand-300' : 'text-gray-400'}`}>
                        {formatDateTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  className="input flex-1"
                  placeholder={t('messages.typeMessage')}
                />
                <button
                  onClick={handleSend}
                  disabled={!text.trim() || sending}
                  className="btn-primary px-4"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
