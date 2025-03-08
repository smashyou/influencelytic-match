
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const INSTAGRAM_CLIENT_ID = Deno.env.get("INSTAGRAM_CLIENT_ID");
const INSTAGRAM_CLIENT_SECRET = Deno.env.get("INSTAGRAM_CLIENT_SECRET");
const REDIRECT_URI = Deno.env.get("SUPABASE_URL") 
  ? `${Deno.env.get("SUPABASE_URL")}/functions/v1/instagram-auth/callback`
  : "http://localhost:54321/functions/v1/instagram-auth/callback";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.split("/").pop();

    // Step 1: Initiate OAuth flow
    if (!path || path === "index") {
      // Ensure secrets are set
      if (!INSTAGRAM_CLIENT_ID) {
        return new Response(
          JSON.stringify({ error: "Missing INSTAGRAM_CLIENT_ID" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // This endpoint redirects the user to Instagram's authorization screen
      const instagramAuthUrl = new URL("https://api.instagram.com/oauth/authorize");
      instagramAuthUrl.searchParams.append("client_id", INSTAGRAM_CLIENT_ID);
      instagramAuthUrl.searchParams.append("redirect_uri", REDIRECT_URI);
      instagramAuthUrl.searchParams.append("response_type", "code");
      instagramAuthUrl.searchParams.append("scope", "user_profile,user_media");

      return new Response(
        JSON.stringify({ authUrl: instagramAuthUrl.toString() }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Handle callback from Instagram
    if (path === "callback") {
      const code = url.searchParams.get("code");
      
      if (!code) {
        return new Response(
          JSON.stringify({ error: "No authorization code received" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
        return new Response(
          JSON.stringify({ error: "Missing Instagram credentials" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
      }

      // Exchange code for access token
      const tokenResponse = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: INSTAGRAM_CLIENT_ID,
          client_secret: INSTAGRAM_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: REDIRECT_URI,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(
          JSON.stringify({ error: tokenData.error_message || "Failed to exchange code for token" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }

      // Get user info
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${tokenData.access_token}`
      );
      
      const userData = await userResponse.json();

      // Return HTML that will post the result to the opener window and close itself
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head><title>Authorization successful</title></head>
        <body>
          <h1>Authorization successful!</h1>
          <p>You can close this window and return to the app.</p>
          <script>
            window.opener.postMessage(
              {
                type: "instagram-auth-success",
                data: ${JSON.stringify({
                  accessToken: tokenData.access_token,
                  userId: tokenData.user_id,
                  username: userData.username
                })}
              }, 
              "*"
            );
            setTimeout(function() { window.close(); }, 1000);
          </script>
        </body>
        </html>`,
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "text/html",
          },
        }
      );
    }

    // Handle storing connected account in database
    if (path === "store") {
      try {
        const { userId, accessToken, platform, platformUserId, username } = await req.json();
        
        // Validate the request
        if (!userId || !accessToken || !platform || !platformUserId) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Here we would store the connection in our database
        // For now, we'll just return success
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `Successfully connected ${platform} account` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      } catch (error) {
        return new Response(
          JSON.stringify({ error: error.message }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
      }
    }

    // Handle unknown paths
    return new Response(
      JSON.stringify({ error: "Not found" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
