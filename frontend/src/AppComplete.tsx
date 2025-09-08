import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import LandingPage from './LandingPage';

// Icons as simple SVG components
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const CampaignIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M18 3a1 1 0 00-1.447-.894L8.763 6H5a3 3 0 000 6h.28l1.771 5.316A1 1 0 008 18h1a1 1 0 001-1v-4.382l6.553 3.276A1 1 0 0018 15V3z" clipRule="evenodd" />
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
  </svg>
);

const ChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
  </svg>
);

const ConnectIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
  </svg>
);

// Dashboard Layout Component
const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate('/signin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  const navItems = user.type === 'brand' ? [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/campaigns', label: 'Campaigns', icon: <CampaignIcon /> },
    { path: '/discover', label: 'Discover Influencers', icon: <SearchIcon /> },
    { path: '/analytics', label: 'Analytics', icon: <ChartIcon /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon /> },
  ] : [
    { path: '/dashboard', label: 'Dashboard', icon: <HomeIcon /> },
    { path: '/opportunities', label: 'Opportunities', icon: <CampaignIcon /> },
    { path: '/content', label: 'My Content', icon: <ChartIcon /> },
    { path: '/connections', label: 'Connections', icon: <ConnectIcon /> },
    { path: '/profile', label: 'Profile', icon: <UserIcon /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#4f46e5',
            margin: 0
          }}>
            Influencelytic
          </h1>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            marginTop: '4px'
          }}>
            {user.type === 'brand' ? 'Brand Dashboard' : 'Creator Dashboard'}
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 20px',
                color: location.pathname === item.path ? '#4f46e5' : '#6b7280',
                backgroundColor: location.pathname === item.path ? '#ede9fe' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ marginRight: '12px' }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info and logout */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            marginBottom: '12px'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#1f2937',
              margin: '0 0 4px 0'
            }}>
              {user.name}
            </p>
            <p style={{
              fontSize: '12px',
              color: '#6b7280',
              margin: 0
            }}>
              {user.email}
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              color: '#dc2626',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            <LogoutIcon />
            <span style={{ marginLeft: '8px' }}>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
};

// Dashboard Home Page
const DashboardHome = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '8px'
      }}>
        Welcome back, {user.name}!
      </h2>
      <p style={{
        fontSize: '16px',
        color: '#6b7280',
        marginBottom: '32px'
      }}>
        Here's what's happening with your {user.type === 'brand' ? 'campaigns' : 'collaborations'} today.
      </p>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {user.type === 'brand' ? (
          <>
            <StatCard title="Active Campaigns" value="3" change="+2 this month" color="#10b981" />
            <StatCard title="Total Reach" value="2.4M" change="+15% from last month" color="#3b82f6" />
            <StatCard title="Engagement Rate" value="4.8%" change="+0.3% from last month" color="#8b5cf6" />
            <StatCard title="Influencers" value="47" change="+12 new this week" color="#f59e0b" />
          </>
        ) : (
          <>
            <StatCard title="Followers" value="125K" change="+5.2K this month" color="#10b981" />
            <StatCard title="Engagement Rate" value="6.2%" change="+0.8% from last month" color="#3b82f6" />
            <StatCard title="Active Collabs" value="5" change="2 pending review" color="#8b5cf6" />
            <StatCard title="Earnings" value="$4,250" change="+$1,200 this month" color="#f59e0b" />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '20px'
        }}>
          Recent Activity
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {user.type === 'brand' ? (
            <>
              <ActivityItem
                title="New influencer application"
                description="@fitnessqueen applied for your Summer Collection campaign"
                time="2 hours ago"
                type="application"
              />
              <ActivityItem
                title="Campaign milestone reached"
                description="Nike Air Max campaign reached 1M impressions"
                time="5 hours ago"
                type="milestone"
              />
              <ActivityItem
                title="Content pending review"
                description="3 new posts from influencers await your approval"
                time="1 day ago"
                type="review"
              />
            </>
          ) : (
            <>
              <ActivityItem
                title="New brand opportunity"
                description="Nike invited you to their Summer Collection campaign"
                time="3 hours ago"
                type="opportunity"
              />
              <ActivityItem
                title="Content approved"
                description="Your Instagram post for Adidas was approved"
                time="6 hours ago"
                type="approved"
              />
              <ActivityItem
                title="Payment received"
                description="$850 payment from Puma collaboration"
                time="2 days ago"
                type="payment"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, change, color }: any) => (
  <div style={{
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <p style={{
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '8px'
    }}>
      {title}
    </p>
    <p style={{
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '8px'
    }}>
      {value}
    </p>
    <p style={{
      fontSize: '14px',
      color,
      fontWeight: '500'
    }}>
      {change}
    </p>
  </div>
);

// Activity Item Component
const ActivityItem = ({ title, description, time, type }: any) => {
  const getTypeColor = () => {
    switch (type) {
      case 'application':
      case 'opportunity':
        return '#3b82f6';
      case 'milestone':
      case 'approved':
        return '#10b981';
      case 'review':
        return '#f59e0b';
      case 'payment':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      padding: '16px',
      backgroundColor: '#f9fafb',
      borderRadius: '8px'
    }}>
      <div style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: getTypeColor(),
        marginTop: '6px'
      }} />
      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '16px',
          fontWeight: '500',
          color: '#1f2937',
          marginBottom: '4px'
        }}>
          {title}
        </p>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '4px'
        }}>
          {description}
        </p>
        <p style={{
          fontSize: '12px',
          color: '#9ca3af'
        }}>
          {time}
        </p>
      </div>
    </div>
  );
};

// Campaigns Page (for brands)
const CampaignsPage = () => {
  const campaigns = [
    {
      id: 1,
      name: 'Summer Collection 2024',
      status: 'Active',
      budget: '$10,000',
      influencers: 12,
      reach: '500K',
      endDate: '2024-08-31'
    },
    {
      id: 2,
      name: 'Back to School',
      status: 'Planning',
      budget: '$5,000',
      influencers: 0,
      reach: '0',
      endDate: '2024-09-15'
    },
    {
      id: 3,
      name: 'Holiday Special',
      status: 'Completed',
      budget: '$15,000',
      influencers: 25,
      reach: '1.2M',
      endDate: '2024-01-07'
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <h2 style={{
          fontSize: '32px',
          fontWeight: 'bold',
          color: '#1f2937'
        }}>
          Campaigns
        </h2>
        <button style={{
          padding: '12px 24px',
          backgroundColor: '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          + New Campaign
        </button>
      </div>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Campaign</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Budget</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Influencers</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Reach</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>End Date</th>
              <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{campaign.name}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: campaign.status === 'Active' ? '#d1fae5' : campaign.status === 'Planning' ? '#dbeafe' : '#e5e7eb',
                    color: campaign.status === 'Active' ? '#065f46' : campaign.status === 'Planning' ? '#1e40af' : '#6b7280'
                  }}>
                    {campaign.status}
                  </span>
                </td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{campaign.budget}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{campaign.influencers}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{campaign.reach}</td>
                <td style={{ padding: '16px', fontSize: '14px', color: '#6b7280' }}>{campaign.endDate}</td>
                <td style={{ padding: '16px' }}>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: 'transparent',
                    color: '#4f46e5',
                    border: '1px solid #4f46e5',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Discover Influencers Page
const DiscoverPage = () => {
  const influencers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      handle: '@sarahfit',
      followers: '125K',
      engagement: '6.2%',
      category: 'Fitness',
      avatar: '👩‍🦰'
    },
    {
      id: 2,
      name: 'Mike Chen',
      handle: '@foodiemike',
      followers: '89K',
      engagement: '5.8%',
      category: 'Food',
      avatar: '👨‍🍳'
    },
    {
      id: 3,
      name: 'Emily Rose',
      handle: '@emilybeauty',
      followers: '203K',
      engagement: '7.1%',
      category: 'Beauty',
      avatar: '💄'
    },
    {
      id: 4,
      name: 'Alex Turner',
      handle: '@techwithalex',
      followers: '67K',
      engagement: '4.9%',
      category: 'Technology',
      avatar: '💻'
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '32px'
      }}>
        Discover Influencers
      </h2>

      {/* Search and Filters */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          marginBottom: '16px'
        }}>
          <input
            type="text"
            placeholder="Search influencers..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Search
          </button>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}>
            <option>All Categories</option>
            <option>Fitness</option>
            <option>Food</option>
            <option>Beauty</option>
            <option>Technology</option>
            <option>Fashion</option>
          </select>
          <select style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}>
            <option>Any Followers</option>
            <option>10K - 50K</option>
            <option>50K - 100K</option>
            <option>100K - 500K</option>
            <option>500K+</option>
          </select>
          <select style={{
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}>
            <option>Any Engagement</option>
            <option>2% - 4%</option>
            <option>4% - 6%</option>
            <option>6% - 8%</option>
            <option>8%+</option>
          </select>
        </div>
      </div>

      {/* Influencer Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {influencers.map((influencer) => (
          <div key={influencer.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s',
            cursor: 'pointer'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginRight: '16px'
              }}>
                {influencer.avatar}
              </div>
              <div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {influencer.name}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  {influencer.handle}
                </p>
              </div>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Followers</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{influencer.followers}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Engagement</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{influencer.engagement}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Category</p>
                <p style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{influencer.category}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Invite
              </button>
              <button style={{
                flex: 1,
                padding: '8px',
                backgroundColor: 'transparent',
                color: '#4f46e5',
                border: '1px solid #4f46e5',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                View Profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Opportunities Page (for influencers)
const OpportunitiesPage = () => {
  const opportunities = [
    {
      id: 1,
      brand: 'Nike',
      campaign: 'Summer Athletics Collection',
      budget: '$2,000 - $5,000',
      requirements: '50K+ followers, Sports/Fitness niche',
      deadline: '2024-03-15',
      status: 'Open'
    },
    {
      id: 2,
      brand: 'Sephora',
      campaign: 'New Makeup Line Launch',
      budget: '$1,500 - $3,000',
      requirements: '30K+ followers, Beauty/Makeup content',
      deadline: '2024-03-20',
      status: 'Applied'
    },
    {
      id: 3,
      brand: 'GoPro',
      campaign: 'Adventure Series',
      budget: '$3,000 - $7,000',
      requirements: '100K+ followers, Travel/Adventure content',
      deadline: '2024-03-10',
      status: 'Open'
    }
  ];

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '32px'
      }}>
        Brand Opportunities
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {opportunities.map((opp) => (
          <div key={opp.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '16px'
            }}>
              <div>
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#1f2937',
                  marginBottom: '4px'
                }}>
                  {opp.campaign}
                </h3>
                <p style={{
                  fontSize: '16px',
                  color: '#4f46e5',
                  fontWeight: '500'
                }}>
                  {opp.brand}
                </p>
              </div>
              <span style={{
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: opp.status === 'Applied' ? '#fef3c7' : '#d1fae5',
                color: opp.status === 'Applied' ? '#92400e' : '#065f46'
              }}>
                {opp.status}
              </span>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '20px'
            }}>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Budget Range</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{opp.budget}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Requirements</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{opp.requirements}</p>
              </div>
              <div>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Application Deadline</p>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{opp.deadline}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {opp.status === 'Open' ? (
                <button style={{
                  padding: '10px 20px',
                  backgroundColor: '#4f46e5',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                  Apply Now
                </button>
              ) : (
                <button style={{
                  padding: '10px 20px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'not-allowed'
                }} disabled>
                  Already Applied
                </button>
              )}
              <button style={{
                padding: '10px 20px',
                backgroundColor: 'transparent',
                color: '#4f46e5',
                border: '1px solid #4f46e5',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Page
const ProfilePage = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  if (!user) return null;

  return (
    <div style={{ padding: '32px' }}>
      <h2 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: '32px'
      }}>
        Profile Settings
      </h2>

      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '24px'
        }}>
          Account Information
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Name
            </label>
            <input
              type="text"
              value={user.name}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              readOnly
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={user.email}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              readOnly
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Account Type
            </label>
            <input
              type="text"
              value={user.type === 'brand' ? 'Brand/Business' : 'Influencer/Creator'}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              readOnly
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Account ID
            </label>
            <input
              type="text"
              value={user.id}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
              readOnly
            />
          </div>
        </div>
        <div style={{
          marginTop: '32px',
          paddingTop: '32px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button style={{
            padding: '12px 24px',
            backgroundColor: '#4f46e5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            marginRight: '12px'
          }}>
            Save Changes
          </button>
          <button style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// Analytics Page
const AnalyticsPage = () => (
  <div style={{ padding: '32px' }}>
    <h2 style={{
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '32px'
    }}>
      Analytics & Reports
    </h2>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }}>
      <ChartIcon />
      <p style={{
        fontSize: '18px',
        color: '#6b7280',
        marginTop: '16px'
      }}>
        Analytics dashboard coming soon...
      </p>
    </div>
  </div>
);

// Connections Page (for influencers)
const ConnectionsPage = () => (
  <div style={{ padding: '32px' }}>
    <h2 style={{
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '32px'
    }}>
      Social Media Connections
    </h2>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <ConnectionItem platform="Instagram" status="Connected" handle="@fitnessqueen" />
        <ConnectionItem platform="TikTok" status="Connect" handle="" />
        <ConnectionItem platform="YouTube" status="Connect" handle="" />
        <ConnectionItem platform="Twitter" status="Connect" handle="" />
      </div>
    </div>
  </div>
);

const ConnectionItem = ({ platform, status, handle }: any) => (
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  }}>
    <div>
      <p style={{
        fontSize: '16px',
        fontWeight: '500',
        color: '#1f2937',
        marginBottom: '4px'
      }}>
        {platform}
      </p>
      {handle && (
        <p style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          {handle}
        </p>
      )}
    </div>
    <button style={{
      padding: '8px 16px',
      backgroundColor: status === 'Connected' ? '#d1fae5' : '#4f46e5',
      color: status === 'Connected' ? '#065f46' : 'white',
      border: 'none',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer'
    }}>
      {status}
    </button>
  </div>
);

// Content Page (for influencers)
const ContentPage = () => (
  <div style={{ padding: '32px' }}>
    <h2 style={{
      fontSize: '32px',
      fontWeight: 'bold',
      color: '#1f2937',
      marginBottom: '32px'
    }}>
      My Content
    </h2>
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }}>
      <p style={{
        fontSize: '18px',
        color: '#6b7280'
      }}>
        Content management coming soon...
      </p>
    </div>
  </div>
);

// Sign In Component
const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/auth/mock/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Failed to connect to server. Make sure backend is running.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        margin: '20px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#1a202c'
        }}>
          Sign In to Influencelytic
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            borderRadius: '6px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ color: '#4f46e5', textDecoration: 'none' }}>
            Sign up
          </Link>
        </div>

        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Link to="/" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>

        <div style={{
          backgroundColor: '#fef3c7',
          padding: '12px',
          borderRadius: '6px',
          marginTop: '20px',
          fontSize: '12px',
          color: '#92400e'
        }}>
          <strong>Test Accounts:</strong><br />
          Brand: nike@test.com / Test123!<br />
          Influencer: fitness@test.com / Test123!
        </div>
      </div>
    </div>
  );
};

// Sign Up Component
const SignUp = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('brand');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Sign up attempt:', { email, password, userType });
    alert(`Sign up feature coming soon! For now, use the test accounts to sign in.`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        maxWidth: '400px',
        width: '100%',
        margin: '20px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          textAlign: 'center',
          marginBottom: '30px',
          color: '#1a202c'
        }}>
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              I am a...
            </label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="brand">Brand/Business</option>
              <option value="influencer">Influencer/Creator</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Sign Up
          </button>
        </form>

        <div style={{
          marginTop: '20px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Already have an account?{' '}
          <Link to="/signin" style={{ color: '#4f46e5', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>

        <div style={{
          marginTop: '20px',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Link to="/" style={{ color: '#6b7280', fontSize: '14px', textDecoration: 'none' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

// Old Landing Page removed - using imported LandingPage from ./LandingPage.tsx
/*
const LandingPageOld = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      overflowX: 'hidden'
    }}>
      // Hero Section
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        // Animated background circles
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          animation: 'float 20s infinite ease-in-out'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-150px',
          right: '-150px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          animation: 'float 25s infinite ease-in-out'
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '24px',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            Welcome to Influencelytic
          </h1>
          <p style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.95)',
            marginBottom: '48px',
            maxWidth: '600px',
            margin: '0 auto 48px'
          }}>
            The AI-Powered Platform Connecting Brands with Perfect Influencers
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link 
              to="/signup" 
              style={{
                padding: '16px 32px',
                backgroundColor: 'white',
                color: '#4f46e5',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '18px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'transform 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Get Started Free
            </Link>
            <Link 
              to="/signin" 
              style={{
                padding: '16px 32px',
                backgroundColor: 'transparent',
                color: 'white',
                border: '2px solid white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '18px',
                transition: 'background-color 0.2s',
                display: 'inline-block'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      // Stats Section
      <div style={{
        padding: '60px 20px',
        backgroundColor: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: 'bold', color: '#4f46e5', marginBottom: '8px' }}>10K+</h3>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Active Influencers</p>
          </div>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: 'bold', color: '#10b981', marginBottom: '8px' }}>500+</h3>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Brand Partners</p>
          </div>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: 'bold', color: '#f59e0b', marginBottom: '8px' }}>95%</h3>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Match Success Rate</p>
          </div>
          <div>
            <h3 style={{ fontSize: '48px', fontWeight: 'bold', color: '#8b5cf6', marginBottom: '8px' }}>$2M+</h3>
            <p style={{ fontSize: '18px', color: '#6b7280' }}>Deals Facilitated</p>
          </div>
        </div>
      </div>

      // Features Section
      <div style={{
        padding: '80px 20px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '16px',
            color: '#1f2937'
          }}>
            Why Choose Influencelytic?
          </h2>
          <p style={{
            fontSize: '20px',
            textAlign: 'center',
            color: '#6b7280',
            marginBottom: '60px',
            maxWidth: '600px',
            margin: '0 auto 60px'
          }}>
            Powerful features designed to streamline your influencer marketing
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            // Feature Cards
            <FeatureCard
              icon="🤖"
              title="AI-Powered Matching"
              description="Our advanced algorithms analyze engagement rates, audience demographics, and content style to find your perfect match"
              color="#4f46e5"
            />
            <FeatureCard
              icon="📊"
              title="Real-Time Analytics"
              description="Track campaign performance, ROI, and engagement metrics with comprehensive dashboards and reporting tools"
              color="#10b981"
            />
            <FeatureCard
              icon="🔐"
              title="Secure Payments"
              description="Built-in escrow system ensures safe transactions and timely payments for all parties involved"
              color="#f59e0b"
            />
            <FeatureCard
              icon="🌍"
              title="Global Reach"
              description="Connect with influencers and brands worldwide across all major social media platforms"
              color="#8b5cf6"
            />
            <FeatureCard
              icon="💬"
              title="Direct Messaging"
              description="Communicate directly with brands or influencers through our integrated messaging system"
              color="#ec4899"
            />
            <FeatureCard
              icon="📱"
              title="Mobile Optimized"
              description="Manage your campaigns and collaborations on the go with our mobile-responsive platform"
              color="#06b6d4"
            />
          </div>
        </div>
      </div>

      // How It Works Section
      <div style={{
        padding: '80px 20px',
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#1f2937'
          }}>
            How It Works
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px'
          }}>
            <StepCard number="1" title="Create Your Profile" description="Sign up and complete your profile with your brand requirements or influencer portfolio" />
            <StepCard number="2" title="Get Matched" description="Our AI analyzes your needs and connects you with the most suitable partners" />
            <StepCard number="3" title="Collaborate" description="Communicate, negotiate terms, and manage campaigns all in one platform" />
            <StepCard number="4" title="Track & Grow" description="Monitor performance metrics and scale your influencer marketing success" />
          </div>
        </div>
      </div>

      // Testimonials Section
      <div style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '40px',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '60px',
            color: '#1f2937'
          }}>
            What Our Users Say
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '30px'
          }}>
            <TestimonialCard
              quote="Influencelytic transformed our marketing strategy. We found amazing influencers who truly understand our brand."
              author="Sarah Johnson"
              role="Marketing Director, TechStart"
              avatar="👩‍💼"
            />
            <TestimonialCard
              quote="As an influencer, this platform helped me connect with brands that align with my values. The process is seamless!"
              author="Mike Chen"
              role="Lifestyle Influencer"
              avatar="👨‍🎨"
            />
            <TestimonialCard
              quote="The AI matching is incredible. It saved us months of research and connected us with perfect brand ambassadors."
              author="Emily Davis"
              role="CEO, Beauty Brand"
              avatar="👩‍🦰"
            />
          </div>
        </div>
      </div>

      // CTA Section
      <div style={{
        padding: '80px 20px',
        background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '40px',
          fontWeight: 'bold',
          color: 'white',
          marginBottom: '24px'
        }}>
          Ready to Get Started?
        </h2>
        <p style={{
          fontSize: '20px',
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '40px',
          maxWidth: '600px',
          margin: '0 auto 40px'
        }}>
          Join thousands of brands and influencers already growing their business with Influencelytic
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link 
            to="/signup" 
            style={{
              padding: '16px 40px',
              backgroundColor: 'white',
              color: '#4f46e5',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '18px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          >
            Start Free Trial
          </Link>
          <a 
            href="#demo" 
            style={{
              padding: '16px 40px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '18px'
            }}
          >
            Watch Demo
          </a>
        </div>
      </div>

      // Footer
      <footer style={{
        padding: '40px 20px',
        backgroundColor: '#1f2937',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px'
        }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>Influencelytic</h3>
            <p style={{ color: '#9ca3af', lineHeight: '1.6' }}>
              The leading platform for influencer marketing, connecting brands with creators worldwide.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Platform</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>For Brands</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>For Influencers</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Pricing</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Case Studies</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>About Us</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Careers</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Blog</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Legal</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Privacy Policy</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Terms of Service</a></li>
              <li style={{ marginBottom: '8px' }}><a href="#" style={{ color: '#9ca3af', textDecoration: 'none' }}>Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        <div style={{
          marginTop: '40px',
          paddingTop: '40px',
          borderTop: '1px solid #374151',
          textAlign: 'center',
          color: '#9ca3af'
        }}>
          <p>© 2024 Influencelytic. All rights reserved.</p>
        </div>
      </footer>

      // Test Mode Banner
      <div style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: '#fef3c7',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        maxWidth: '300px',
        zIndex: 1000
      }}>
        <h4 style={{
          fontWeight: '600',
          marginBottom: '8px',
          color: '#92400e',
          fontSize: '14px'
        }}>
          🔑 Demo Mode Active
        </h4>
        <div style={{ fontSize: '12px', color: '#78350f' }}>
          <p style={{ marginBottom: '4px' }}>
            <strong>Brand:</strong> nike@test.com / Test123!
          </p>
          <p>
            <strong>Influencer:</strong> fitness@test.com / Test123!
          </p>
        </div>
      </div>
    </div>
  );
};
*/

// Commented out old components - using new ones from LandingPage.tsx
/*
// Feature Card Component
const FeatureCardOld = ({ icon, title, description, color }: any) => (
  <div style={{
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      backgroundColor: `${color}20`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px',
      marginBottom: '20px'
    }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#1f2937'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '16px',
      color: '#6b7280',
      lineHeight: '1.6'
    }}>
      {description}
    </p>
  </div>
);

// Step Card Component
const StepCard = ({ number, title, description }: any) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: '#4f46e5',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0 auto 20px'
    }}>
      {number}
    </div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#1f2937'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '16px',
      color: '#6b7280',
      lineHeight: '1.6'
    }}>
      {description}
    </p>
  </div>
);

// Testimonial Card Component
const TestimonialCard = ({ quote, author, role, avatar }: any) => (
  <div style={{
    backgroundColor: 'white',
    padding: '32px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  }}>
    <div style={{
      fontSize: '24px',
      color: '#fbbf24',
      marginBottom: '16px'
    }}>
      ⭐⭐⭐⭐⭐
    </div>
    <p style={{
      fontSize: '16px',
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '24px',
      fontStyle: 'italic'
    }}>
      "{quote}"
    </p>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: '#e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px'
      }}>
        {avatar}
      </div>
      <div>
        <p style={{
          fontWeight: '600',
          color: '#1f2937',
          marginBottom: '2px'
        }}>
          {author}
        </p>
        <p style={{
          fontSize: '14px',
          color: '#6b7280'
        }}>
          {role}
        </p>
      </div>
    </div>
  </div>
);
*/

// Main App Component
const AppComplete = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <DashboardLayout>
            <DashboardHome />
          </DashboardLayout>
        } />
        <Route path="/campaigns" element={
          <DashboardLayout>
            <CampaignsPage />
          </DashboardLayout>
        } />
        <Route path="/discover" element={
          <DashboardLayout>
            <DiscoverPage />
          </DashboardLayout>
        } />
        <Route path="/opportunities" element={
          <DashboardLayout>
            <OpportunitiesPage />
          </DashboardLayout>
        } />
        <Route path="/analytics" element={
          <DashboardLayout>
            <AnalyticsPage />
          </DashboardLayout>
        } />
        <Route path="/connections" element={
          <DashboardLayout>
            <ConnectionsPage />
          </DashboardLayout>
        } />
        <Route path="/content" element={
          <DashboardLayout>
            <ContentPage />
          </DashboardLayout>
        } />
        <Route path="/profile" element={
          <DashboardLayout>
            <ProfilePage />
          </DashboardLayout>
        } />
      </Routes>
    </Router>
  );
};

export default AppComplete;