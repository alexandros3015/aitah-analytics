<script lang="ts">
	let url: string = $state("");
    let analyzed: boolean = $state(false);


    let upvotes: number = $state(0);
    let downvotes: number = $state(0);
    let updownRatio: number = $state(0);



    async function processURL(urle: string) {
        
        let url = urle.endsWith("/") ? urle.slice(0, -1) : urle;
        url = url + ".json";

        const response: Response = await fetch(url);
        analyzed = true;
        const data: any = await response.json();

        upvotes = data[0]["data"]["children"][0]["data"]["ups"];
        downvotes = data[0]["data"]["children"][0]["data"]["downs"];
        updownRatio = data[0]["data"]["children"][0]["data"]["upvote_ratio"];
    }
</script>


<div class="flex flex-col text-center bg-gray-800 text-white h-screen">
    <h1>Welcome to Am I the Asshole Analytics</h1>
    <p>Gives cool Analytics on assholery.</p>
    <p>Simply enter a URL to an AITAH post and see the results. (e.g. https://www.reddit.com/r/AmItheAsshole/comments/[id]/[post title]/)</p> 
    <input class="border-2 border-purple-700 rounded-lg p-2 transition"
    bind:value={url} type="text" placeholder="Enter a URL" />

    <button class="bg-purple-700 hover:bg-purple-800 text-white font-bold py-2 px-4 rounded-lg" onclick={() => processURL(url)}>Analyze</button>

    {#if analyzed}
        <p>Analyzed URL: {url}</p>
        <p>Upvotes: {upvotes}</p>
        <p>Downvotes: {downvotes}</p>
        <p>Updown Ratio: {updownRatio}</p>
    {:else}
        <p>waiting for response...</p>
    {/if}
</div>
