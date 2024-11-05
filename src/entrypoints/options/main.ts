import "~/app.css"

import Options from "./Options.svelte"
import { mount } from "svelte";

const app = mount(Options, { target: document.body })
export default app
