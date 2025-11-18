Chiearn Hub - Static Site
=========================
This zip contains static HTML files for Chiearn Hub with Supabase integration (signup/login).
To deploy to Netlify:
1. Create a new site from Git -> drag & drop this folder or connect repository.
2. Ensure your Supabase table 'users' exists with columns: email, phone, referral, password, model.
3. This code uses the anon public key already included. For production, configure Row Level Security (RLS) and use Supabase Auth.
