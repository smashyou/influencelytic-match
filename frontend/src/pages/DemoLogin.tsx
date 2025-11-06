import React from 'react';

const DemoLogin = () => {
  const loginAsDemo = (type: 'influencer' | 'brand') => {
    // Create mock user data
    const mockUser = {
      id: `demo-${type}-${Date.now()}`,
      email: type === 'influencer' ? 'fitness@test.com' : 'nike@test.com',
      user_metadata: {
        first_name: type === 'influencer' ? 'Fitness' : 'Nike',
        last_name: type === 'influencer' ? 'Guru' : 'Brand',
        user_type: type
      }
    };

    const mockSession = {
      access_token: `demo-token-${Date.now()}`,
      refresh_token: `demo-refresh-${Date.now()}`,
      expires_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      user: mockUser
    };

    // Store in localStorage
    localStorage.setItem('demo-mode', 'true');
    localStorage.setItem('demo-user', JSON.stringify(mockUser));
    localStorage.setItem('demo-session', JSON.stringify(mockSession));
    localStorage.setItem('token', mockSession.access_token);

    // Navigate to dashboard
    const dashboardPath = type === 'brand' ? '/brand-dashboard' : '/dashboard';
    window.location.href = dashboardPath;
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #f3e8ff, #dbeafe)',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '40px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
            🎭 Development Demo Access
          </h1>
          <p style={{ fontSize: '18px', color: '#666' }}>
            Skip authentication and access the dashboard directly
          </p>
        </div>

        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '30px'
        }}>
          <p style={{ fontSize: '14px', color: '#92400e' }}>
            <strong>Development Mode:</strong> This page bypasses authentication entirely.
            In production, users would need to sign up/login normally.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* Influencer Demo */}
          <div style={{
            border: '2px solid #ddd6fe',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#f3e8ff',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              👤
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Influencer Dashboard
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Access as: Fitness Guru
            </p>
            <button
              onClick={() => loginAsDemo('influencer')}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#6d28d9'}
              onMouseOut={(e) => e.currentTarget.style.background = '#7c3aed'}
            >
              Enter as Influencer
            </button>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', fontFamily: 'monospace' }}>
              fitness@test.com
            </p>
          </div>

          {/* Brand Demo */}
          <div style={{
            border: '2px solid #bfdbfe',
            borderRadius: '8px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              background: '#dbeafe',
              borderRadius: '50%',
              margin: '0 auto 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px'
            }}>
              💼
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>
              Brand Dashboard
            </h3>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              Access as: Nike Brand
            </p>
            <button
              onClick={() => loginAsDemo('brand')}
              style={{
                width: '100%',
                padding: '12px 24px',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              Enter as Brand
            </button>
            <p style={{ fontSize: '12px', color: '#999', marginTop: '10px', fontFamily: 'monospace' }}>
              nike@test.com
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <h4 style={{ fontWeight: '600', marginBottom: '15px' }}>What You'll Get Access To:</h4>
          <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#666' }}>
            <li style={{ marginBottom: '10px' }}>✓ <strong>Post Performance Analysis</strong> - AI-powered insights into your best content</li>
            <li style={{ marginBottom: '10px' }}>✓ <strong>Content Recommendations</strong> - Personalized suggestions based on performance</li>
            <li style={{ marginBottom: '10px' }}>✓ <strong>Growth Tips</strong> - Dynamic strategies to grow your following</li>
            <li style={{ marginBottom: '10px' }}>✓ <strong>Analytics Dashboard</strong> - Comprehensive metrics and insights</li>
            <li style={{ marginBottom: '10px' }}>✓ <strong>Mock Data</strong> - Rich sample data showing all features</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DemoLogin;
