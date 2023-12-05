const functions = require('firebase-functions');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK - replace with your credentials
const serviceAccount = require('./calorease-c3cd0-firebase-adminsdk-t7szv-ce1adb38f4.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://console.firebase.google.com/u/2/project/calorease-c3cd0/firestore?hl=id' // Firestore Database URL
});

const firestore = admin.firestore();
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Tambah data makanan
app.post('/makanan', async (req, res) => {
    try {
        const { name, protein, calories, fat, carbohydrates } = req.body;

        await firestore.collection('makanan').add({
            name,
            protein,
            calories,
            fat,
            carbohydrates
        });

        res.status(201).json({ message: 'Food item added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding food item', details: error });
    }
});

// Get semua data dari makanan
app.get('/makanan', async (req, res) => {
    try {
        const snapshot = await firestore.collection('makanan').get();
        const makanan = [];

        snapshot.forEach((doc) => {
            makanan.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json(makanan);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching food items', details: error });
    }
});

// Update data makanan
app.put('/makanan/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, protein, calories, fat, carbohydrates } = req.body;

        const foodRef = firestore.collection('makanan').doc(id);


        const doc = await foodRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        // Update data makanan
        await foodRef.update({
            name,
            protein,
            calories,
            fat,
            carbohydrates
        });

        res.status(200).json({ message: 'Food item updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating food item', details: error });
    }
});

//Delete data makanan
app.delete('/makanan/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const foodRef = firestore.collection('makanan').doc(id);

        // Cek data apakah ada atau tidak
        const doc = await foodRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        // Delete data makanan
        await foodRef.delete();

        res.status(200).json({ message: 'Food item deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting food item', details: error });
    }
});

//Get data makanan dari ID
app.get('/makanan/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const foodRef = firestore.collection('makanan').doc(id);

        // Data makanan apabila tidak tersedia
        const doc = await foodRef.get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.status(200).json({ id: doc.id, ...doc.data() });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching food item', details: error });
    }
});

// Get data makanan by name
app.get('/makanan/nama/:name', async (req, res) => {
    try {
        const { name } = req.params;

        // Query Firestore for data with the provided name
        const querySnapshot = await firestore.collection('makanan').where('name', '==', name).get();

        if (querySnapshot.empty) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        const makanan = [];
        querySnapshot.forEach((doc) => {
            makanan.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.status(200).json(makanan);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching food item by name', details: error });
    }
});

exports.api = functions.https.onRequest(app);