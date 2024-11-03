const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

let taskQueue = [];
let peers = [];
const maxTasks = 5;

// Simulate task execution
function executeTask(task) {
    return new Promise(resolve => setTimeout(() => resolve({ status: 'completed', result: task.data }), 1000));
}

// Request a decision from the Learner Service
async function decideAction(task) {
    const response = await axios.post(`http://learner:5001/decide`, { state: task.state });
    return response.data.action;
}

async function handleTask(task) {
    const action = await decideAction(task);

    if (action === 'accept' && taskQueue.length < maxTasks) {
        taskQueue.push(task);
        executeTask(task).then(result => console.log('Task completed:', result));
    } else if (action === 'forward' && peers.length > 0) {
        const peer = peers[Math.floor(Math.random() * peers.length)];
        await axios.post(`http://${peer}:5000/function`, task);
    } else {
        console.log('Task rejected');
    }
}

app.post('/function', async (req, res) => {
    const task = req.body;
    await handleTask(task);
    res.json({ status: 'task received' });
});

// Update peers from the Discovery Service
async function updatePeers() {
    try {
        const response = await axios.get(`http://discovery:5002/peers`);
        peers = response.data.peers;
    } catch (err) {
        console.error('Failed to update peers:', err.message);
    }
}

setInterval(updatePeers, 10000); // Update peers every 10 seconds

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Scheduler Service running on port ${PORT}`);
});
