const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const Task = require('./models/Task');

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/todo_db';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>TODO App</h1><p>Перейдіть у /api/tasks</p>');
});

app.get('/api/tasks', async (req, res) => {
    const tasks = await Task.find();
    res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
    const newTask = new Task({ title: req.body.title });
    const savedTask = await newTask.save();
    res.status(201).json(savedTask);
});

app.put('/api/tasks/:id', async (req, res) => {
    const updated = await Task.findByIdAndUpdate(
        req.params.id,
        { completed: req.body.completed },
        { new: true }
    );
    res.json(updated);
});

app.delete('/api/tasks/:id', async (req, res) => {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
});

mongoose
    .connect(MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    })
    .catch((err) => console.error(err));
