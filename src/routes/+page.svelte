<script lang="ts">
    import Chart from "chart.js/auto";

    const debug = $state(false);

    // Define the voting system options
    const Opinion = {
        NTA: "Not the Asshole",
        YTA: "You're the Asshole",
        ESH: "Everyone sucks here",
        NAH: "Not assholes here",
        INFO: "More information needed",
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


    // Define ALL the variables
    let replyAccuracy: number = 20;
    let replies: Reply[] = $state([]);
    let opinionTotal = $state({});
    let averageOpinion: Record<string, number> = $state({});

    let url: string = $state("");
    let analyzed: boolean = $state(false);
    let analyzedReply: boolean = $state(false);
    let generalConsensus: string = $state("");

    let upvotes: number = $state(0);
    let downvotes: number = $state(0);
    let updownRatio: number = $state(0);

    // Fetch the data from the URL
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

        // Process the replies
        for (let i = 0; i < replyAccuracy; i++) {
            try {
                console.log(`Processing reply ${i}`);
                const replyInfo: any = data[1]["data"]["children"][i]["data"];

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
            } catch (e) {
                console.log(`Error processing reply ${i}: ${e}`);
            }

        }

        // Calculate opinion totals
        opinionTotal = {
            "NTA": replies.filter(reply => reply.opinion === Opinion.NTA).length,
            "YTA": replies.filter(reply => reply.opinion === Opinion.YTA).length,
            "ESH": replies.filter(reply => reply.opinion === Opinion.ESH).length,
            "NAH": replies.filter(reply => reply.opinion === Opinion.NAH).length,
            "INFO": replies.filter(reply => reply.opinion === Opinion.INFO).length
        };

        // Calculate general consensus
        let consensus = (Object.entries(opinionTotal) as [string, number][]).reduce(
            (a, b) => (b[1] > a[1] ? b : a),
            ["NONE", 0]
        );

        generalConsensus = consensus[0];

        analyzedReply = true;
        console.log(replies);
    }

    // Aggregate data for one pie chart
    $effect(() => {
        if (analyzedReply) {

        // Create the pie chart with aggregated data
        const canvas = document.getElementById("aggregate-chart") as HTMLCanvasElement;
        if (canvas) {
            new Chart(canvas, {
                type: "pie",
                data: {
                    labels: ["NTA", "YTA", "ESH", "NAH", "INFO"],
                    datasets: [
                        {
                            label: "Votes",
                            data: [replies.filter(reply => reply.opinion === Opinion.NTA).length, replies.filter(reply => reply.opinion === Opinion.YTA).length, replies.filter(reply => reply.opinion === Opinion.ESH).length, replies.filter(reply => reply.opinion === Opinion.NAH).length, replies.filter(reply => reply.opinion === Opinion.INFO).length],
                            backgroundColor: ["#FF6384", "#36A2EB", "#FFFF00", "#00FF00", "#FF0000"],
                            borderColor: "#fff",
                            borderWidth: 1
                        }
                    ]
                },
                options: {
                    responsive: false,
                    plugins: {
                        legend: {
                            position: "top"
                        }
                    }
                }
            });


        }
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

        <p class="p-1">Overall Votes Data:</p>
        {#if analyzedReply}

            <div class="text-5xl">
                REMEMBER:
                <li>
                    <ol>NTA: Not the Asshole</ol>
                    <ol>YTA: You're the Asshole</ol>
                    <ol>ESH: Everyone sucks here</ol>
                    <ol>NAH: Not assholes here</ol>
                    <ol>INFO: More information needed</ol>
                </li>

            </div>

            <div class="grid grid-cols-2 items-center"> 
                <div class="p-2">
                    {#each Object.entries(opinionTotal) as [key, value]}
                        <p class="p-1 text-3xl">{key}: {value}</p>
                    {/each}
                    <p class="text-4xl">Average Opinion: {generalConsensus}</p> 
                </div>
                <canvas id="aggregate-chart" width="800" height="800"></canvas>    
            </div>
        <!--Wow-->
        {/if}
    {/if}
</div>
