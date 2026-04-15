# Project Report: Welth - AI Finance Platform

## 1. Executive Summary

**Project Name:** Welth  
**Type:** Full Stack AI Finance Platform  
**Purpose:** Welth is a comprehensive personal finance management application designed to help users track their accounts, budgets, and transactions intelligently. By leveraging modern web technologies and Artificial Intelligence, the platform provides automated insights, recurring transaction tracking, and enhanced security to give users complete control over their financial health.

---

## 2. Core Features

### 2.1 User Management & Security
- **Authentication:** Integrated with **Clerk** for secure and seamless Sign-Up, Sign-In, and onboarding experiences.
- **Bot Protection & Rate Limiting:** Powered by **Arcjet** to ensure platform security, protecting the endpoints and API routes from malicious attacks and spam.

### 2.2 Financial Tracking & Accounts
- **Account Management:** Users can manage multiple accounts (Current and Savings). Each account tracks its live balance.
- **Transactions:** Supports adding, viewing, and categorizing income and expenses. Transactions can be linked to receipts.
- **Recurring Transactions:** Built-in support to handle daily, weekly, monthly, or yearly recurring transactions automatically (managed by **Inngest** background jobs).

### 2.3 Budgeting & Alerts
- **Dynamic Budgets:** Users can establish spending budgets. 
- **Notifications:** Automated email notifications sent via **Resend** and **React Email** to keep users alerted when approaching budget thresholds or on important financial activities.

### 2.4 AI Capabilities
- **Intelligent Insights:** Integrates with the **Google Gemini API** to bring AI-powered insights, categorizing spending, and potentially offering financial advice based on user transaction data.

---

## 3. Technology Stack

### Frontend & UI
- **Framework:** Next.js 15 (App Router, Turbopack)
- **Styling:** Tailwind CSS
- **Component Library:** Shadcn UI (Radix UI primitives for accessible components like dialogs, tooltips, and popovers)
- **Form Handling & Validation:** React Hook Form + Zod
- **Data Visualization:** Recharts for analytical finance dashboards

### Backend & Database
- **Database:** PostgreSQL (Hosted on Neon / Supabase)
- **ORM:** Prisma Client
- **Background Jobs:** Inngest (handles scheduled tasks like recurring transactions and budget alert processing)
- **Email Delivery:** Resend + React Email integration

### Integrations
- **Clerk:** Identity and Access Management
- **Arcjet:** Next-generation app security
- **Gemini API:** Generative AI services

---

## 4. Architecture & Database Design

The application uses an environment-centric configuration, connecting stateful data stored in PostgreSQL through the Prisma ORM.

### Entity Relationship Model:

1. **User Table (`users`)**
   - Stores user identity mapped to Clerk (`clerkUserId`).
   - Maintains an overarching view by associating users with their Accounts, Budgets, and Transactions.

2. **Account Table (`accounts`)**
   - Types: `CURRENT` or `SAVINGS`.
   - Captures real-time balance and denotes whether an account is the user's default.

3. **Transaction Table (`transactions`)**
   - Logs individual movements: `INCOME` vs. `EXPENSE`.
   - Stores metadata like description, date, category, status (`PENDING`, `COMPLETED`, `FAILED`), and receipt URL.
   - Contains scheduling logic for recurring items (`isRecurring`, `recurringInterval`, `nextRecurringDate`).

4. **Budget Table (`budgets`)**
   - Keeps track of target spending limits and when the last alert was sent (`lastAlertSent`).

---

## 5. Development Details

- **Scripts:** Includes setup for standard `next dev` running on Turbopack for extremely fast HMR, and Prisma local generation via postinstall scripts.
- **Routing:** Built with Next.js App Router enforcing distinct areas for marketing `(main)`, authenticated usage `(dashboard, account, transaction)`, and serverless handlers `(api)`.

---

## 6. Conclusion

Welth demonstrates an advanced, scalable architecture for modern React applications. By combining Next.js with robust tooling like Prisma, Inngest for async queue processing, Clerk for auth, and Gemini for AI, the platform is structured for high performance, ease of use, and intelligent automation in the personal finance sector.
