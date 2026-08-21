export const dynamic = "force-dynamic";

export function GET() {
  const client = process.env.NEXT_PUBLIC_AD_CLIENT_ID ?? "";
  const publisher = client.replace(/^ca-/, "");
  const body = /^pub-\d+$/.test(publisher)
    ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
    : "# Advertising publisher is not configured.\n";

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
