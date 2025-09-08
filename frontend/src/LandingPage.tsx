import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Modern Landing Page Component
const LandingPage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [counters, setCounters] = useState({
    influencers: 0,
    brands: 0,
    campaigns: 0,
    revenue: 0
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animate counters when they come into view
  useEffect(() => {
    const timer = setTimeout(() => {
      setCounters({
        influencers: 50000,
        brands: 1200,
        campaigns: 8500,
        revenue: 25
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: scrollY > 50 ? 'rgba(255, 255, 255, 0.98)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 1000,
        borderBottom: scrollY > 50 ? '1px solid rgba(0,0,0,0.05)' : 'none'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px'
          }}>
            Influencelytic
          </div>
          <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
            <a href="#features" style={{ 
              color: scrollY > 50 ? '#4a5568' : 'white', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'color 0.3s'
            }}>Features</a>
            <a href="#how-it-works" style={{ 
              color: scrollY > 50 ? '#4a5568' : 'white', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'color 0.3s'
            }}>How it Works</a>
            <a href="#pricing" style={{ 
              color: scrollY > 50 ? '#4a5568' : 'white', 
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '500',
              transition: 'color 0.3s'
            }}>Pricing</a>
            <Link to="/signin" style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              color: scrollY > 50 ? '#667eea' : 'white',
              border: `2px solid ${scrollY > 50 ? '#667eea' : 'white'}`,
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}>Sign In</Link>
            <Link to="/signup" style={{
              padding: '10px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
              transition: 'transform 0.3s'
            }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background elements */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            borderRadius: '50%',
            top: '10%',
            left: '-5%',
            animation: 'float 6s ease-in-out infinite'
          }} />
          <div style={{
            position: 'absolute',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)',
            borderRadius: '50%',
            bottom: '20%',
            right: '-5%',
            animation: 'float 8s ease-in-out infinite reverse'
          }} />
        </div>

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '120px 40px 80px',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '80px',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                fontSize: '56px',
                fontWeight: '800',
                color: 'white',
                lineHeight: '1.1',
                marginBottom: '24px',
                letterSpacing: '-1px'
              }}>
                Connect Brands with
                <span style={{
                  display: 'block',
                  background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}> Perfect Influencers</span>
              </h1>
              <p style={{
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: '1.6',
                marginBottom: '40px'
              }}>
                AI-powered influencer marketing platform that matches brands with authentic creators. 
                Streamline your campaigns, track performance, and maximize ROI.
              </p>
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <Link to="/signup" style={{
                  padding: '16px 32px',
                  backgroundColor: 'white',
                  color: '#667eea',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontSize: '18px',
                  fontWeight: '700',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 40px rgba(0,0,0,0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
                }}>
                  Start Free Trial
                </Link>
                <button style={{
                  padding: '16px 32px',
                  backgroundColor: 'transparent',
                  color: 'white',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}>
                  Watch Demo →
                </button>
              </div>
              <div style={{
                marginTop: '48px',
                display: 'flex',
                gap: '40px'
              }}>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '4px' }}>Trusted by</p>
                  <p style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>1,200+ Brands</p>
                </div>
                <div>
                  <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px', marginBottom: '4px' }}>Active Creators</p>
                  <p style={{ color: 'white', fontSize: '24px', fontWeight: '700' }}>50,000+</p>
                </div>
              </div>
            </div>
            <div style={{
              position: 'relative',
              height: '500px'
            }}>
              {/* Dashboard Preview */}
              <div style={{
                position: 'absolute',
                top: '0',
                right: '0',
                width: '100%',
                height: '100%',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '20px',
                transform: 'perspective(1000px) rotateY(-15deg)',
                boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
              }}>
                <div style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '12px',
                  height: '100%',
                  padding: '20px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  </div>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ height: '20px', background: 'linear-gradient(90deg, #e5e7eb 30%, #f3f4f6 50%, #e5e7eb 70%)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ height: '20px', width: '70%', background: 'linear-gradient(90deg, #e5e7eb 30%, #f3f4f6 50%, #e5e7eb 70%)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ height: '80px', background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)', borderRadius: '8px' }} />
                    <div style={{ height: '80px', background: 'linear-gradient(135deg, #10b98120 0%, #34d39920 100%)', borderRadius: '8px' }} />
                  </div>
                  <div style={{ height: '120px', background: 'linear-gradient(90deg, #e5e7eb 30%, #f3f4f6 50%, #e5e7eb 70%)', borderRadius: '8px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 40px',
        background: 'white',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '40px'
        }}>
          <StatCounter 
            end={counters.influencers} 
            suffix="+" 
            label="Active Influencers" 
            color="#667eea"
          />
          <StatCounter 
            end={counters.brands} 
            suffix="+" 
            label="Brand Partners" 
            color="#764ba2"
          />
          <StatCounter 
            end={counters.campaigns} 
            suffix="+" 
            label="Campaigns Launched" 
            color="#f59e0b"
          />
          <StatCounter 
            end={counters.revenue} 
            prefix="$" 
            suffix="M+" 
            label="Creator Earnings" 
            color="#10b981"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{
        padding: '100px 40px',
        background: 'linear-gradient(180deg, #ffffff 0%, #f9fafb 100%)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #667eea20 0%, #764ba220 100%)',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#667eea',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Features</span>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '800',
              marginTop: '20px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Everything you need to succeed
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#718096',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Our platform provides all the tools and insights you need to run successful influencer marketing campaigns
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '30px'
          }}>
            <FeatureCard
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              icon="🤖"
              title="AI-Powered Matching"
              description="Our advanced algorithm analyzes millions of data points to find the perfect influencer-brand matches"
            />
            <FeatureCard
              gradient="linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
              icon="📊"
              title="Real-time Analytics"
              description="Track campaign performance, engagement rates, and ROI with comprehensive real-time dashboards"
            />
            <FeatureCard
              gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
              icon="💰"
              title="Secure Payments"
              description="Built-in escrow system ensures safe and timely payments for all parties involved"
            />
            <FeatureCard
              gradient="linear-gradient(135deg, #ec4899 0%, #be185d 100%)"
              icon="📱"
              title="Multi-Platform Support"
              description="Connect and manage campaigns across Instagram, TikTok, YouTube, and more from one dashboard"
            />
            <FeatureCard
              gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
              icon="📈"
              title="Campaign Management"
              description="Create, launch, and manage multiple campaigns with automated workflows and approval systems"
            />
            <FeatureCard
              gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
              icon="🎯"
              title="Audience Insights"
              description="Deep demographic and psychographic insights to ensure your message reaches the right audience"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{
        padding: '100px 40px',
        background: 'white'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <span style={{
              padding: '8px 20px',
              background: 'linear-gradient(135deg, #f59e0b20 0%, #f9731620 100%)',
              borderRadius: '100px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#f59e0b',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>Process</span>
            <h2 style={{
              fontSize: '48px',
              fontWeight: '800',
              marginTop: '20px',
              marginBottom: '20px',
              background: 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              How it works
            </h2>
            <p style={{
              fontSize: '20px',
              color: '#718096',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Get started in minutes and launch your first campaign today
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '30px',
            position: 'relative'
          }}>
            {/* Connection line */}
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '15%',
              right: '15%',
              height: '2px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 50%, #f59e0b 100%)',
              zIndex: 0
            }} />
            
            <ProcessStep number="01" title="Sign Up" description="Create your account as a brand or influencer in less than 60 seconds" />
            <ProcessStep number="02" title="Set Up Profile" description="Complete your profile with campaign goals or creator portfolio" />
            <ProcessStep number="03" title="Get Matched" description="Our AI finds perfect matches based on your requirements and audience" />
            <ProcessStep number="04" title="Start Collaborating" description="Launch campaigns, create content, and track performance in real-time" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 40px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)" /%3E%3C/svg%3E")',
          opacity: 0.3
        }} />
        
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          <h2 style={{
            fontSize: '48px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '24px'
          }}>
            Ready to transform your influencer marketing?
          </h2>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: '40px',
            lineHeight: '1.6'
          }}>
            Join thousands of brands and creators already growing with Influencelytic
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <Link to="/signup" style={{
              padding: '16px 40px',
              backgroundColor: 'white',
              color: '#667eea',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '18px',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
              Start Free Trial
            </Link>
            <button style={{
              padding: '16px 40px',
              backgroundColor: 'transparent',
              color: 'white',
              border: '2px solid white',
              borderRadius: '12px',
              fontSize: '18px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              Schedule Demo
            </button>
          </div>
          <p style={{
            marginTop: '24px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '14px'
          }}>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '60px 40px 40px',
        backgroundColor: '#1a202c',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '40px',
            marginBottom: '40px'
          }}>
            <div style={{ gridColumn: 'span 2' }}>
              <h3 style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '16px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Influencelytic
              </h3>
              <p style={{
                color: '#a0aec0',
                lineHeight: '1.6',
                marginBottom: '24px'
              }}>
                The leading AI-powered platform connecting brands with authentic influencers for impactful marketing campaigns.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                {['twitter', 'linkedin', 'instagram', 'youtube'].map(social => (
                  <a key={social} href="#" style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'background-color 0.3s'
                  }}>
                    <span style={{ fontSize: '20px' }}>
                      {social === 'twitter' && '𝕏'}
                      {social === 'linkedin' && 'in'}
                      {social === 'instagram' && '📷'}
                      {social === 'youtube' && '▶'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#a0aec0', textTransform: 'uppercase' }}>Product</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Features</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Pricing</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>API</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#a0aec0', textTransform: 'uppercase' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>About</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Blog</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Careers</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px', color: '#a0aec0', textTransform: 'uppercase' }}>Support</h4>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Help Center</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Terms</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Privacy</a></li>
                <li style={{ marginBottom: '12px' }}><a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>Status</a></li>
              </ul>
            </div>
          </div>
          
          <div style={{
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p style={{ color: '#718096', fontSize: '14px' }}>
              © 2024 Influencelytic. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '24px' }}>
              <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>Privacy Policy</a>
              <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>Terms of Service</a>
              <a href="#" style={{ color: '#718096', textDecoration: 'none', fontSize: '14px' }}>Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Demo Badge */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        backgroundColor: '#1a202c',
        color: 'white',
        padding: '16px 20px',
        borderRadius: '12px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: 999,
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <p style={{ fontSize: '12px', marginBottom: '8px', opacity: 0.8 }}>🔐 Demo Credentials</p>
        <p style={{ fontSize: '11px', marginBottom: '4px' }}>
          <strong>Brand:</strong> nike@test.com / Test123!
        </p>
        <p style={{ fontSize: '11px' }}>
          <strong>Creator:</strong> fitness@test.com / Test123!
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
};

// Stat Counter Component
const StatCounter = ({ end, prefix = '', suffix = '', label, color }: any) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepValue = end / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [end]);

  return (
    <div style={{ textAlign: 'center' }}>
      <h3 style={{
        fontSize: '48px',
        fontWeight: '800',
        color,
        marginBottom: '8px'
      }}>
        {prefix}{count.toLocaleString()}{suffix}
      </h3>
      <p style={{
        fontSize: '16px',
        color: '#718096',
        fontWeight: '500'
      }}>
        {label}
      </p>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ gradient, icon, title, description }: any) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.1)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)';
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: gradient
    }} />
    <div style={{
      width: '56px',
      height: '56px',
      borderRadius: '12px',
      background: gradient,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      marginBottom: '20px',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)'
    }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '12px',
      color: '#1a202c'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '15px',
      color: '#718096',
      lineHeight: '1.6'
    }}>
      {description}
    </p>
  </div>
);

// Process Step Component
const ProcessStep = ({ number, title, description }: any) => (
  <div style={{
    textAlign: 'center',
    position: 'relative',
    zIndex: 1
  }}>
    <div style={{
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 24px',
      boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
      position: 'relative'
    }}>
      <span style={{
        fontSize: '24px',
        fontWeight: '800',
        color: 'white'
      }}>
        {number}
      </span>
      <div style={{
        position: 'absolute',
        width: '90px',
        height: '90px',
        borderRadius: '50%',
        border: '2px solid #667eea20',
        top: '-5px',
        left: '-5px'
      }} />
    </div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '700',
      marginBottom: '12px',
      color: '#1a202c'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '15px',
      color: '#718096',
      lineHeight: '1.5'
    }}>
      {description}
    </p>
  </div>
);

export default LandingPage;