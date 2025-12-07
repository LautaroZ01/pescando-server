import app from "./server.js"
import { connectDB } from "./src/config/db.js";

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})

