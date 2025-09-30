import server from "./server.js"

const port = process.env.PORT || 3000

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

