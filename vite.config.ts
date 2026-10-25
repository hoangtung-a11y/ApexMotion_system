import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

// Vite Plugin tích hợp REST API Backend (/api/*) lưu trữ bền vững vào database/apexmotion_db.json
function apexMotionApiPlugin() {
  const dbPath = path.resolve(process.cwd(), 'database', 'apexmotion_db.json')

  return {
    name: 'apexmotion-rest-api',
    configureServer(server: any) {
      server.middlewares.use('/api/db', (req: any, res: any) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method === 'GET') {
          if (fs.existsSync(dbPath)) {
            res.end(fs.readFileSync(dbPath, 'utf-8'))
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'DB not initialized yet' }))
          }
          return
        }
        if (req.method === 'POST') {
          let body = ''
          req.on('data', (chunk: any) => {
            body += chunk.toString()
          })
          req.on('end', () => {
            try {
              fs.mkdirSync(path.dirname(dbPath), { recursive: true })
              fs.writeFileSync(dbPath, body, 'utf-8')
              res.end(JSON.stringify({ status: 'ok', updatedAt: new Date().toISOString() }))
            } catch (err: any) {
              res.statusCode = 500
              res.end(JSON.stringify({ error: err.message }))
            }
          })
          return
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), apexMotionApiPlugin()],
  server: {
    port: 5173,
    open: false
  }
})
