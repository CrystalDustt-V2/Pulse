import axios from 'axios'

async function run() {
  try {
    const r = await axios.get('http://localhost:4000/api/posts')
    console.log(JSON.stringify(r.data, null, 2))
  } catch (err) {
    console.error('Error fetching posts:', err.message)
    if (err.response) {
      console.error('Status:', err.response.status)
      console.error('Data:', err.response.data)
    }
  }
}

run()
