# THE HJ WEIMARANER Club — Supabase + Vercel edition

This version preserves the original two-family editor, profile design and administrator settings.

## 1. Supabase

In your existing Supabase project's SQL Editor, run `supabase-setup.sql` once. This creates `public.family_documents` (RLS enabled, no anonymous access policy) and seeds two independent circles without overwriting existing records. Your existing `site_settings` table is also used.

Create a **public** Storage bucket named `dog-photos` with 4 MB max file size, allowing `image/jpeg`, `image/png`, `image/webp`. No anonymous upload policy is required. The Vercel server uploads using the private service-role key.

## 2. GitHub

Replace the old root `server.js`, `index.html`, `package.json`, and `README.md` with these files. Add `vercel.json`, `supabase-setup.sql`, `.env.example`. **Never commit actual `.env` secrets or your Supabase service-role key.**

## 3. Vercel (Hobby, personal/noncommercial use)

Import the GitHub repository and leave Framework Preset as **Express**. Root Directory `./`. Add these environment variables in Vercel (Production, Preview as needed):

- `SUPABASE_URL`: your Supabase Project URL (no `/rest/v1/` suffix)
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase **service_role** key, never the anon/publishable key; private server-side only
- `ADMIN_PASSWORD`: administrator password (12+ characters)
- `SHARE_PATH`: random URL-safe secret (20+ characters; letters, digits, hyphen, underscore)
- `SESSION_SECRET`: random 32+ character secret for signed administrator cookies

Redeploy after setting the variables. Open `https://YOUR-VERCEL-DOMAIN.vercel.app/s/YOUR_SHARE_PATH` (not the domain root). Test `.../health` first. Do not share your service-role key, administrator password, or session secret in chat.

## Features and limitations

- Two separately editable family trees, online JSON documents, dog profiles, links, image upload, administrator settings, administrator JSON backup.
- Saving uses an optimistic timestamp check: if another person edited the same family first, a conflict warning appears instead of silently overwriting their edits. Reload to resolve; automatic merging is not implemented.
- This is a **shared-edit-by-link** site, not a fully authenticated user/role system. Anyone who knows the link can modify shared data and view owner fields. Do not enter sensitive personal information. A secret URL is not strong access control.
- The admin cookie is HMAC-signed and expires after 24 hours. Logout clears the browser cookie but does not revoke a previously copied token server-side.
- Photo storage is public. Uploaded photos remain in the bucket when removed from the family tree; delete unused photos in Supabase Storage if necessary.
- Admin JSON backup includes references to photos, not the photo bytes. Supabase backup/Storage export is required for a complete backup.
- Server-side request rate limiting is per serverless instance; it is **not** a robust global abuse-prevention control. Consider CAPTCHA and stricter controls before wide sharing.
- Family JSON documents are stored in `family_documents`; existing normalized `dogs`/`family_links` tables are not populated by this version.
- For local development, use Node 20+, `npm install`, set the environment variables, then `npm start`.
