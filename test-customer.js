const http = require('http');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwZTFhOGJlOS0xOTkwLTQ4ZmMtOGRkNC1kNjY4MmI3MTQ1ZDYiLCJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNzg4MzY0NzQyLCJleHAiOjE3ODgzOTM1NDJ9.PrXjoMy6JyqAABj17wVY2URV33L4r3RTqurtUyMrUBw';

const req = http.get('http://localhost:3001/api/customers?limit=3', { headers: { Authorization: 'Bearer ' + token } }, (res) => {
  let data = '';
  res.on('data', (c) => data += c);
  res.on('end', () => { console.log('Status:', res.statusCode); console.log('Body:', data); });
});
req.on('error', (e) => { console.log('ERROR:', e.message); });
