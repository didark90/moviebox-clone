import { app, ensureSeed } from '../server/index.js';

let ready;

export default async function handler(req, res) {
  if (!ready) ready = ensureSeed();
  await ready;
  return app(req, res);
}
