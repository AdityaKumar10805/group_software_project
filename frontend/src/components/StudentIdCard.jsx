import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineXMark,
  HiOutlineArrowDownTray,
  HiOutlinePrinter,
  HiOutlinePlay,
  HiOutlineIdentification,
} from 'react-icons/hi2';

const StudentIdCard = ({ student, onClose, onTestScan }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (student?.studentId) {
      QRCode.toDataURL(student.studentId, {
        width: 220,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR Gen error:', err));
    }
  }, [student]);

  if (!student) return null;

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `${student.studentId}-qr-code.png`;
    link.href = qrDataUrl;
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleTestScan = () => {
    if (onTestScan) {
      onTestScan(student.studentId);
      onClose();
    } else {
      navigate('/scanner', { state: { autoScanStudentId: student.studentId } });
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} id="student-id-modal">
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 460, padding: 24 }}
      >
        <div className="modal-header" style={{ marginBottom: 16 }}>
          <div className="flex items-center gap-2">
            <HiOutlineIdentification style={{ fontSize: 22, color: 'var(--accent-primary)' }} />
            <h3>Student ID Card & QR</h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <HiOutlineXMark />
          </button>
        </div>

        {/* Printable Card Area */}
        <div
          ref={cardRef}
          style={{
            background: 'linear-gradient(145deg, #1e293b, #0f172a)',
            borderRadius: 16,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            color: '#f8fafc',
          }}
        >
          {/* Top institution bar */}
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase' }}>
                Smart QR Academy
              </div>
              <div style={{ fontSize: 10, opacity: 0.9 }}>Digital Student Identity Card</div>
            </div>
            <span
              style={{
                fontSize: 10,
                background: 'rgba(255,255,255,0.2)',
                padding: '3px 8px',
                borderRadius: 20,
                fontWeight: 600,
              }}
            >
              2026-2027
            </span>
          </div>

          {/* Student Info & QR */}
          <div style={{ padding: '20px 22px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
              {/* Avatar */}
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                  fontWeight: 700,
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
                  flexShrink: 0,
                }}
              >
                {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 17, fontWeight: 700, color: '#ffffff', margin: 0 }}>
                  {student.name}
                </h4>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  Class: <strong style={{ color: '#e2e8f0' }}>{student.className}</strong> (Sec {student.section})
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                  Roll No: <strong style={{ color: '#e2e8f0' }}>{student.rollNumber}</strong>
                </div>
              </div>
            </div>

            {/* QR Code container */}
            <div
              style={{
                background: '#ffffff',
                borderRadius: 12,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
              }}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR for ${student.studentId}`}
                  style={{ width: 160, height: 160, display: 'block' }}
                />
              ) : (
                <div style={{ width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  Generating QR...
                </div>
              )}
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  color: '#0f172a',
                  marginTop: 6,
                  letterSpacing: 1.5,
                }}
              >
                {student.studentId}
              </div>
            </div>

            {/* Security footnote */}
            <div
              style={{
                textAlign: 'center',
                fontSize: 10,
                color: '#64748b',
                marginTop: 14,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Official Attendance QR • Authorized ID Scan
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
          <button className="btn btn-primary btn-sm flex-1" onClick={handleTestScan} title="Simulate attendance scan">
            <HiOutlinePlay /> Test Scan
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleDownload} title="Download QR image">
            <HiOutlineArrowDownTray /> QR Image
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handlePrint} title="Print ID Card">
            <HiOutlinePrinter /> Print
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentIdCard;
