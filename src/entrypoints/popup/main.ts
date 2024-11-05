import "~/app.css"

import Popup from "./Popup.svelte"
import { mount } from "svelte";

const app = mount(Popup, { target: document.body })
export default app
