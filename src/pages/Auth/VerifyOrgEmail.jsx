import React, { useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import axiosInstance from '../../api/axiosConfig';
import AuthLayout from '../../components/common/Layout/AuthLayout';

const VerifyOrgEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Verifying your organization email...');
  const [resendStatus, setResendStatus] = useState('idle');
  const [orgCode, setOrgCode] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Verification token missing. You can resend using your org code and email.');
      return;
    }

    const verify = async () => {
      try {
        await axiosInstance.get('/org/verify-email', {
          params: { token },
          suppressToast: true
        });
        setStatus('success');
        setMessage('Organization email verified successfully.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed or link expired.');
      }
    };

    verify();
  }, [searchParams]);

  const handleResend = async () => {
    setResendStatus('loading');
    try {
      await axiosInstance.post('/org/resend-verify-email', {
        orgCode,
        email
      }, { suppressToast: true });
      setResendStatus('success');
    } catch (error) {
      setResendStatus('error');
      setMessage(error.response?.data?.message || 'Unable to resend verification email.');
    }
  };

  return (
    <AuthLayout>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: 520, width: '100%', padding: '2.5rem', borderRadius: 16, background: '#fff', boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {status === 'success' ? (
              <CheckCircle size={28} color="#16a34a" />
            ) : (
              <AlertTriangle size={28} color={status === 'loading' ? '#0f172a' : '#dc2626'} />
            )}
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
              {status === 'success' ? 'Email Verified' : status === 'loading' ? 'Verifying' : 'Verification Failed'}
            </h1>
          </div>
          <p style={{ color: '#475569', lineHeight: 1.6 }}>{message}</p>
          <div style={{ marginTop: 24 }}>
            <RouterLink to="/login" style={{ display: 'inline-block', padding: '0.75rem 1.5rem', background: '#4f46e5', color: '#fff', borderRadius: 10, textDecoration: 'none', fontWeight: 600 }}>
              Go to Login
            </RouterLink>
          </div>
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
              <input
                type="text"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                placeholder="Organization code"
                style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Organization email"
                style={{ padding: '0.7rem 1rem', borderRadius: 10, border: '1px solid #e2e8f0' }}
              />
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'loading' || !orgCode.trim() || !email.trim()}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: 10,
                border: '1px solid #cbd5f5',
                background: '#eef2ff',
                color: '#4338ca',
                fontWeight: 600,
                cursor: resendStatus === 'loading' ? 'not-allowed' : 'pointer'
              }}
            >
              {resendStatus === 'loading' ? 'Resending...' : 'Resend verification email'}
            </button>
            {resendStatus === 'success' && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#16a34a' }}>
                Verification email sent. Check your inbox.
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default VerifyOrgEmail;
