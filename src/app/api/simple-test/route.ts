export async function GET() {
  return Response.json({ 
    message: 'Hello from simple test',
    timestamp: new Date().toISOString(),
  })
}
