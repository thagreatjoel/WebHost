import { useState } from 'react';

export default function StickerPlacementModal({ 
  sticker, 
  onConfirm, 
  onCancel, 
  existingStickers = []  // ✅ Default to empty array
}) {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [publicNote, setPublicNote] = useState('');
  const [privateNote, setPrivateNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Safe check: ensure existingStickers is always an array
  const safeExistingStickers = Array.isArray(existingStickers) ? existingStickers : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      alert('Please enter your name and email');
      return;
    }

    setIsSubmitting(true);
    // ✅ Call onConfirm with all data
    onConfirm({
      userName: userName.trim(),
      userEmail: userEmail.trim(),
      publicNote: publicNote.trim(),
      privateNote: privateNote.trim(),
    });
  };

  return (
    <div className="sticker-placement-overlay">
      <div className="sticker-placement-modal">
        <button className="modal-close" onClick={onCancel}>✕</button>
        
        <h2>📌 Place Your Sticker</h2>
        <p style={{ color: '#aaa', fontSize: '0.9rem', marginBottom: '20px' }}>
          You've selected: {sticker?.emoji} {sticker?.name}
          {/* ✅ Safe: check if safeExistingStickers has items */}
          {safeExistingStickers.length > 0 && (
            <span style={{ display: 'block', color: '#fbbf24', marginTop: '8px' }}>
              ⚠️ You already have {safeExistingStickers.length} sticker{safeExistingStickers.length > 1 ? 's' : ''}. 
              You can place up to 2 total.
            </span>
          )}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Your Name *</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Your Email *</label>
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Public Note (visible to everyone)</label>
            <textarea
              value={publicNote}
              onChange={(e) => setPublicNote(e.target.value)}
              placeholder="Leave a message for everyone to see..."
              maxLength={200}
              rows={2}
            />
            <small>{publicNote.length}/200</small>
          </div>

          <div className="form-group">
            <label>Private Note (only for Joel)</label>
            <textarea
              value={privateNote}
              onChange={(e) => setPrivateNote(e.target.value)}
              placeholder="Leave a private message for Joel..."
              maxLength={500}
              rows={2}
            />
            <small>{privateNote.length}/500</small>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Placing...' : 'Place Sticker ✨'}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .sticker-placement-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(16px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .sticker-placement-modal {
          background: rgba(25, 25, 25, 0.98);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 32px;
          max-width: 480px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideUp {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        .modal-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
          padding: 4px 8px;
          border-radius: 4px;
        }

        .modal-close:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        h2 {
          color: white;
          font-size: 1.4rem;
          font-weight: 500;
          margin-bottom: 8px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.85rem;
          margin-bottom: 6px;
          font-weight: 400;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          color: white;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.08);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 60px;
        }

        .form-group small {
          display: block;
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.7rem;
          margin-top: 4px;
          text-align: right;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn-secondary,
        .btn-primary {
          flex: 1;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: rgba(255, 255, 255, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .btn-primary {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #0F0F0F;
        }

        .btn-primary:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 480px) {
          .sticker-placement-modal {
            padding: 24px 20px;
          }
        }
      `}</style>
    </div>
  );
}