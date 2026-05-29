'use client';

import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { X, RotateCcw, PenLine, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  contractType: 'client' | 'worker';
  signerName: string;
  onComplete: (signatureDataUrl: string, name: string) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function SignatureModal({ contractType, signerName, onComplete, onClose, loading = false }: Props) {
  const { t } = useTranslation();
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const padRef      = useRef<any>(null);

  const [name,    setName]    = useState(signerName);
  const [agreed,  setAgreed]  = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [padReady, setPadReady] = useState(false);

  // Dynamically import signature_pad (client-only)
  useLayoutEffect(() => {
    let pad: any = null;
    let cancelled = false;

    const init = async () => {
      const SignaturePad = (await import('signature_pad')).default;
      if (cancelled || !canvasRef.current || !containerRef.current) return;

      const canvas    = canvasRef.current;
      const container = containerRef.current;
      const ratio     = Math.max(window.devicePixelRatio ?? 1, 1);

      canvas.width  = container.offsetWidth  * ratio;
      canvas.height = container.offsetHeight * ratio;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(ratio, ratio);

      pad = new SignaturePad(canvas, {
        backgroundColor: 'rgb(255,255,255)',
        penColor: 'rgb(15,23,42)',
        minWidth: 1.2,
        maxWidth: 3.5,
      });

      pad.addEventListener('endStroke', () => setIsEmpty(pad.isEmpty()));
      padRef.current = pad;
      setPadReady(true);
    };

    init();
    return () => {
      cancelled = true;
      if (pad) { try { pad.off(); } catch {} }
    };
  }, []);

  const handleClear = () => {
    padRef.current?.clear();
    setIsEmpty(true);
  };

  const handleComplete = () => {
    if (!padRef.current || padRef.current.isEmpty()) return;
    const dataUrl = padRef.current.toDataURL('image/png');
    onComplete(dataUrl, name.trim());
  };

  const dateStr = new Date().toLocaleDateString(undefined, {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  });

  const canSubmit = agreed && !isEmpty && name.trim().length > 1 && !loading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <PenLine className="h-5 w-5 text-brand-600" />
              {t('contracts.signTitle')}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">{t('contracts.signSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">

          {/* ── Contract type badge ── */}
          <div className={`rounded-xl p-3 text-sm font-medium flex items-center gap-2 ${
            contractType === 'client'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-orange-50 text-orange-800 border border-orange-200'
          }`}>
            <span>{contractType === 'client' ? '🏢' : '🔧'}</span>
            {t(contractType === 'client' ? 'contracts.signingClient' : 'contracts.signingWorker')}
          </div>

          {/* ── Agreement checkbox ── */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="h-5 w-5 rounded border-gray-300 text-brand-600 cursor-pointer"
              />
            </div>
            <span className="text-sm text-gray-700 leading-relaxed">
              {t(contractType === 'client' ? 'contracts.agreeStatementClient' : 'contracts.agreeStatement')}
            </span>
          </label>

          {/* ── Full name ── */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              {t('contracts.fullName')} <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder={t('contracts.fullNamePlaceholder')}
              autoComplete="name"
            />
          </div>

          {/* ── Signature canvas ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                {t('contracts.drawSignature')} <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition"
              >
                <RotateCcw className="h-3 w-3" />
                {t('contracts.clearSignature')}
              </button>
            </div>

            <div
              ref={containerRef}
              className={`relative border-2 rounded-xl overflow-hidden bg-white transition ${
                isEmpty ? 'border-dashed border-gray-300' : 'border-brand-400'
              }`}
              style={{ height: 150 }}
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ cursor: 'crosshair', touchAction: 'none' }}
              />
              {isEmpty && padReady && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <PenLine className="h-8 w-8 text-gray-200 mb-1" />
                  <p className="text-xs text-gray-400">{t('contracts.signatureHint')}</p>
                </div>
              )}
              {!padReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
                </div>
              )}
            </div>
            {!isEmpty && (
              <p className="flex items-center gap-1 text-xs text-green-600 mt-1.5">
                <CheckCircle className="h-3 w-3" />
                {t('contracts.signatureCaptured')}
              </p>
            )}
          </div>

          {/* ── Date ── */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-sm text-gray-600 flex items-center gap-2">
            <span className="font-medium">{t('contracts.signDate')}:</span>
            <span>{dateStr}</span>
          </div>

          {/* ── Validation hint ── */}
          {(!agreed || isEmpty || !name.trim()) && (
            <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{t('contracts.completeAll')}</span>
            </div>
          )}
        </div>

        {/* ── Footer buttons ── */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-secondary flex-1 disabled:opacity-50"
          >
            {t('contracts.cancel')}
          </button>
          <button
            type="button"
            onClick={handleComplete}
            disabled={!canSubmit}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                {t('contracts.generating')}
              </>
            ) : (
              <>
                <PenLine className="h-4 w-4" />
                {t('contracts.signAndDownload')}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
