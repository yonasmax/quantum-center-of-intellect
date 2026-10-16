import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const LAST_UPDATED = 'October 16, 2026';
const CONTACT_EMAIL = 'yonasmolla3@gmail.com';
const BUSINESS_NAME = 'Quantum Center of Intellect';

function PageShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] py-10 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-gradient-to-br from-[#1A365D] to-[#2C4A7C] text-white p-8 rounded-2xl shadow-lg mb-6">
          <Link to="/dashboard" className="text-xs opacity-80 hover:opacity-100">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-3">{title}</h1>
          {subtitle && <p className="text-sm opacity-90 mt-2">{subtitle}</p>}
          <p className="text-xs opacity-70 mt-2">Last updated: {LAST_UPDATED}</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
          {children}
        </div>

        <div className="text-center text-xs text-gray-500 mt-6">
          Questions? Contact us at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#ED8936] hover:underline font-bold">
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-[#1A365D] mb-2">{title}</h2>
      <div className="text-sm text-gray-700 leading-relaxed space-y-2">{children}</div>
    </div>
  );
}

// ???????????????????????????????????????????????????????????
// TERMS OF SERVICE
// ???????????????????????????????????????????????????????????
function Terms() {
  return (
    <PageShell title="Terms of Service" subtitle="Please read carefully before using our platform">
      <Section title="1. Acceptance of Terms">
        <p>
          By accessing or using {BUSINESS_NAME} ("the Platform"), you agree to be bound by these Terms of Service.
          If you do not agree, please do not use the Platform.
        </p>
      </Section>

      <Section title="2. Eligibility">
        <p>
          You must be at least 13 years old to use the Platform. If you are under 18, you must have permission
          from a parent or guardian. By using the Platform, you represent that you meet these requirements.
        </p>
      </Section>

      <Section title="3. User Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. You agree to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide accurate and complete information during registration.</li>
          <li>Not share your account with others.</li>
          <li>Notify us immediately of any unauthorized use.</li>
        </ul>
        <p>We reserve the right to suspend accounts that violate these terms.</p>
      </Section>

      <Section title="4. Content and Intellectual Property">
        <p>
          All lessons, quizzes, diagrams, videos, and other content on the Platform are the property of{' '}
          {BUSINESS_NAME} or its licensors. You may not copy, redistribute, or resell any content without
          written permission.
        </p>
        <p>
          Content you create (such as lesson materials uploaded by teachers) remains your property. By
          uploading, you grant us a license to display and distribute it on the Platform.
        </p>
      </Section>

      <Section title="5. Acceptable Use">
        <p>You agree NOT to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Use the Platform for any illegal purpose.</li>
          <li>Attempt to hack, scrape, or reverse-engineer the Platform.</li>
          <li>Upload viruses, malware, or harmful code.</li>
          <li>Harass, threaten, or impersonate others.</li>
          <li>Bypass payment or access restrictions.</li>
        </ul>
      </Section>

      <Section title="6. Payments and Subscriptions">
        <p>
          During our free public beta, all lessons are free. When paid plans launch:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Subscriptions are billed monthly or yearly via Chapa (Telebirr).</li>
          <li>Prices are subject to change with 30 days' notice.</li>
          <li>See our Refund Policy for cancellation terms.</li>
        </ul>
      </Section>

      <Section title="7. Disclaimers">
        <p>
          The Platform is provided "as is" without warranties of any kind. We do not guarantee that lessons
          will improve exam scores or lead to specific outcomes. Educational content is for learning purposes only.
        </p>
      </Section>

      <Section title="8. Limitation of Liability">
        <p>
          To the maximum extent permitted by Ethiopian law, {BUSINESS_NAME} is not liable for indirect,
          incidental, or consequential damages arising from your use of the Platform.
        </p>
      </Section>

      <Section title="9. Changes to Terms">
        <p>
          We may update these Terms at any time. Continued use of the Platform after changes means you
          accept the new Terms. We will notify users of significant changes via email.
        </p>
      </Section>

      <Section title="10. Governing Law">
        <p>
          These Terms are governed by the laws of the Federal Democratic Republic of Ethiopia.
        </p>
      </Section>
    </PageShell>
  );
}

// ???????????????????????????????????????????????????????????
// PRIVACY POLICY
// ???????????????????????????????????????????????????????????
function Privacy() {
  return (
    <PageShell title="Privacy Policy" subtitle="How we collect, use, and protect your information">
      <Section title="1. Information We Collect">
        <p>We collect the following information:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Account information:</strong> Email address, full name, grade level (if student).</li>
          <li><strong>Usage data:</strong> Lessons completed, quiz scores, time spent learning, achievements earned.</li>
          <li><strong>Technical data:</strong> Browser type, device type, session cookies for authentication.</li>
        </ul>
      </Section>

      <Section title="2. How We Use Your Information">
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Provide and improve the Platform.</li>
          <li>Track your learning progress across devices.</li>
          <li>Send you lesson updates, certificates, and important announcements.</li>
          <li>Issue certificates and verify achievements.</li>
          <li>Provide teachers with analytics about their students (anonymized where possible).</li>
        </ul>
      </Section>

      <Section title="3. Cookies and Session Storage">
        <p>
          We use cookies and browser storage to keep you logged in. We do not use tracking cookies
          for advertising. Session data is deleted when you log out.
        </p>
      </Section>

      <Section title="4. Data Sharing">
        <p>
          We do NOT sell your personal data. We share limited data with:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Chapa:</strong> Payment processing (they handle your payment info directly).</li>
          <li><strong>Supabase:</strong> Our database and authentication provider.</li>
          <li><strong>Resend:</strong> For sending transactional emails only.</li>
          <li><strong>Teachers:</strong> Your name, progress, and quiz results ? only for teachers assigned to your class.</li>
        </ul>
      </Section>

      <Section title="5. Data Security">
        <p>
          We use industry-standard security measures: encrypted connections (HTTPS), hashed passwords,
          and row-level security on our database. However, no system is 100% secure ? please use a strong,
          unique password.
        </p>
      </Section>

      <Section title="6. Your Rights">
        <p>You have the right to:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Access the data we have about you.</li>
          <li>Request corrections to inaccurate data.</li>
          <li>Request deletion of your account and data.</li>
          <li>Opt out of non-essential emails.</li>
        </ul>
        <p>
          To exercise these rights, email us at {CONTACT_EMAIL}.
        </p>
      </Section>

      <Section title="7. Children's Privacy">
        <p>
          We comply with applicable child protection laws. If you are under 18, your parent or guardian
          must consent to your use of the Platform. Parents may request deletion of their child's data
          at any time by contacting us.
        </p>
      </Section>

      <Section title="8. Data Retention">
        <p>
          We keep your data while your account is active. If you delete your account, we remove your
          personal data within 30 days, except where required by law.
        </p>
      </Section>

      <Section title="9. Changes to This Policy">
        <p>
          We may update this Privacy Policy. Significant changes will be announced via email or on the Platform.
        </p>
      </Section>
    </PageShell>
  );
}

// ???????????????????????????????????????????????????????????
// REFUND POLICY
// ???????????????????????????????????????????????????????????
function Refund() {
  return (
    <PageShell title="Refund & Cancellation Policy" subtitle="Our terms for subscription refunds">
      <Section title="1. Free Public Beta">
        <p>
          During our current free public beta period, all lessons are free. No payments are being
          processed at this time. This policy applies once paid subscriptions launch.
        </p>
      </Section>

      <Section title="2. Subscription Cancellation">
        <p>
          You may cancel your subscription at any time from your account settings. Cancellation takes
          effect at the end of your current billing period. You will continue to have access until that date.
        </p>
      </Section>

      <Section title="3. Refund Policy">
        <p>
          <strong>No refunds</strong> are provided for partial months or unused subscription time. All
          subscription fees are final and non-refundable.
        </p>
        <p>
          We recommend trying the free tier before subscribing.
        </p>
      </Section>

      <Section title="4. Exceptions">
        <p>We may grant refunds in exceptional cases:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Duplicate charges made in error.</li>
          <li>Service was unavailable for extended periods (7+ consecutive days).</li>
          <li>Technical issues prevented you from using the Platform.</li>
        </ul>
        <p>
          To request a refund exception, email {CONTACT_EMAIL} within 7 days of the issue.
        </p>
      </Section>

      <Section title="5. Failed Payments">
        <p>
          If a payment fails, we may retry it. Continued failures may result in account suspension
          until the issue is resolved.
        </p>
      </Section>

      <Section title="6. Contact">
        <p>
          For any questions about refunds, contact {CONTACT_EMAIL}.
        </p>
      </Section>
    </PageShell>
  );
}

// ???????????????????????????????????????????????????????????
// COOKIE POLICY
// ???????????????????????????????????????????????????????????
function Cookies() {
  return (
    <PageShell title="Cookie Policy" subtitle="How we use cookies and local storage">
      <Section title="1. What Are Cookies?">
        <p>
          Cookies are small text files stored on your device. We use them (and similar browser storage
          technology) to keep you logged in and remember your preferences.
        </p>
      </Section>

      <Section title="2. Cookies We Use">
        <p>We use the following types of cookies:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Essential cookies:</strong> Required for authentication. Store your session token so you
            stay logged in.
          </li>
          <li>
            <strong>Preference storage:</strong> Local storage keeps your profile and progress data cached
            for faster loading.
          </li>
        </ul>
        <p>We do NOT use advertising or tracking cookies.</p>
      </Section>

      <Section title="3. Managing Cookies">
        <p>
          You can clear cookies and local storage in your browser settings. Note: clearing these will
          log you out and may cause you to lose cached progress (though your real progress is safely
          stored on our servers).
        </p>
      </Section>

      <Section title="4. Third-Party Cookies">
        <p>
          Our authentication provider (Supabase) sets session cookies for login. Chapa may set cookies
          during payment ? see their privacy policy for details.
        </p>
      </Section>

      <Section title="5. Contact">
        <p>Questions about cookies? Email {CONTACT_EMAIL}.</p>
      </Section>
    </PageShell>
  );
}

// ???????????????????????????????????????????????????????????
// MAIN EXPORT ? routes based on pathname
// ???????????????????????????????????????????????????????????
export default function Legal() {
  const location = useLocation();

  if (location.pathname === '/privacy') return <Privacy />;
  if (location.pathname === '/refund-policy') return <Refund />;
  if (location.pathname === '/cookies') return <Cookies />;
  return <Terms />;
}
