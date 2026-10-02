async function main() {
  const response = await fetch("http://localhost:3000/releases/process", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      creatorName: "Mina Loops",
      assetTitle: "Night Bus Drum Kit",
      assetKind: "sample-library",
      releaseNotes: "Twenty-four clipped percussion loops, normalized and tagged by tempo.",
      downloadUrl: "https://downloads.example.com/night-bus",
      subscribers: [
        { id: "sub_free", displayName: "Ari", tier: "free" },
        { id: "sub_supporter", displayName: "Jo", tier: "supporter" },
        { id: "sub_studio", displayName: "Ren", tier: "studio" }
      ]
    })
  });

  const result: unknown = await response.json();
  console.log(JSON.stringify(result, null, 2));
  if (!response.ok) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
