import app from './app'

const PORT = process.env.PORT ?? 3333

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`   Ambiente : ${process.env.NODE_ENV ?? 'development'}`)
  console.log(`   Health   : http://localhost:${PORT}/health`)
})
