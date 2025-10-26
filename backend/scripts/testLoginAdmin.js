import http from 'http'

async function run(){
  const data = JSON.stringify({ email: 'crystal6572@gmail.com', adminPassword: 'test1234' })
  const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  }

  const req = http.request(options, (res) => {
    console.log('status', res.statusCode)
    console.log('set-cookie', res.headers['set-cookie'])
    let body = ''
    res.on('data', chunk => body += chunk)
    res.on('end', () => console.log('body', body))
  })
  req.on('error', (e) => { console.error('request failed', e && e.stack ? e.stack : e); process.exit(1) })
  req.write(data)
  req.end()
}

run()
