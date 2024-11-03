const express = require('express');
const app = express();
app.use(express.json());

let Q = {}; // Q-table for state-action pairs
const learningRate = 0.1;
const discountFactor = 0.95;

function getQ(state, action) {
    return Q[`${state}-${action}`] || 0.0;
}

app.post('/learn', (req, res) => {
    const { state, action, reward, nextState } = req.body;
    const maxQNext = Math.max(...["accept", "forward", "reject"].map(a => getQ(nextState, a)));

    const oldQ = getQ(state, action);
    Q[`${state}-${action}`] = oldQ + learningRate * (reward + discountFactor * maxQNext - oldQ);

    res.json({ message: 'Q-value updated' });
});

app.post('/decide', (req, res) => {
    const { state } = req.body;
    const bestAction = ["accept", "forward", "reject"].reduce((best, a) => getQ(state, a) > getQ(state, best) ? a : best);
    res.json({ action: bestAction });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Learner Service running on port ${PORT}`);
});
