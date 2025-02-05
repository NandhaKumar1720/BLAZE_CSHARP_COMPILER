const express = require("express");
const bodyParser = require("body-parser");
const { Worker } = require("worker_threads");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.post("/", (req, res) => {
    const { code, input } = req.body;

    if (!code) {
        return res.status(400).json({ error: { fullError: "Error: No code provided!" } });
    }

    const worker = new Worker("./csharp-worker.js", {
        workerData: { code, input },
    });

    worker.on("message", (result) => res.json(result));
    worker.on("error", (err) => res.status(500).json({ error: { fullError: `Worker error: ${err.message}` } }));
});

app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
