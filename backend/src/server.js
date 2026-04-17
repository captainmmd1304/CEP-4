import 'dotenv/config';
import { createApp } from './app.js';

if (
  process.env.NODE_ENV === 'production'
  && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace-with-a-strong-random-secret')
) {
  throw new Error('JWT_SECRET must be set to a secure value before starting the server');
}

const app = createApp();
const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`Code Sathi backend listening on http://localhost:${port}`);
});
