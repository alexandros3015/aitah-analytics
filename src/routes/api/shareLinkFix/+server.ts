import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({ request }) => {
  try {
    // Parse the incoming JSON request to extract the URL.
    const { url } = await request.json();
    console.log("Received URL:", url);

    // Define regexes for detecting share and comment links.
    // - The share link: /r/subreddit/s/postId
    // - The comment link: /r/subreddit/comments/postId[/optionalSlug]
    const sharePattern =
      /^https:\/\/www\.reddit\.com\/r\/([^\/]+)\/s\/([a-zA-Z0-9]+)/;
    const commentsPattern =
      /^https:\/\/www\.reddit\.com\/r\/([^\/]+)\/comments\/([a-zA-Z0-9]+)(\/([^\/]+))?/;

    let finalUrl = "";

    if (sharePattern.test(url)) {
      console.log(
        "URL is in /s/ format; performing GET request to follow the redirect."
      );
      // For share links, perform a GET request so that fetch follows the redirect.
      const redirectResponse = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      });
      if (!redirectResponse.ok) {
        console.error(
          "Failed to follow redirect on share URL:",
          redirectResponse.status
        );
        return new Response(
          JSON.stringify({
            error: "Failed to follow redirect on share URL",
          }),
          { status: 500 }
        );
      }
      // The URL after redirection should be the full comments URL.
      finalUrl = redirectResponse.url;
      console.log("Resolved URL:", finalUrl);
    } else if (commentsPattern.test(url)) {
      console.log("URL is in /comments/ format.");
      finalUrl = url;
    } else {
      console.error("Invalid URL format:", url);
      return new Response(
        JSON.stringify({ error: "Invalid URL format" }),
        { status: 400 }
      );
    }

    // At this point, finalUrl should be in /comments/ format.
    // Check if it already contains a title slug (i.e. a nonempty fourth capture group):
    const match = finalUrl.match(commentsPattern);
    if (!match) {
      console.error("Unexpected URL format after resolving:", finalUrl);
      return new Response(
        JSON.stringify({ error: "Unexpected URL format" }),
        { status: 500 }
      );
    }
    const subreddit = match[1];
    const postId = match[2];
    const hasSlug = Boolean(match[4] && match[4].trim() !== "");

    // If the title slug is missing, fetch the JSON data for the post to extract it.
    if (!hasSlug) {
      // Remove trailing slash (if any) and build the JSON endpoint.
      const normalizedUrl =
        finalUrl.endsWith("/") && finalUrl !== "https://www.reddit.com/"
          ? finalUrl.slice(0, -1)
          : finalUrl;
      const jsonUrl = normalizedUrl + ".json";
      console.log("Fetching JSON data from:", jsonUrl);
      const jsonResponse = await fetch(jsonUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
            "(KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
        },
      });
      if (!jsonResponse.ok) {
        console.error(
          "Failed to fetch post JSON data:",
          jsonResponse.status
        );
        return new Response(
          JSON.stringify({ error: "Failed to fetch post JSON data" }),
          { status: 500 }
        );
      }
      const jsonData = await jsonResponse.json();
      const postData = jsonData[0]?.data?.children[0]?.data;
      if (!postData || !postData.title) {
        console.error("Could not extract post data or title.");
        return new Response(
          JSON.stringify({ error: "Could not extract post data" }),
          { status: 500 }
        );
      }
      const title = postData.title;
      // Slugify the title: convert to lowercase, replace sequences of
      // non-alphanumeric characters with underscores, and trim any extra underscores.
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      // Assemble the final URL including the slug.
      finalUrl = `https://www.reddit.com/r/${subreddit}/comments/${postId}/${slug}`;
      console.log("Final URL after adding title slug:", finalUrl);
    }

    // TODO: add full functionality


        console.log(`URL:`, finalUrl);

        if (finalUrl === null) finalUrl = url;
        finalUrl = cleanUrl(finalUrl);

        finalUrl = finalUrl.endsWith("/") ? finalUrl.slice(0, -1) : finalUrl;
        finalUrl = finalUrl + ".json";

        let data: any;
        try {
            const response: Response = await fetch(finalUrl);
            data = await response.json();

            return new Response(
                JSON.stringify({ data: data }), { status: 200 }
            );
        }
        catch (e) {
            console.error(`Error fetching data: ${e}`);
            alert(`Error fetching data: ${e}`);
            return new Response(
                JSON.stringify({ error: "Error fetching data" }), { status: 500 }
            );
        }

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Error processing request" }), { status: 500 }
    );
  }
};

function cleanUrl(url: string): string {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname;
}