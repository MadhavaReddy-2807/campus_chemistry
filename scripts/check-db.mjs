import process from "node:process";
import pg from "pg";

const databaseUrl = process.env.CAMPUS_DATABASE_URL;
if (!databaseUrl) throw new Error("CAMPUS_DATABASE_URL is required.");
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
try {
  await client.connect();
  const { rows: [result] } = await client.query(`
    select json_build_object(
      'profiles_rls', (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
      'messages_rls', (select relrowsecurity from pg_class where oid = 'public.messages'::regclass),
      'events_rls', (select relrowsecurity from pg_class where oid = 'public.events'::regclass),
      'match_function', to_regprocedure('public.register_discovery_action(uuid,text,uuid,text)') is not null,
      'rsvp_function', to_regprocedure('public.rsvp_event(uuid)') is not null,
      'profile_update_function', to_regprocedure('public.update_my_profile(text,text,text,text,text,smallint)') is not null,
      'privacy_update_function', to_regprocedure('public.update_my_privacy(text,boolean,boolean,text,boolean)') is not null,
      'verification_review_function', to_regprocedure('public.review_verification_request(uuid,text,text)') is not null,
      'post_visibility_function', to_regprocedure('public.can_view_post(uuid)') is not null,
      'post_interaction_visibility_policy', (select count(*) from pg_policies where schemaname = 'public' and policyname = 'users can create comments on visible posts') = 1,
      'rate_limit_function', to_regprocedure('public.consume_rate_limit(text,integer,integer)') is not null,
      'notification_triggers', (select count(*) from pg_trigger where tgrelid in ('public.matches'::regclass, 'public.messages'::regclass, 'public.follows'::regclass) and not tgisinternal) >= 3,
      'event_visibility_function', to_regprocedure('public.can_view_event(uuid)') is not null,
      'event_withdraw_function', to_regprocedure('public.withdraw_event_rsvp(uuid)') is not null,
      'moderator_function_grant', has_function_privilege('authenticated', 'public.is_moderator(uuid)', 'execute'),
      'profile_update_grant', has_function_privilege('authenticated', 'public.update_my_profile(text,text,text,text,text,smallint)', 'execute'),
      'profile_direct_update_revoked', not has_table_privilege('authenticated', 'public.profiles', 'update'),
      'pilot_institutes', (select count(*) from public.institutes where short_name in ('IIT Delhi', 'NIT Trichy'))
    ) as checks
  `);
  console.log(JSON.stringify(result.checks));
} finally {
  await client.end().catch(() => undefined);
}
