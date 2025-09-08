// Email Service - Handles all email communications
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const { logger } = require('../lib/logger');

class EmailService {
  constructor() {
    this.provider = process.env.EMAIL_PROVIDER || 'sendgrid';
    
    if (this.provider === 'sendgrid') {
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      this.transporter = null;
    } else {
      // Fallback to SMTP (Gmail, AWS SES, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    this.templates = new Map();
    this.loadTemplates();
  }

  async loadTemplates() {
    const templateDir = path.join(__dirname, '../templates/emails');
    
    try {
      const files = await fs.readdir(templateDir);
      
      for (const file of files) {
        if (file.endsWith('.hbs')) {
          const templateName = file.replace('.hbs', '');
          const templateContent = await fs.readFile(
            path.join(templateDir, file),
            'utf-8'
          );
          this.templates.set(templateName, handlebars.compile(templateContent));
        }
      }
      
      logger.info(`Loaded ${this.templates.size} email templates`);
    } catch (error) {
      logger.error('Failed to load email templates:', error);
    }
  }

  async sendEmail(to, subject, template, data, attachments = []) {
    try {
      const html = this.renderTemplate(template, data);
      
      if (this.provider === 'sendgrid') {
        const msg = {
          to,
          from: {
            email: process.env.FROM_EMAIL,
            name: process.env.FROM_NAME || 'Influencelytic',
          },
          subject,
          html,
          attachments: attachments.map(att => ({
            content: att.content,
            filename: att.filename,
            type: att.type,
            disposition: 'attachment',
          })),
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
        };
        
        await sgMail.send(msg);
      } else {
        // SMTP
        await this.transporter.sendMail({
          from: `"${process.env.FROM_NAME || 'Influencelytic'}" <${process.env.FROM_EMAIL}>`,
          to,
          subject,
          html,
          attachments,
        });
      }
      
      logger.info('Email sent successfully', { to, subject, template });
      
      // Track email metrics
      await this.trackEmailSent(to, template);
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  renderTemplate(templateName, data) {
    const template = this.templates.get(templateName);
    
    if (!template) {
      // Fallback to plain text
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>${data.title || 'Notification'}</h2>
          <p>${data.message || 'You have a new notification from Influencelytic.'}</p>
          <p>Best regards,<br>The Influencelytic Team</p>
        </div>
      `;
    }
    
    // Add common data
    const enrichedData = {
      ...data,
      year: new Date().getFullYear(),
      appUrl: process.env.FRONTEND_URL,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@influencelytic.com',
    };
    
    return template(enrichedData);
  }

  // Email templates for different scenarios
  
  async sendWelcomeEmail(user) {
    const data = {
      firstName: user.first_name,
      role: user.role,
      verificationLink: `${process.env.FRONTEND_URL}/verify-email?token=${user.verification_token}`,
    };
    
    await this.sendEmail(
      user.email,
      'Welcome to Influencelytic!',
      'welcome',
      data
    );
  }

  async sendPasswordResetEmail(user, resetToken) {
    const data = {
      firstName: user.first_name,
      resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      expiresIn: '1 hour',
    };
    
    await this.sendEmail(
      user.email,
      'Reset Your Password',
      'password-reset',
      data
    );
  }

  async sendCampaignApplicationEmail(brand, influencer, campaign, application) {
    const data = {
      brandName: brand.company_name,
      influencerName: `${influencer.first_name} ${influencer.last_name}`,
      influencerUsername: influencer.username,
      campaignTitle: campaign.title,
      proposedRate: application.proposed_rate,
      message: application.message,
      reviewLink: `${process.env.FRONTEND_URL}/campaigns/${campaign.id}/applications`,
    };
    
    await this.sendEmail(
      brand.email,
      `New Application for ${campaign.title}`,
      'campaign-application',
      data
    );
  }

  async sendApplicationStatusEmail(influencer, campaign, status, feedback) {
    const statusMessages = {
      accepted: 'Congratulations! Your application has been accepted.',
      rejected: 'Unfortunately, your application was not selected.',
      completed: 'Campaign completed successfully!',
    };
    
    const data = {
      influencerName: influencer.first_name,
      campaignTitle: campaign.title,
      status,
      statusMessage: statusMessages[status],
      feedback,
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
    };
    
    await this.sendEmail(
      influencer.email,
      `Application Update: ${campaign.title}`,
      'application-status',
      data
    );
  }

  async sendPaymentConfirmationEmail(user, transaction, type = 'received') {
    const data = {
      userName: user.first_name,
      amount: (transaction.amount / 100).toFixed(2),
      currency: transaction.currency.toUpperCase(),
      transactionId: transaction.id,
      date: new Date(transaction.created_at).toLocaleDateString(),
      type, // 'received' or 'sent'
      paymentLink: `${process.env.FRONTEND_URL}/payments/${transaction.id}`,
    };
    
    await this.sendEmail(
      user.email,
      type === 'received' ? 'Payment Received' : 'Payment Sent',
      'payment-confirmation',
      data
    );
  }

  async sendCampaignInviteEmail(influencer, campaign, brand) {
    const data = {
      influencerName: influencer.first_name,
      campaignTitle: campaign.title,
      brandName: brand.company_name,
      budget: campaign.budget,
      category: campaign.category,
      description: campaign.description.substring(0, 200) + '...',
      applyLink: `${process.env.FRONTEND_URL}/campaigns/${campaign.id}/apply`,
    };
    
    await this.sendEmail(
      influencer.email,
      `You're Invited: ${campaign.title}`,
      'campaign-invite',
      data
    );
  }

  async sendWeeklyDigestEmail(user, stats) {
    const data = {
      userName: user.first_name,
      weekStart: stats.weekStart,
      weekEnd: stats.weekEnd,
      newCampaigns: stats.newCampaigns || 0,
      newApplications: stats.newApplications || 0,
      earnings: stats.earnings || 0,
      topCampaigns: stats.topCampaigns || [],
      dashboardLink: `${process.env.FRONTEND_URL}/dashboard`,
    };
    
    await this.sendEmail(
      user.email,
      'Your Weekly Influencelytic Digest',
      'weekly-digest',
      data
    );
  }

  async sendMilestoneEmail(user, milestone) {
    const data = {
      userName: user.first_name,
      milestone: milestone.type,
      value: milestone.value,
      achievement: milestone.achievement,
      celebrationEmoji: milestone.emoji || '🎉',
      shareLink: `${process.env.FRONTEND_URL}/share/milestone/${milestone.id}`,
    };
    
    await this.sendEmail(
      user.email,
      `Milestone Achieved: ${milestone.achievement}`,
      'milestone',
      data
    );
  }

  async sendBulkEmail(recipients, subject, template, commonData) {
    const results = [];
    
    // Process in batches to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(recipient => 
        this.sendEmail(
          recipient.email,
          subject,
          template,
          { ...commonData, ...recipient.data }
        ).catch(error => ({
          email: recipient.email,
          error: error.message,
        }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Rate limiting delay
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }

  async trackEmailSent(to, template) {
    try {
      // Track in database for analytics
      await supabase.from('email_logs').insert({
        recipient: to,
        template,
        sent_at: new Date().toISOString(),
        provider: this.provider,
      });
    } catch (error) {
      logger.error('Failed to track email:', error);
    }
  }

  async handleWebhook(provider, payload) {
    if (provider === 'sendgrid') {
      return this.handleSendGridWebhook(payload);
    }
    // Add other providers as needed
  }

  async handleSendGridWebhook(events) {
    for (const event of events) {
      const { email, event: eventType, timestamp, url, category } = event;
      
      try {
        await supabase.from('email_events').insert({
          email,
          event_type: eventType,
          timestamp: new Date(timestamp * 1000).toISOString(),
          url,
          category: category?.[0],
        });
        
        // Handle specific events
        if (eventType === 'bounce' || eventType === 'dropped') {
          await this.handleBounce(email, event);
        } else if (eventType === 'spam_report') {
          await this.handleSpamReport(email);
        } else if (eventType === 'unsubscribe') {
          await this.handleUnsubscribe(email);
        }
      } catch (error) {
        logger.error('Failed to process email webhook:', error);
      }
    }
  }

  async handleBounce(email, bounceData) {
    // Mark email as invalid
    await supabase
      .from('profiles')
      .update({ email_verified: false, email_bounce: true })
      .eq('email', email);
    
    logger.warn('Email bounced:', { email, reason: bounceData.reason });
  }

  async handleSpamReport(email) {
    // Add to suppression list
    await supabase.from('email_suppressions').insert({
      email,
      reason: 'spam_report',
      created_at: new Date().toISOString(),
    });
    
    logger.warn('Spam report received:', { email });
  }

  async handleUnsubscribe(email) {
    // Update user preferences
    await supabase
      .from('profiles')
      .update({ email_notifications: false })
      .eq('email', email);
    
    logger.info('User unsubscribed:', { email });
  }

  async validateEmail(email) {
    // Basic validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, reason: 'invalid_format' };
    }
    
    // Check suppression list
    const { data: suppression } = await supabase
      .from('email_suppressions')
      .select('reason')
      .eq('email', email)
      .single();
    
    if (suppression) {
      return { valid: false, reason: suppression.reason };
    }
    
    // Check bounce status
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_bounce')
      .eq('email', email)
      .single();
    
    if (profile?.email_bounce) {
      return { valid: false, reason: 'bounced' };
    }
    
    return { valid: true };
  }
}

module.exports = new EmailService();