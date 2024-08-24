/* @jsx h */

import type { InferResponseType } from "hono/client";
import { hc } from "hono/client";
import { useEffect, useState } from "hono/jsx";
import { ApiType } from "~/functions/api/root.ts";
import { h, render } from "preact";

const root = document.getElementById("mount");

if (root) {
  render(<App />, root!);
}

function App() {
  const client = hc<ApiType>("/");
  const $get = client.api.hello.$get;

  const [data, setData] = useState<InferResponseType<typeof $get>>();

  useEffect(() => {
    const fetchData = async () => {
      const res = await $get({
        query: {
          name: "Pages",
        },
      });
      const responseData = await res.json();
      setData(responseData);
    };
    fetchData();
  }, []);

  return (
    <main>
      <div>
        <h1>hello</h1>
        <h1>{data?.message}</h1>
      </div>
    </main>
  );
}
