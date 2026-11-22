import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { attendanceAPI, timetableAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  HiOutlineQrCode,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineExclamationTriangle,
  HiOutlineVideoCamera,
  HiOutlineStopCircle,
  HiOutlineBookOpen,
  HiOutlineBolt,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

const SAMPLE_STUDENT_IDS = [
  'STU2024001',
  'STU2024002',
  'STU2024003',
  'STU2024004',
  'STU2024005',
];

const Scanner = () => {
  const location = useLocation();
  const [scanning, setScanning] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [activeSlots, setActiveSlots] = useState([]);
  const [todaySlots, setTodaySlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [simulatedId, setSimulatedId] = useState('');
  const [scanResults, setScanResults] = useState([]);
  const [lastScan, setLastScan] = useState(null);
  const scannerRef = useRef(null);
  const html5QrRef = useRef(null);
  const processingRef = useRef(false);

  useEffect(() => {
    loadCurrentLecture();
    const handleFocus = () => loadCurrentLecture();
    window.addEventListener('focus', handleFocus);
    return () => {
      stopScanning();
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadCurrentLecture = async (notify = false) => {
    try {
      const res = await timetableAPI.getCurrent();
      const current = res.data.currentSlot;
      const active = res.data.activeSlots || [];
      const today = res.data.todaySlots || [];

      setCurrentLecture(current);
      setActiveSlots(active);
      setTodaySlots(today);

      setSelectedSlot((prev) => {
        // Keep previous manual selection if valid
        if (prev && today.some((s) => s._id === prev)) return prev;
        return current?._id || active[0]?._id || today[0]?._id || '';
      });

      if (notify) {
        if (current) toast.success(`Current lecture: ${current.subject}`);
        else toast('Timetable refreshed', { icon: '🔄' });
      }
    } catch (err) {
      console.error('Error loading timetable:', err);
    }
  };

  const startScanning = useCallback(async () => {
    try {
      const html5Qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5Qr;

      await html5Qr.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        onScanSuccess,
        () => {} // ignore errors during scanning
      );

      setScanning(true);
      toast.success('Scanner started');
    } catch (err) {
      console.error('Scanner start error:', err);
      toast.error('Failed to start camera. Please check permissions.');
    }
  }, [selectedSlot]);

  const stopScanning = async () => {
    try {
      if (html5QrRef.current?.isScanning) {
        await html5QrRef.current.stop();
      }
    } catch {
      // ignore
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const res = await attendanceAPI.scan({
        studentId: decodedText.trim(),
        timetableSlotId: selectedSlot || undefined,
      });

      const result = {
        type: 'success',
        message: res.data.message,
        data: res.data.attendance,
        timestamp: new Date().toLocaleTimeString(),
      };

      setLastScan(result);
      setScanResults((prev) => [result, ...prev].slice(0, 50));
      toast.success(res.data.message);

      // Play success sound
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        oscillator.connect(gain);
        gain.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        gain.gain.value = 0.1;
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
      } catch {}
    } catch (err) {
      const isDuplicate = err.response?.data?.duplicate;
      const result = {
        type: isDuplicate ? 'duplicate' : 'error',
        message: err.response?.data?.message || 'Scan failed',
        timestamp: new Date().toLocaleTimeString(),
      };

      setLastScan(result);
      setScanResults((prev) => [result, ...prev].slice(0, 50));

      if (isDuplicate) {
        toast(err.response.data.message, { icon: '⚠️' });
      } else {
        toast.error(err.response?.data?.message || 'Scan error');
      }
    } finally {
      // Cooldown to prevent rapid duplicate scans
      setTimeout(() => {
        processingRef.current = false;
      }, 1500);
    }
  };

  const effectiveSlot = todaySlots.find((s) => s._id === selectedSlot) || currentLecture || activeSlots[0] || null;
  const isActiveNow = effectiveSlot && activeSlots.some((s) => s._id === effectiveSlot._id);

  return (
    <div className="scanner-container">
      {/* Current / Selected Lecture Info Card */}
      {effectiveSlot ? (
        <div
          className="current-lecture-card"
          style={{
            borderColor: isActiveNow ? 'rgba(16,185,129,0.3)' : 'rgba(99,102,241,0.3)',
            background: isActiveNow ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.08)',
          }}
        >
          <div
            className="lecture-icon"
            style={{
              background: isActiveNow
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            }}
          >
            <HiOutlineBookOpen />
          </div>
          <div className="current-lecture-info" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h3>{effectiveSlot.subject}</h3>
              <span
                className={`badge ${isActiveNow ? 'badge-present' : 'badge-late'}`}
                style={{ fontSize: 10, padding: '2px 8px' }}
              >
                {isActiveNow ? '● In Session Now' : '● Manually Selected'}
              </span>
            </div>
            <p>
              {effectiveSlot.startTime} – {effectiveSlot.endTime} • Room{' '}
              {effectiveSlot.room || 'Main'} • {effectiveSlot.className}-{effectiveSlot.section}
              {effectiveSlot.teacher?.name && ` • 👨‍🏫 ${effectiveSlot.teacher.name}`}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => loadCurrentLecture(true)}
            title="Re-check current lecture"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <HiOutlineArrowPath /> Re-check
          </button>
        </div>
      ) : (
        <div className="current-lecture-card" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.08)' }}>
          <div className="lecture-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
            <HiOutlineExclamationTriangle />
          </div>
          <div className="current-lecture-info" style={{ flex: 1 }}>
            <h3>No lecture slot selected</h3>
            <p>Select a timetable slot below to record attendance</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => loadCurrentLecture(true)}
            title="Re-check current lecture"
            style={{ padding: '6px 12px', fontSize: 12 }}
          >
            <HiOutlineArrowPath /> Re-check
          </button>
        </div>
      )}

      {/* Coinciding / Multiple Active Lectures Quick Switcher */}
      {activeSlots.length > 1 && (
        <div style={{ marginBottom: 16, padding: '12px 16px', background: 'rgba(99,102,241,0.06)', borderRadius: 12, border: '1px solid rgba(99,102,241,0.15)' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>
            ⚡ {activeSlots.length} Coinciding Lectures in Session Right Now — Quick Select:
          </div>
          <div className="flex gap-2 flex-wrap">
            {activeSlots.map((slot) => {
              const isChosen = selectedSlot === slot._id;
              return (
                <button
                  key={slot._id}
                  type="button"
                  className={`btn btn-sm ${isChosen ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedSlot(slot._id)}
                  style={{ fontSize: 12 }}
                >
                  {isChosen ? '✓ ' : ''}{slot.subject} ({slot.startTime}–{slot.endTime} • {slot.className}-{slot.section})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Lecture Slot Selector */}
      {todaySlots.length > 0 && (
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Target Lecture Slot (Select to Mark Attendance)</span>
            <span style={{ fontSize: 11, color: 'var(--accent-primary)', fontWeight: 600 }}>
              {effectiveSlot ? `Marking for: ${effectiveSlot.subject} (${effectiveSlot.className}-${effectiveSlot.section})` : 'Choose slot'}
            </span>
          </label>
          <select
            className="form-select"
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
          >
            {todaySlots.map((slot) => {
              const active = activeSlots.some((a) => a._id === slot._id);
              return (
                <option key={slot._id} value={slot._id}>
                  {active ? '🟢 [IN SESSION] ' : '🕒 '}
                  {slot.subject} | {slot.startTime}–{slot.endTime} | {slot.className}-{slot.section} | Room {slot.room || '—'}
                  {slot.teacher?.name ? ` (${slot.teacher.name})` : ''}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {/* Scanner Viewport */}
      <div className="scanner-viewport">
        <div id="qr-reader" style={{ width: '100%' }} />
        {!scanning && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 12,
              color: 'var(--text-muted)',
            }}
          >
            <HiOutlineVideoCamera style={{ fontSize: 48, opacity: 0.4 }} />
            <span style={{ fontSize: 14 }}>Camera preview will appear here</span>
          </div>
        )}
      </div>

      {/* Scanner Controls */}
      <div className="scanner-info">
        <div className={`scanner-status ${scanning ? 'scanning' : 'idle'}`}>
          <span
            className="header-badge-dot"
            style={{ background: scanning ? 'var(--color-success)' : 'var(--text-muted)' }}
          />
          {scanning ? 'Scanning...' : 'Scanner idle'}
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 12 }}>
          {!scanning ? (
            <button className="btn btn-primary btn-lg" onClick={startScanning} id="start-scanner-btn">
              <HiOutlineQrCode /> Start Camera Scanner
            </button>
          ) : (
            <button className="btn btn-danger btn-lg" onClick={stopScanning} id="stop-scanner-btn">
              <HiOutlineStopCircle /> Stop Scanner
            </button>
          )}
        </div>
      </div>

      {/* QR Simulation / Direct ID Scan */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px 20px',
          marginTop: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div className="flex items-center gap-2">
            <HiOutlineBolt style={{ color: 'var(--accent-primary)', fontSize: 18 }} />
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              QR Scanner Simulator & Quick Test
            </span>
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Simulates optical QR card detection
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!simulatedId.trim()) return;
            onScanSuccess(simulatedId.trim());
            setSimulatedId('');
          }}
          style={{ display: 'flex', gap: 10, alignItems: 'center' }}
        >
          <input
            type="text"
            className="form-input"
            placeholder="Enter Student ID (e.g. STU2024001)"
            value={simulatedId}
            onChange={(e) => setSimulatedId(e.target.value)}
            style={{ flex: 1, fontFamily: 'monospace' }}
            id="manual-qr-input"
          />
          <button type="submit" className="btn btn-primary" id="simulate-scan-btn">
            <HiOutlineBolt /> Simulate Scan
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Quick sample IDs:</span>
          {SAMPLE_STUDENT_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => onScanSuccess(id)}
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                padding: '3px 8px',
                borderColor: 'rgba(99,102,241,0.25)',
              }}
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Last Scan Result */}
      {lastScan && (
        <div className={`scan-result ${lastScan.type}`}>
          <div className="scan-result-icon">
            {lastScan.type === 'success' && <HiOutlineCheckCircle />}
            {lastScan.type === 'error' && <HiOutlineXCircle />}
            {lastScan.type === 'duplicate' && <HiOutlineExclamationTriangle />}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
              {lastScan.message}
            </div>
            {lastScan.data && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {lastScan.data.studentName} • {lastScan.data.rollNumber} •{' '}
                <span className={`badge badge-${lastScan.data.status}`}>{lastScan.data.status}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Scan History */}
      {scanResults.length > 0 && (
        <div className="scan-history">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3>Scan History ({scanResults.length})</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setScanResults([])}>
              Clear
            </button>
          </div>
          <div className="scan-history-list">
            {scanResults.map((result, idx) => (
              <div key={idx} className="scan-history-item">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 16 }}>
                    {result.type === 'success' && '✅'}
                    {result.type === 'error' && '❌'}
                    {result.type === 'duplicate' && '⚠️'}
                  </span>
                  <span className="name">
                    {result.data?.studentName || result.message}
                  </span>
                  {result.data?.status && (
                    <span className={`badge badge-${result.data.status}`}>{result.data.status}</span>
                  )}
                </div>
                <span className="time">{result.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Scanner;
