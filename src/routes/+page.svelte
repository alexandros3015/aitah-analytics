<script lang="ts">

    const Opinion = {
        NTA: "Not the Asshole",
        YTA: "You're the Asshole",
        ESH: "Everyone sucks here",
        NAH: "Not assholes here",
        INFO: "More information needed" ,
        NONE: "None"
    } as const;

    type Reply = {
        id: number;
        upvotes: number;
        downvotes: number;
        upvote_ratio: number;
        reliability: number;
        opinion: typeof Opinion[keyof typeof Opinion];
    };
  
    const replyAccuracy: number = 20;
    let replies: Reply[] = [];

	let url: string = $state("");
    let analyzed: boolean = $state(false);
    let analyzedReply:boolean = $state(false);


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

        for (let i = 0; i < replyAccuracy; i++) {
            console.log(`Processing reply ${i}`);
            const replyInfo: any = data[1]["data"]["children"][i]["data"]
            const text: string = replyInfo["body"];
            let opinion: typeof Opinion[keyof typeof Opinion] = Opinion.NAH;

            if (text.toLowerCase().includes("yta")) opinion = Opinion.YTA;
            else if (text.toLowerCase().includes("nta")) opinion = Opinion.NTA;
            else if (text.toLowerCase().includes("esh")) opinion = Opinion.ESH;
            else if (text.toLowerCase().includes("nah")) opinion = Opinion.NAH;
            else if (text.toLowerCase().includes("info")) opinion = Opinion.INFO;
            else opinion = Opinion.NONE;

            replies.push({
                id: i,
                upvotes: replyInfo["ups"],
                downvotes: replyInfo["downs"],
                upvote_ratio: replyInfo["upvote_ratio"],
                reliability: replyInfo["upvote_ratio"], // TODO: calculate reliability score more accurately
                opinion: opinion
            });
        }
        analyzedReply = true;
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

    {/if}
    {#if analyzedReply}
        <p>Analyzed Reply</p>
        <p>Upvotes: {replies[0].upvotes}</p>
        <p>Downvotes: {replies[0].downvotes}</p>
        <p>Updown Ratio: {replies[0].upvote_ratio}</p>
        <p>Reliability: {replies[0].reliability}</p>
        <p>Opinion: {replies[0].opinion}</p>
    {/if}
</div>
