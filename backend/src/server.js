import app from './app.js';
import env from './config/env.js';
import { initializeFirebase } from './config/firebase.js';

import { getAtStatus } from './clients/africasTalking.js';

await initializeFirebase();

const PORT = env.PORT;
const at = getAtStatus();

app.listen(PORT, () => {
  console.log(`🚀 Agricultural Credit Platform API running on port ${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   My Readiness: http://localhost:${PORT}/api/readiness/:lookup`);
  console.log(`   USSD callback: ${at.callbacks.ussd}`);
  console.log(`   Voice callback: ${at.callbacks.voice}`);
  console.log(`   AT sandbox: ${at.sandbox ? 'yes' : 'no'} · SMS SDK ${at.smsOutbound ? 'ready' : 'needs AT_API_KEY'}`);
  console.log(`   AT simulator: ${at.simulator}`);
});
