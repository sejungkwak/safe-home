


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


CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."notification_type" AS ENUM (
    'ride_requested',
    'driver_accepted',
    'rider_accepted',
    'driver_cancelled',
    'rider_cancelled'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";


CREATE TYPE "public"."trip_status" AS ENUM (
    'pending',
    'driver_accepted',
    'rider_accepted',
    'in_progress',
    'completed',
    'driver_cancelled',
    'rider_cancelled'
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
  selected_role text;
  user_roles public.user_role[];
begin
  selected_role := new.raw_user_meta_data ->> 'role';
  if selected_role = 'both' 
    then
      user_roles := array['rider', 'driver']::public.user_role[];
    elsif 
      selected_role is null or selected_role = '' 
    then
      user_roles := array['rider']::public.user_role[];
    else
      user_roles := array[selected_role]::public.user_role[];
    end if;
  insert into public.profile (id, name, phone, email, role, driving_licence, profile_photo)
  values (new.id, new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'phone', new.email, user_roles, new.raw_user_meta_data ->> 'driving_licence', new.raw_user_meta_data ->> 'profile_photo');
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."notification" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
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
    "address" "text",
    "role" "public"."user_role"[] DEFAULT ARRAY['rider'::"public"."user_role"] NOT NULL,
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
    CONSTRAINT "rating_rating_check" CHECK ((("rating" >= 1) AND ("rating" <= 5)))
);


ALTER TABLE "public"."rating" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."trip" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "rider_id" "uuid",
    "driver_id" "uuid",
    "start_location" "text" NOT NULL,
    "end_location" "text" NOT NULL,
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
    "reg" "text" NOT NULL
);


ALTER TABLE "public"."vehicle" OWNER TO "postgres";


ALTER TABLE ONLY "public"."notification"
    ADD CONSTRAINT "notification_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_expo_push_token_key" UNIQUE ("expo_push_token");



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



CREATE POLICY "Authenticated users can view all ratings" ON "public"."rating" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Authenticated users can view basic profiles" ON "public"."profile" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Users can delete their own profile" ON "public"."profile" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can delete their own vehicle" ON "public"."vehicle" FOR DELETE USING (("id" IN ( SELECT "profile"."vehicle_id"
   FROM "public"."profile"
  WHERE ("auth"."uid"() = "profile"."id"))));



CREATE POLICY "Users can insert ratings for their own trips" ON "public"."rating" FOR INSERT TO "authenticated" WITH CHECK (((( SELECT "auth"."uid"() AS "uid") = "user_id") AND (EXISTS ( SELECT 1
   FROM "public"."trip"
  WHERE (("trip"."id" = "rating"."trip_id") AND (("trip"."rider_id" = ( SELECT "auth"."uid"() AS "uid")) OR ("trip"."driver_id" = ( SELECT "auth"."uid"() AS "uid"))))))));



CREATE POLICY "Users can insert their own profile" ON "public"."profile" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert their own trip" ON "public"."trip" FOR INSERT WITH CHECK (("auth"."uid"() = "rider_id"));



CREATE POLICY "Users can insert their own vehicle" ON "public"."vehicle" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own profile" ON "public"."profile" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own trip" ON "public"."trip" FOR UPDATE USING ((("auth"."uid"() = "rider_id") OR ("auth"."uid"() = "driver_id")));



CREATE POLICY "Users can update their own vehicle" ON "public"."vehicle" FOR UPDATE USING (("id" IN ( SELECT "profile"."vehicle_id"
   FROM "public"."profile"
  WHERE ("auth"."uid"() = "profile"."id"))));



CREATE POLICY "Users can view their own notification" ON "public"."notification" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."profile" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view their own trip" ON "public"."trip" FOR SELECT USING ((("auth"."uid"() = "rider_id") OR ("auth"."uid"() = "driver_id")));



CREATE POLICY "Vehicle information is visible to everyone." ON "public"."vehicle" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."notification" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rating" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."trip" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





REVOKE USAGE ON SCHEMA "public" FROM PUBLIC;








































































































































































GRANT SELECT("id") ON TABLE "public"."profile" TO "authenticated";



GRANT SELECT("name") ON TABLE "public"."profile" TO "authenticated";



GRANT SELECT("role") ON TABLE "public"."profile" TO "authenticated";



GRANT SELECT("profile_photo") ON TABLE "public"."profile" TO "authenticated";


































revoke delete on table "public"."notification" from "anon";

revoke insert on table "public"."notification" from "anon";

revoke references on table "public"."notification" from "anon";

revoke select on table "public"."notification" from "anon";

revoke trigger on table "public"."notification" from "anon";

revoke truncate on table "public"."notification" from "anon";

revoke update on table "public"."notification" from "anon";

revoke delete on table "public"."notification" from "authenticated";

revoke insert on table "public"."notification" from "authenticated";

revoke references on table "public"."notification" from "authenticated";

revoke select on table "public"."notification" from "authenticated";

revoke trigger on table "public"."notification" from "authenticated";

revoke truncate on table "public"."notification" from "authenticated";

revoke update on table "public"."notification" from "authenticated";

revoke delete on table "public"."notification" from "service_role";

revoke insert on table "public"."notification" from "service_role";

revoke references on table "public"."notification" from "service_role";

revoke select on table "public"."notification" from "service_role";

revoke trigger on table "public"."notification" from "service_role";

revoke truncate on table "public"."notification" from "service_role";

revoke update on table "public"."notification" from "service_role";

revoke delete on table "public"."profile" from "anon";

revoke insert on table "public"."profile" from "anon";

revoke references on table "public"."profile" from "anon";

revoke select on table "public"."profile" from "anon";

revoke trigger on table "public"."profile" from "anon";

revoke truncate on table "public"."profile" from "anon";

revoke update on table "public"."profile" from "anon";

revoke delete on table "public"."profile" from "authenticated";

revoke insert on table "public"."profile" from "authenticated";

revoke references on table "public"."profile" from "authenticated";

revoke select on table "public"."profile" from "authenticated";

revoke trigger on table "public"."profile" from "authenticated";

revoke truncate on table "public"."profile" from "authenticated";

revoke update on table "public"."profile" from "authenticated";

revoke delete on table "public"."profile" from "service_role";

revoke insert on table "public"."profile" from "service_role";

revoke references on table "public"."profile" from "service_role";

revoke select on table "public"."profile" from "service_role";

revoke trigger on table "public"."profile" from "service_role";

revoke truncate on table "public"."profile" from "service_role";

revoke update on table "public"."profile" from "service_role";

revoke delete on table "public"."rating" from "anon";

revoke insert on table "public"."rating" from "anon";

revoke references on table "public"."rating" from "anon";

revoke select on table "public"."rating" from "anon";

revoke trigger on table "public"."rating" from "anon";

revoke truncate on table "public"."rating" from "anon";

revoke update on table "public"."rating" from "anon";

revoke delete on table "public"."rating" from "authenticated";

revoke insert on table "public"."rating" from "authenticated";

revoke references on table "public"."rating" from "authenticated";

revoke select on table "public"."rating" from "authenticated";

revoke trigger on table "public"."rating" from "authenticated";

revoke truncate on table "public"."rating" from "authenticated";

revoke update on table "public"."rating" from "authenticated";

revoke delete on table "public"."rating" from "service_role";

revoke insert on table "public"."rating" from "service_role";

revoke references on table "public"."rating" from "service_role";

revoke select on table "public"."rating" from "service_role";

revoke trigger on table "public"."rating" from "service_role";

revoke truncate on table "public"."rating" from "service_role";

revoke update on table "public"."rating" from "service_role";

revoke delete on table "public"."trip" from "anon";

revoke insert on table "public"."trip" from "anon";

revoke references on table "public"."trip" from "anon";

revoke select on table "public"."trip" from "anon";

revoke trigger on table "public"."trip" from "anon";

revoke truncate on table "public"."trip" from "anon";

revoke update on table "public"."trip" from "anon";

revoke delete on table "public"."trip" from "authenticated";

revoke insert on table "public"."trip" from "authenticated";

revoke references on table "public"."trip" from "authenticated";

revoke select on table "public"."trip" from "authenticated";

revoke trigger on table "public"."trip" from "authenticated";

revoke truncate on table "public"."trip" from "authenticated";

revoke update on table "public"."trip" from "authenticated";

revoke delete on table "public"."trip" from "service_role";

revoke insert on table "public"."trip" from "service_role";

revoke references on table "public"."trip" from "service_role";

revoke select on table "public"."trip" from "service_role";

revoke trigger on table "public"."trip" from "service_role";

revoke truncate on table "public"."trip" from "service_role";

revoke update on table "public"."trip" from "service_role";

revoke delete on table "public"."vehicle" from "anon";

revoke insert on table "public"."vehicle" from "anon";

revoke references on table "public"."vehicle" from "anon";

revoke select on table "public"."vehicle" from "anon";

revoke trigger on table "public"."vehicle" from "anon";

revoke truncate on table "public"."vehicle" from "anon";

revoke update on table "public"."vehicle" from "anon";

revoke delete on table "public"."vehicle" from "authenticated";

revoke insert on table "public"."vehicle" from "authenticated";

revoke references on table "public"."vehicle" from "authenticated";

revoke select on table "public"."vehicle" from "authenticated";

revoke trigger on table "public"."vehicle" from "authenticated";

revoke truncate on table "public"."vehicle" from "authenticated";

revoke update on table "public"."vehicle" from "authenticated";

revoke delete on table "public"."vehicle" from "service_role";

revoke insert on table "public"."vehicle" from "service_role";

revoke references on table "public"."vehicle" from "service_role";

revoke select on table "public"."vehicle" from "service_role";

revoke trigger on table "public"."vehicle" from "service_role";

revoke truncate on table "public"."vehicle" from "service_role";

revoke update on table "public"."vehicle" from "service_role";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Anyone can update their own photo."
  on "storage"."objects"
  as permissive
  for update
  to public
using ((( SELECT auth.uid() AS uid) = owner))
with check ((bucket_id = 'files'::text));



  create policy "Profile photo is publicly accessible."
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'profiles'::text));



  create policy "Users can delete their own driving licence photo."
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'licences'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "Users can delete their own profile photo."
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "Users can update their own driving licence photo."
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'licences'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "Users can update their own profile photo."
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "Users can upload their own driving licence photo."
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'licences'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "Users can upload their own profile photo."
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'profiles'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



  create policy "Users can view their own driving licence photo."
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'licences'::text) AND ((storage.foldername(name))[1] = ( SELECT (auth.uid())::text AS uid))));



