/**
 * Environment Variable Validator
 * Checks for required environment variables on startup
 */

const requiredVars = [
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET'
];

const optionalVars = [
  'PORT',
  'NODE_ENV',
  'ALLOWED_ORIGINS',
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'RESEND_API_KEY',
  'ADMIN_EMAIL'
];

exports.validateEnv = () => {
  console.log('🔍 Validating environment variables...\n');
  
  let hasErrors = false;

  // Check required variables
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      console.error(`❌ Missing required: ${varName}`);
      hasErrors = true;
    } else {
      console.log(`✅ ${varName}: configured`);
    }
  });

  console.log('');

  // Check optional variables
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: configured`);
    } else {
      console.log(`⚠️  ${varName}: not set (optional)`);
    }
  });

  console.log('');

  if (hasErrors) {
    console.error('⚠️  Some required environment variables are missing.');
    console.error('The server will start, but some features may not work.\n');
  } else {
    console.log('✅ All required environment variables are set.\n');
  }
};
