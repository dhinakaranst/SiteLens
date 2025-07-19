# SEO Audit Tool (SiteLens)

A modern, full-stack SEO analysis tool with AI-powered suggestions to improve your website's SEO, meta tags, headings, and social media presence. Built with React, Express, TypeScript, and Google OAuth.

---

## 🚀 Features

- **Full SEO Audit**: Analyze any website for SEO best practices, performance, content structure, and technical issues.
- **AI Recommendations**: Get actionable suggestions powered by Google Gemini AI.
- **Meta Tags Checker**: Instantly check and optimize your site's title and meta description.
- **Headings Analyzer**: Visualize and validate your heading structure (H1-H6).
- **Social Media Tags Checker**: Ensure your OpenGraph and Twitter Card tags are set up for optimal sharing.
- **PDF Reports**: Download professional SEO audit reports (Pro feature).
- **Google OAuth Authentication**: Secure login and user management.
- **Responsive UI**: Beautiful, mobile-friendly interface with Tailwind CSS.
- **Free & Pro Plans**: Flexible usage limits and premium features.

---

## 🛠️ End-to-End SEO Audit Queue Flow

This project uses a job queue (BullMQ + Redis) to handle SEO audits asynchronously. Here’s how the flow works:

### 1. Trigger from Frontend
- The frontend sends a POST request to the API endpoint `/api/seo/audit` with a JSON body containing `url` and `userId`.

### 2. Express Route Enqueues Job
- The Express route receives the request and calls `enqueueAuditJob`, which adds the job to the Bull queue (backed by Redis).

### 3. Worker Processes Job
- A separate worker process (`npm run dev:worker`) listens for jobs on the queue.
- When a job is available, the worker calls `performSeoAudit` to process the audit.

### 4. Persist Audit Results
- After the audit is complete, the result is saved in MongoDB using the `AuditResult` model.
- Results can later be fetched and displayed in the frontend.

#### Example Usage

**POST /api/seo/audit**
```json
{
  "url": "https://example.com",
  "userId": "user-123"
}
```

#### Testing the Flow
1. Start your Express server: `npm run dev`
2. Start your worker: `npm run dev:worker`
3. Send a POST request to `/api/seo/audit` with a valid `url` and `userId`.
4. Check your worker logs for processing messages.
5. Verify that the audit result is saved in MongoDB.

---

## Email Deliverability (SPF Record)
If you add a custom domain and email, add this SPF record to your DNS:

```
v=spf1 include:_spf.google.com ~all
```

This helps ensure your emails are delivered and not marked as spam.
