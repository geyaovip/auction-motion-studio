import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the product landing page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Auction Motion Studio/);
  assert.match(html, /让每一件作品/);
  assert.match(html, /href="\/editor"/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /Starter Project/);
});

test("server-renders editor and export routes", async () => {
  const [editor, exportPage] = await Promise.all([render("/editor"), render("/export")]);
  assert.equal(editor.status, 200);
  assert.equal(exportPage.status, 200);
  const editorHtml = await editor.text();
  const exportHtml = await exportPage.text();
  assert.match(editorHtml, /编辑器/);
  assert.match(exportHtml, /导出/);
});
