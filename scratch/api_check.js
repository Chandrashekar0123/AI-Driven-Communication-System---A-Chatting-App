async function checkAPIs() {
  const backendUrl = 'http://localhost:5001/api';
  
  try {
    const res = await fetch(`${backendUrl}/messages/users`);
    console.log('Backend API (Users) Status:', res.ok ? 'SUCCESS' : 'FAILED', res.status);
  } catch (error) {
    console.error('Backend API (Users) Error:', error.message);
  }

  try {
    const res = await fetch(`${backendUrl}/auth/check`);
    console.log('Backend API (Auth) Status:', res.ok ? 'SUCCESS' : 'FAILED', res.status);
  } catch (error) {
    console.error('Backend API (Auth) Error:', error.message);
  }
}

checkAPIs();
