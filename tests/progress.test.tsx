import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { useCompletedGames } from "../src/utils/progress";

function ProgressReader() {
  return createElement("span", null, `${useCompletedGames().size} completed`);
}

test("progress supports server rendering with a stable empty snapshot", () => {
  assert.match(renderToString(createElement(ProgressReader)), /0 completed/);
});
