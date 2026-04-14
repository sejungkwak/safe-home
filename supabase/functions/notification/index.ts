// This Supabase edge function is modified based on
// https://supabase.com/docs/guides/functions/examples/push-notifications

// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// reflect notification table
interface Notification {
  id: string;
  user_id: string;
  recipient_id: string;
  recipient_token: string;
  title: string;
  body: string;
  type:
    | "ride_requested"
    | "driver_accepted"
    | "rider_accepted"
    | "driver_cancelled"
    | "rider_cancelled";
  trip_id: string | null;
}

// payload sent by Supabase webhook on notification record insert
interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: Notification;
  schema: "public";
  old_record: null | Notification;
}

Deno.serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    // forward the inserted notification record using Expo push notification
    const res = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("EXPO_ACCESS_TOKEN")}`,
      },
      // read notification record from payload
      body: JSON.stringify({
        to: payload.record.recipient_token,
        title: payload.record.title,
        body: payload.record.body,
        data: {
          type: payload.record.type,
          trip_id: payload.record.trip_id,
        },
        sound: "default",
        priority: "high",
      }),
    }).then((res) => res.json());

    // return Expo API response
    return new Response(JSON.stringify(res), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // return webhook or push notification error
    return new Response(JSON.stringify({ ok: false, error: String(error) }), {
      headers: { "Content-Type": "application/json" },
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/notification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
