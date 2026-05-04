'use client'

import { useRef, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'

interface SignaturePadProps {
  onSave: (signatureDataUrl: string) => void
  onCancel: () => void
  signerName: string
}

export default function SignaturePad({ onSave, onCancel, signerName }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [isEmpty, setIsEmpty] = useState(true)

  const clear = () => {
    sigCanvas.current?.clear()
    setIsEmpty(true)
  }

  const save = () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      const dataUrl = sigCanvas.current.getTrimmedCanvas().toDataURL('image/png')
      onSave(dataUrl)
    }
  }

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current?.isEmpty() ?? true)
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-[var(--text-muted)]">Sign below to accept the proposal</p>
        <p className="text-xs text-[var(--text-muted)] mt-1">By signing, you agree to the scope and terms outlined above.</p>
      </div>

      <div className="border-2 border-[var(--border)] rounded-xl overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: 'w-full h-48',
            style: { width: '100%', height: '192px' }
          }}
          backgroundColor="white"
          penColor="black"
          onEnd={handleEnd}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={clear}
          className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Clear
        </button>
        <p className="text-xs text-[var(--text-muted)]">{signerName}</p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={save}
          disabled={isEmpty}
          className="flex-1 py-3 text-sm font-semibold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Sign & Accept Proposal
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          Cancel
        </button>
      </div>

      <p className="text-[10px] text-center text-[var(--text-muted)]">
        Your signature will be attached to the accepted proposal and emailed to both parties.
      </p>
    </div>
  )
}
