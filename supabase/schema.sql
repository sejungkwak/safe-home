


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";








ALTER SCHEMA "public" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."driver_verification_status" AS ENUM (
    'pending',
    'rejected',
    'resubmitted',
    'verified'
);


ALTER TYPE "public"."driver_verification_status" OWNER TO "postgres";


CREATE TYPE "public"."notification_type" AS ENUM (
    'ride_requested',
    'driver_accepted',
    'rider_accepted',
    'driver_cancelled',
    'rider_cancelled',
    'expired'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."transmission_type" AS ENUM (
    'manual',
    'automatic'
);


ALTER TYPE "public"."transmission_type" OWNER TO "postgres";


CREATE TYPE "public"."trip_status" AS ENUM (
    'pending',
    'driver_accepted',
    'rider_accepted',
    'in_progress',
    'completed',
    'driver_cancelled',
    'rider_cancelled',
    'expired'
);


ALTER TYPE "public"."trip_status" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'rider',
    'driver'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO ''
    AS $$
declare
  raw_role text;
  selected_role public.user_role;
begin
  raw_role := new.raw_user_meta_data ->> 'role';
  if lower(new.email) = 'safehome.admin@gmail.com'
    then selected_role := 'admin';
  elsif raw_role = 'driver'
    then selected_role := 'driver';
  else
    selected_role := 'rider';
  end if;
  insert into public.profile (id, name, phone, email, role, driving_licence, profile_photo)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    new.raw_user_meta_data ->> 'phone',
    new.email,
    selected_role,
    new.raw_user_meta_data ->> 'driving_licence',
    new.raw_user_meta_data ->> 'profile_photo'
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."driver_verification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "status" "public"."driver_verification_status" DEFAULT 'pending'::"public"."driver_verification_status" NOT NULL,
    "rejection_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "reviewed_at" timestamp with time zone
);


ALTER TABLE "public"."driver_verification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "recipient_token" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "type" "public"."notification_type" DEFAULT 'ride_requested'::"public"."notification_type" NOT NULL,
    "trip_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."notification" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" "uuid" NOT NULL,
    "name" "text",
    "phone" "text",
    "email" "text" NOT NULL,
    "address" "jsonb",
    "role" "public"."user_role" DEFAULT 'rider'::"public"."user_role" NOT NULL,
    "driving_licence" "text",
    "profile_photo" "text",
    "vehicle_id" "uuid",
    "expo_push_token" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rating" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "trip_id" "uuid" NOT NULL,
    "rating" smallint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "rating_rating_check" CHECK ((("rating" >= 0) AND ("rating" <= 5)))
);


ALTER TABLE "public"."rating" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rider_id" "uuid",
    "driver_id" "uuid",
    "start_location" "jsonb" NOT NULL,
    "end_location" "jsonb" NOT NULL,
    "start_time" timestamp with time zone,
    "end_time" timestamp with time zone,
    "fare" numeric NOT NULL,
    "status" "public"."trip_status" DEFAULT 'pending'::"public"."trip_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."trip" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "make" "text",
    "colour" "text",
    "reg" "text" NOT NULL,
    "transmission_type" "public"."transmission_type" DEFAULT 'manual'::"public"."transmission_type" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."vehicle" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."verif_notification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "driver_id" "uuid" NOT NULL,
    "driver_token" "text" NOT NULL,
    "title" "text" NOT NULL,
    "body" "text" NOT NULL,
    "type" "public"."driver_verification_status" DEFAULT 'pending'::"public"."driver_verification_status" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."verif_notification" OWNER TO "postgres";


ALTER TABLE ONLY "public"."driver_verification"
    ADD CONSTRAINT "driver_verification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rating"
    ADD CONSTRAINT "rating_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rating"
    ADD CONSTRAINT "rating_user_id_trip_id_key" UNIQUE ("user_id", "trip_id");



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle"
    ADD CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle"
    ADD CONSTRAINT "vehicle_reg_key" UNIQUE ("reg");



ALTER TABLE ONLY "public"."verif_notification"
    ADD CONSTRAINT "verif_notification_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "notification" AFTER INSERT ON "public"."notification" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://sfmbywgpekmrowibypsz.supabase.co/functions/v1/notification', 'POST', '{"Content-type":"application/json","Authorization":"Bearer ***REMOVED***"}', '{}', '5000');



CREATE OR REPLACE TRIGGER "verif-notification" AFTER INSERT ON "public"."verif_notification" FOR EACH ROW EXECUTE FUNCTION "supabase_functions"."http_request"('https://sfmbywgpekmrowibypsz.supabase.co/functions/v1/verif-notification', 'POST', '{"Content-type":"application/json","Authorization":"Bearer ***REMOVED***"}', '{}', '5000');



ALTER TABLE ONLY "public"."driver_verification"
    ADD CONSTRAINT "driver_verification_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."profile"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicle"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."rating"
    ADD CONSTRAINT "rating_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."trip"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rating"
    ADD CONSTRAINT "rating_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."trip"
    ADD CONSTRAINT "trip_rider_id_fkey" FOREIGN KEY ("rider_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."verif_notification"
    ADD CONSTRAINT "verif_notification_driver_id_fkey" FOREIGN KEY ("driver_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Anon, authenticated users can delete" ON "public"."driver_verification" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can delete" ON "public"."notification" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can delete" ON "public"."profile" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can delete" ON "public"."rating" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can delete" ON "public"."trip" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can delete" ON "public"."vehicle" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can delete" ON "public"."verif_notification" FOR DELETE TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can insert" ON "public"."driver_verification" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can insert" ON "public"."notification" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can insert" ON "public"."profile" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can insert" ON "public"."rating" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can insert" ON "public"."trip" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can insert" ON "public"."vehicle" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can insert" ON "public"."verif_notification" FOR INSERT TO "authenticated", "anon" WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can read" ON "public"."driver_verification" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can read" ON "public"."notification" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can read" ON "public"."profile" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can read" ON "public"."rating" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can read" ON "public"."trip" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can read" ON "public"."vehicle" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can read" ON "public"."verif_notification" FOR SELECT TO "authenticated", "anon" USING (true);



CREATE POLICY "Anon, authenticated users can update" ON "public"."driver_verification" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can update" ON "public"."notification" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can update" ON "public"."profile" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can update" ON "public"."rating" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can update" ON "public"."trip" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can update" ON "public"."vehicle" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anon, authenticated users can update" ON "public"."verif_notification" FOR UPDATE TO "authenticated", "anon" USING (true) WITH CHECK (true);



ALTER TABLE "public"."driver_verification" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rating" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."verif_notification" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."driver_verification";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."trip";






REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "anon";





































































































































































GRANT ALL ON TABLE "public"."driver_verification" TO "authenticated";
GRANT ALL ON TABLE "public"."driver_verification" TO "anon";



GRANT ALL ON TABLE "public"."notification" TO "authenticated";
GRANT ALL ON TABLE "public"."notification" TO "anon";



GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "anon";



GRANT ALL ON TABLE "public"."rating" TO "authenticated";
GRANT ALL ON TABLE "public"."rating" TO "anon";



GRANT ALL ON TABLE "public"."trip" TO "authenticated";
GRANT ALL ON TABLE "public"."trip" TO "anon";



GRANT ALL ON TABLE "public"."vehicle" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle" TO "anon";



GRANT ALL ON TABLE "public"."verif_notification" TO "anon";
GRANT ALL ON TABLE "public"."verif_notification" TO "authenticated";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";




























