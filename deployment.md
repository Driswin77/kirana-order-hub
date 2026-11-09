Deployment & Setup Guide: Kirana Order Hub
1. How to run locally (Step-by-step)
Prerequisites
Node.js (v18 or higher)

PostgreSQL Database (A free Neon.tech or Supabase account works perfectly)

Installation Steps
Clone the repository:

bash
git clone https://github.com/Driswin77/kirana-order-hub.git
cd kirana-order-hub
Install dependencies:

bash
npm install
Set up environment variables:
Create a .env file in the root directory and add the following (values are not provided for security):

env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="any-random-string-for-local-dev"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="your-openai-api-key-optional"
(Note: If no OpenAI key is provided, the app gracefully falls back to a deterministic local parser for the AI feature so the demo never breaks).

Sync the database schema and seed sample data:

bash
npx prisma db push
npx prisma db seed
Start the development server:

bash
npm run dev
Open the app:
Navigate to http://localhost:3000 in your browser.

2. How it is deployed
Deployment Stack: Vercel (Frontend/API) + Neon (Database)

Environment Variables needed in production:
(Names only, never commit values to the repository)

DATABASE_URL

NEXTAUTH_SECRET

NEXTAUTH_URL

OPENAI_API_KEY

Deployment Steps:
Push the code to a public GitHub repository.

Log in to Vercel and click "Add New Project".

Import the GitHub repository.

Add the Environment Variables listed above in the Vercel dashboard.

Click Deploy. Vercel will automatically run the build command (next build).

Once deployed, run npx prisma db push locally pointing to your production database URL to ensure the schema is live.

3. Demo Login Details for the Reviewer
The app uses a mocked OTP flow to simulate SMS delivery. The OTP is always 123456.

Retailer Account (To place orders)
Phone Number: 9876543210

OTP: 123456

Role: Retailer

Features to test: Add items to cart, check the scheme engine (add 10 biscuits to see 1 free), use the "AI Capture" feature to paste a Hindi/English message.

Order Desk Account (To manage orders)
Phone Number: 9999999999

OTP: 123456

Role: Order Desk

Features to test: View the incoming orders, see the AI badges, and click "Export to Tally (CSV)" to download the report.

4. Security Note
No secrets or real personal data are committed to the repository.

The .env file is strictly ignored in .gitignore.

The app uses a mock OTP system to bypass SMS gateway costs for the review process.