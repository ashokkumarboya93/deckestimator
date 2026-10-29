// =============================================
// DECK PRO — Registration Form Component
// =============================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../../../api/apiErrors';

export function RegistrationForm() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer',
    businessName: '',
    licenseNumber: '',
    licenseJurisdiction: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role,
      };

      if (formData.role === 'contractor') {
        payload.businessName = formData.businessName;
        payload.licenseNumber = formData.licenseNumber;
        payload.licenseJurisdiction = formData.licenseJurisdiction;
      }

      const data = await register(payload);

      if (data.user.role === 'contractor') {
        navigate('/contractor/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '460px',
        margin: '2rem auto',
        padding: '2rem',
        background: '#fff',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      }}
    >
      <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        Create an Account
      </h2>

      {error && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            background: '#fee2e2',
            color: '#b91c1c',
            borderRadius: '4px',
            fontSize: '0.875rem',
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Account Type
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="customer"
                checked={formData.role === 'customer'}
                onChange={handleChange}
              />
              Customer
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="role"
                value="contractor"
                checked={formData.role === 'contractor'}
                onChange={handleChange}
              />
              Contractor
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            placeholder="Jane Doe"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Email Address
          </label>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            placeholder="jane@example.com"
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            placeholder="(555) 000-0000"
          />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            placeholder="At least 8 characters"
          />
        </div>

        {formData.role === 'contractor' && (
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginBottom: '1rem' }}>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.95rem', color: '#1e293b' }}>
              Contractor Business Information
            </h4>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                Business Name
              </label>
              <input
                type="text"
                name="businessName"
                required
                value={formData.businessName}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                required
                value={formData.licenseNumber}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                License Jurisdiction (e.g. State)
              </label>
              <input
                type="text"
                name="licenseJurisdiction"
                value={formData.licenseJurisdiction}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            padding: '0.75rem',
            background: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Registering...' : 'Create Account'}
        </button>
      </form>

      <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
        Already have an account?{' '}
        <Link to="/login" style={{ color: '#2563eb', fontWeight: '500' }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
