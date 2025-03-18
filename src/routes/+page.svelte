<script lang="ts">
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";

    const debug = $state(true); // Make sure to set this to false before deploying

    const Opinion = {
        NTA: "Not the Asshole",
        YTA: "You're the Asshole",
        ESH: "Everyone sucks here",
        NAH: "Not assholes here",
        INFO: "More information needed" ,
        NONE: "None or Unknown"
    } as const;

    type Reply = {
        id: number;
        message: string;
        upvotes: number;
        downvotes: number;
        upvote_ratio: number;
        reliability: number;
        opinion: typeof Opinion[keyof typeof Opinion];
    };
  
    let replyAccuracy: number = 20;
    let replies: Reply[] = $state([]);

	let url: string = $state("");
    let analyzed: boolean = $state(false);
    let analyzedReply:boolean = $state(false);

    let upvotes: number = $state(0);
    let downvotes: number = $state(0);
    let updownRatio: number = $state(0);


    async function processURL(urle: string) {
        analyzed = false;
        analyzedReply = false;
        replies = [];
        
        let url = urle.endsWith("/") ? urle.slice(0, -1) : urle;
        url = url + ".json";

        const response: Response = await fetch(url);
        analyzed = true;
        const data: any = await response.json();

        replyAccuracy = data[1]["data"]["children"].length - 1;
        console.log(`Reply Accuracy: ${replyAccuracy}`);

        upvotes = data[0]["data"]["children"][0]["data"]["ups"];
        downvotes = data[0]["data"]["children"][0]["data"]["downs"];
        updownRatio = data[0]["data"]["children"][0]["data"]["upvote_ratio"];

        for (let i = 0; i < replyAccuracy; i++) {
            try { 
                console.log(`Processing reply ${i}`);
                const replyInfo: any = data[1]["data"]["children"][i]["data"]

                if (replyInfo["author"] == "Judgement_Bot_AITA") continue;

                const upvote_ratioREPLY: number = Math.min(replyInfo["ups"] / replyInfo["downs"], 1);
                const text: string = replyInfo["body"];
                let opinion: typeof Opinion[keyof typeof Opinion] = Opinion.NAH;
                

                if (/yta/.test(text.toLowerCase())) opinion = Opinion.YTA;
                else if (/nta/.test(text.toLowerCase())) opinion = Opinion.NTA;
                else if (/esh/.test(text.toLowerCase())) opinion = Opinion.ESH;
                else if (/nah/.test(text.toLowerCase())) opinion = Opinion.NAH;
                else if (/info/.test(text.toLowerCase())) opinion = Opinion.INFO;
                else opinion = Opinion.NONE;

                replies.push({
                    id: i,
                    upvotes: replyInfo["ups"],
                    downvotes: replyInfo["downs"],
                    upvote_ratio: upvote_ratioREPLY,
                    reliability: upvote_ratioREPLY, // TODO: calculate reliability score more accurately
                    opinion: opinion,
                    message: text
                });
            }
            catch (e) {
                console.log(`Error processing reply ${i}: ${e}`);
            }
        analyzedReply = true;
        console.log(replies);
        }
    }

    
    onMount(() => {
        // Once the replies are processed and analyzed, create the charts for each reply
        if (analyzedReply) {
            replies.forEach((reply, index) => {
                const canvas = document.getElementById(`chart-${index}`) as HTMLCanvasElement;
                if (canvas) {
                    new Chart(canvas, {
                        type: "pie",
                        data: {
                            labels: ["Upvotes", "Downvotes"],
                            datasets: [
                                {
                                    label: "Votes",
                                    data: [reply.upvotes, reply.downvotes],
                                    backgroundColor: ["#FF6384", "#36A2EB"],
                                    borderColor: "#fff",
                                    borderWidth: 1
                                }
                            ]
                        },
                        options: {
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: "top"
                                }
                            }
                        },
                    });
                }
            });
        }
    });
</script>


<div class="flex flex-col text-center bg-gray-800 text-white min-h-screen">
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


        <p class="p-1">Replies data:</p>
        {#if analyzedReply}
            <p></p>
        {/if}

    {/if}
</div>
