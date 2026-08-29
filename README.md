# ML4HS Data Diary

Student data-collection app for **ML for Understanding Humans and Society (SKKU, Fall 2026)**.

Students complete a profile survey, record daily life and media-use data, review personal charts, configure personal probes, and collaborate in teams. Instructors can monitor participation, post announcements, assign teams, and export anonymized diary data.

## Stack

- Next.js 16 / React 19 / TypeScript
- Supabase Authentication and PostgreSQL
- Tailwind CSS and Recharts

## Local development

Node.js LTS is required.

```powershell
npm ci
npm run dev
```

Create `.env.local` with:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Never commit `.env.local`. If this project is stored in a Google Drive synchronized folder and `npm ci` reports `EBADF` or `EPERM`, run the app from a local nonsynchronized checkout.

## Supabase setup

Run the SQL files in the Supabase SQL Editor in this order:

1. `supabase-schema.sql`
2. `supabase-schema-teams.sql`
3. `supabase-schema-admin.sql`
4. `supabase-schema-v2.sql`
5. `supabase-schema-v2b.sql`
6. `supabase-schema-v3.sql`
7. `supabase-schema-v4.sql`
8. `supabase-schema-v5.sql`
9. `supabase-schema-v6.sql`

The final migration also adds the profile-update RLS policy required by the survey and personal probes, restricts students to one team, limits teams to five students, and prevents forged team creators. Re-run `supabase-schema-v6.sql` if an existing project was initialized before these deployment-hardening statements were added.

After creating the instructor account, grant admin access manually in the SQL Editor:

```sql
update public.profiles
set is_admin = true
where id = '<instructor-auth-user-id>';
```

## Verification

```powershell
npm run lint
npm run build
```

Both commands must pass before deployment.

## Deployment

Deploy the project root to a Next.js-compatible host such as Vercel and configure the two Supabase environment variables there. In Supabase Authentication, add the production URL to the allowed redirect URLs before distributing the app to students.

Before release, test these flows with separate instructor and student accounts:

- sign-up, email confirmation, sign-in, and sign-out
- profile survey save and edit
- new daily log and same-date edit
- dashboard totals and charts
- team create, join, leave, charter, and posts
- instructor announcements, team assignment, and CSV export