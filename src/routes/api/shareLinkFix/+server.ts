import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
    try {
        // Parse the incoming JSON request
        const { url } = await request.json();
        console.log("Received URL:", url);  // Log the received URL to verify it's correct

        // Validate the URL format with a regex pattern
        const shareLinkPattern = /https:\/\/www\.reddit\.com\/r\/([^\/]+)\/s\/([a-zA-Z0-9]+)/;
        const match = url.match(shareLinkPattern);

        if (!match) {
            console.error("Invalid URL format:", url);  // Log if URL format doesn't match
            return new Response(JSON.stringify({ error: "Invalid URL format" }), { status: 400 });
        }

        // If URL matches the pattern, follow the redirect
        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });

        if (response.ok) {
            const finalUrl = response.url;
            return new Response(JSON.stringify({ finalUrl }), { status: 200 });
        } else {
            console.error("Failed to follow redirect:", response.status);
            return new Response(JSON.stringify({ error: "Failed to follow redirect" }), { status: 500 });
        }
    } catch (error) {
        console.error("Error processing request:", error);
        return new Response(JSON.stringify({ error: "Error processing request" }), { status: 500 });
    }
};
