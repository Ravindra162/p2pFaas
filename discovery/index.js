const express = require('express');
const app = express();
app.use(express.json());

let peers = []; // Stores IPs of other nodes

app.post('/register', (req, res) => {
    const { ip } = req.body;
    if (!peers.includes(ip)) {
        peers.push(ip);
    }
    res.json({ message: 'Registered successfully', peers });
});

app.get('/peers', (req, res) => {
    res.json({ peers });
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
    console.log(`Discovery Service running on port ${PORT}`);
});
