
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
=======
# 🕵️‍♂️ SEO Audit Tool (SiteLens)
>>>>>>> 8bc4780b21c5205fd33171981984bd06ab800855

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
- 
---

## 🖥️ Demo

(https://seositelens.vercel.app/)

---

## 📦 Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, i18next
- **Backend**: Express, TypeScript, Mongoose, Cheerio, Google Generative AI
- **Auth**: Google OAuth 2.0 (`@react-oauth/google`)
- **Database**: MongoDB Atlas
- **Deployment**: Render, Vercel, or any Node.js-compatible host

---

## ✨ Screenshots

<img width="1908" height="910" alt="image" src="https://github.com/user-attachments/assets/121b75b9-0f4c-4042-9cec-75f16dbaa075" />
<img width="1458" height="911" alt="image" src="https://github.com/user-attachments/assets/499da434-ec49-4df6-9de4-aeb9cd946ac5" />
<img width="1431" height="906" alt="image" src="https://github.com/user-attachments/assets/19981a2c-c226-4fbd-aa0a-23e59ed03103" />



🛠️ Getting Started
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/your-username/seo-audit-tool.git
cd seo-audit-tool
2. Install Dependencies
bash
Copy
Edit
npm install
3. Environment Variables
Create a .env file in the root directory with the following:

env
Copy
Edit
VITE_GOOGLE_CLIENT_ID=your_google_client_id
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_google_gemini_api_key
4. Run the App (Development)
bash
Copy
Edit
npm run dev
Frontend: http://localhost:5173

Backend/API: http://localhost:3001

🔑 Authentication Setup
Uses Google OAuth for login.

User data is stored securely in MongoDB Atlas.

See AUTH_SETUP.md for full details.

🧩 Main Features
1. SEO Audit
Enter a website URL to receive a detailed SEO report.

Includes performance scores (mobile/desktop), content structure, links, social tags, and technical checks.

AI-powered recommendations for improvement.

Downloadable PDF report (Pro users).

2. Meta Tags Checker
Analyze your site's title and meta description for length and quality.

Get instant feedback and optimization tips.

3. Headings Analyzer
Visualize your heading structure (H1-H6).

Detect missing or misused headings and get warnings.

4. Social Media Tags Checker
Check for essential OpenGraph and Twitter Card tags.

Identify missing tags for better social sharing.

🏗️ Project Structure

📦 SEO Audit Tool (SiteLens)
├── src/                        # Frontend (React, components, hooks, contexts)
├── server/                     # Backend (Express, routes, models, services)
├── public/                     # Static assets (favicons, robots.txt, etc.)
├── keep-alive.js               # Keeps backend awake on Render free tier
├── package.json                # Project metadata, dependencies, and scripts
├── tailwind.config.js          # Tailwind CSS configuration
├── AUTH_SETUP.md               # Google OAuth setup instructions
├── DEPLOYMENT_GUIDE.md         # Deployment steps for Render
├── RENDER_FREE_TIER_SETUP.md   # Render-specific tips for staying online
├── TROUBLESHOOTING.md          # Common issues and debugging steps


🚦 Deployment
Render: See DEPLOYMENT_GUIDE.md and RENDER_FREE_TIER_SETUP.md for Render-specific instructions and keep-alive setup.

Vercel/Other: Standard Node.js deployment supported.

MIT License

Copyright (c) 2025 Dhinakaran

Permission is hereby granted, free of charge, to any person obtaining a copy...
