/* @jsx h */

import { h, render } from "preact";

const mount = document.getElementById("mount");

if (mount) {
  render(<App />, mount!);
}

function App() {
  return (
    <main>
      <div>
        <h1>hello</h1>
      </div>
    </main>
  );
}
