import app from './app.js';
import env from './config/env.js';

// Initialize Firebase (side-effect import — triggers initializeFirebase())
import './config/firebase.js';

const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Agricultural Credit Platform API running on port ${PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
});
