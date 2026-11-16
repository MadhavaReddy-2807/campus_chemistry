# Supabase Auth & Institutional Email Delivery Configuration Guide

## 1. Problem Diagnosis: Why Campus Emails Were Not Arriving

During investigation of confirmation email failures for IIT/NIT student addresses (e.g. `@itbhu.ac.in`, `@iitb.ac.in`, `@iitm.ac.in`):

1. **Default Supabase SMTP Limitations**:
   - Supabase projects use a shared free-tier built-in mailer (`noreply@mail.app.supabase.io`).
   - Rate limit: **3 to 4 confirmation emails per hour**. Any subsequent signups or resends are throttled silently or fail with rate limit errors.
2. **Institutional Mail Filtering (DMARC/SPF Strict Enforcement)**:
   - IIT and NIT mail domains are administered on Google Workspace for Education or Microsoft 365 Exchange Online.
   - These enterprise gateways evaluate incoming emails against SPF, DKIM, and DMARC alignment.
   - Shared sender domains like `*.supabase.io` lack verified alignment and are frequently blocked at the MX level or placed in administrative quarantine before ever reaching the student's Inbox or Spam folder.
3. **Missing Campus Domain Aliases in Database**:
   - For IIT (BHU) Varanasi, students receive official emails on `@itbhu.ac.in`. The database directory initially only had `@iitbhu.ac.in`. This has been resolved in migration `202611160007_complete_platform_tables.sql` and `src/lib/data/institutes.ts`.

---

## 2. Production SMTP Provider Setup (Recommended: Resend or AWS SES)

To achieve 100% inbox delivery across all IIT and NIT mail servers, configure Custom SMTP in **Supabase Dashboard -> Authentication -> Email -> SMTP Settings**:

### Settings for Resend (Recommended for Fast Setup):
| Setting | Value |
|---|---|
| **Sender Email** | `auth@your-verified-domain.com` (e.g., `auth@campuschemistry.in`) |
| **Sender Name** | `Campus Chemistry` |
| **Host** | `smtp.resend.com` |
| **Port** | `587` |
| **Encryption** | TLS |
| **User** | `resend` |
| **Password** | `re_YourResendApiKey_xxxxxxxx` |

### Settings for AWS SES (Recommended for High Volume):
| Setting | Value |
|---|---|
| **Sender Email** | `auth@your-verified-domain.com` |
| **Sender Name** | `Campus Chemistry` |
| **Host** | `email-smtp.ap-south-1.amazonaws.com` (Mumbai) |
| **Port** | `587` |
| **Encryption** | STARTTLS |
| **User** | `[Your SES SMTP Username]` |
| **Password** | `[Your SES SMTP Password]` |

---

## 3. Required DNS Records for Institutional Inbox Deliverability

Add these DNS records to your domain provider (Cloudflare, GoDaddy, Namecheap):

### A. SPF Record (TXT)
```text
Host: @
Type: TXT
Value: v=spf1 include:resend.com ~all
```
*(If using AWS SES, replace `include:resend.com` with `include:amazonses.com`)*

### B. DKIM Records (CNAME)
Add the 3 DKIM CNAME records provided by your email provider (e.g. `resend._domainkey.yourdomain.com`).

### C. DMARC Record (TXT)
```text
Host: _dmarc
Type: TXT
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@your-verified-domain.com; pct=100; adkim=r; aspf=r
```

---

## 4. Supabase Auth URL Configuration

In **Supabase Dashboard -> Authentication -> URL Configuration**:
1. **Site URL**: `https://<your-deployed-domain>.vercel.app`
2. **Redirect URLs** (add all):
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/onboarding`
   - `http://localhost:3000/reset-password`
   - `https://<your-deployed-domain>.vercel.app/auth/callback`
   - `https://<your-deployed-domain>.vercel.app/onboarding`
   - `https://<your-deployed-domain>.vercel.app/reset-password`

---

## 5. Email Templates

In **Supabase Dashboard -> Authentication -> Email Templates**:
### Confirm signup:
- **Subject**: Confirm your Campus Chemistry registration
- **Body**:
```html
<h2>Welcome to Campus Chemistry</h2>
<p>Click the link below to confirm your official campus email and continue onboarding:</p>
<p><a href="{{ .ConfirmationURL }}">Verify My Campus Email</a></p>
<p>If you did not request this, you can safely ignore this email.</p>
```

### Reset Password:
- **Subject**: Reset your Campus Chemistry password
- **Body**:
```html
<h2>Reset Your Password</h2>
<p>Click below to choose a new password for your Campus Chemistry account:</p>
<p><a href="{{ .ConfirmationURL }}">Reset Password</a></p>
<p>This link is single-use and will expire in 24 hours.</p>
```
