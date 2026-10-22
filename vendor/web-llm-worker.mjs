/* Web Worker pentru WebLLM (Constelar). Înlocuiește vechiul worker blob care importa din esm.run. */
import { WebWorkerMLCEngineHandler } from "./web-llm@0.2.84/web-llm.min.js";
const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg) => { handler.onmessage(msg); };
