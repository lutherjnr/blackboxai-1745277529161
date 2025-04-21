# Church Financial Management System (CFMS) - System Build Prompt

## System Overview
CFMS is a web-based financial management platform developed using Django (Python) for the backend and React.js (with Tailwind CSS) for the frontend. It is designed for Churches to monitor, manage, and track all income transactions received via M-Pesa (Daraja API integration) and manual cash payments.

It supports two main user roles — Admin (Super User) and Finance Team Users.

Automated SMS notifications are sent after every transaction using HostPinnacle SMS Gateway.

The system supports real-time reporting, analytics, and trend monitoring of church income accounts.

---

## Core System Objectives
- Enable Admin to manage Users, view financial reports, and perform manual entries.
- Enable Finance Team to log in and record cash payments manually.
- Automatically capture M-Pesa Paybill transactions via Daraja API.
- Send Automated SMS Notifications after any payment is recorded (M-Pesa or Manual).
- Allow Admin to generate Reports by Date, Account Type, or Individual Member.
- Provide a Dashboard with Real-Time Statistics and Graphs for the Admin.
- Ensure the system is optimized to handle high concurrent usage (peak times e.g., offertory).
- Retain only essential member information for privacy:
  - Name
  - Phone Number
  - Amount Sent
  - Time Sent

---

## System Users and Roles

| User Role          | Permissions & Functionalities                                      |
|--------------------|-------------------------------------------------------------------|
| Admin (Super User) | Full Access: Manage Users, View All Reports, Record Manual Payments, View Dashboard, Configure System Settings |
| Finance Team User  | Limited Access: Login & Record Manual Payments Only               |
| Public User        | Sends Money via M-Pesa Paybill (No Login Required)                |

---

## Income Accounts to Track

| Account Name       | Code (Short Form) |
|--------------------|-------------------|
| Tithes             | TT                |
| Offering           | OFF               |
| Camp Offering      | CO                |
| Camp Expenses      | CE                |
| Building           | BLDG              |
| Local Church Budget| LCB               |

---

## Database Design (Key Tables)
- **Users** (Admin, Finance Team)
- **Accounts** (Predefined Account Types)
- **Transactions** (All M-Pesa + Manual Payments)
- **SMS Logs** (Optional for Audit)
- **Audit Logs** (Optional for System Activities)

---

## Technical Stack

| Component         | Technology Choice                  |
|-------------------|----------------------------------|
| Backend           | Django + Django REST Framework   |
| Database          | PostgreSQL                       |
| Frontend          | React.js + Tailwind CSS          |
| Background Tasks  | Celery + Redis (For SMS Sending) |
| Payment Integration| M-Pesa Daraja API                |
| SMS Gateway       | HostPinnacle SMS API             |
| Hosting           | AWS Free Tier (EC2 + RDS for PostgreSQL) |

---

## High Level Architecture Design

```
[ M-Pesa Payment from Member Phone ]
               |
     [ Daraja API Webhook Endpoint ]
               |
     [ Django Backend System ]
               |
     [ Store Transaction Record ]
               |
     [ Celery Task to Send SMS via HostPinnacle API ]
               |
     [ Send SMS Notification to Member ]
               |
     [ Update Dashboard and Reports for Admin ]
```

---

## Frontend Modules

| Module               | Pages Required                          |
|----------------------|---------------------------------------|
| Authentication       | Login Page                            |
| Dashboard (Admin)    | Real-Time Stats, Charts, Account Balances |
| Manual Payment Entry | Form for Finance Team to Record Payments |
| Reports              | Filter by Account, Member, Date       |
| User Management      | Admin to Add, Remove Users             |

---

## Backend Modules

| Module             | Functionalities                                  |
|--------------------|------------------------------------------------|
| Authentication     | Login / Logout / Roles Management                |
| Accounts           | Fixed Account Types (TT, OFF, CO, CE, BLDG, LCB)|
| Transactions       | Record Payments (Automatic + Manual)             |
| SMS                | Send SMS After Payment (Celery Tasks)            |
| Reports            | Generate Reports Dynamically                       |
| API Integrations   | M-Pesa Daraja Webhook / HostPinnacle API          |

---

## Security Considerations
- JWT Authentication for API Access.
- Roles & Permissions Strictly Enforced.
- Secure Django Settings with .env for Secrets.
- HTTPS for Hosting on AWS.
- Ensure Data Privacy — Only retain:
  - Name
  - Phone Number
  - Amount
  - Timestamp
- No SMS Notification Logs should appear on the Dashboard (only essential transactional info should be retained).
