<script lang="ts">
	let url: string = $state("");

    function processURL(url: string) {
        // TODO: Process URL
    }
</script>


<div class="flex flex-col text-center bg-gray-800 text-white h-screen">
    <h1>Welcome to Am I the Asshole Analytics</h1>
    <p>Gives cool Analytics on assholery.</p>
    <p>Simply enter a URL to an AITAH post and see the results. (e.g. https://www.reddit.com/r/AmItheAsshole/comments/[id]/[post title]/)</p> 
    <input class="border-2 border-purple-700 rounded-lg p-2"
    bind:value={url} type="text" placeholder="Enter a URL" />
</div>
