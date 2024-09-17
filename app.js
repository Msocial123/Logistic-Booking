require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); 

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/form.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'form.html'));
});

app.get('/confirmation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'confirmation.html'));
});

app.get('/cancel.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'cancel.html'));
});

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('MongoDB URI is not defined in environment variables.');
    process.exit(1);
}
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connected to MongoDB');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1); 
});

const bookingSchema = new mongoose.Schema({
    bookingId: { type: String, required: true },
    senderName: String,
    senderMobile: String,
    senderEmail: String,
    senderHouseNumber: String,
    senderStreetName: String,
    senderCity: String,
    senderState: String,
    senderPinCode: String,
    receiverName: String,
    receiverMobile: String,
    receiverEmail: String,
    receiverHouseNumber: String,
    receiverStreetName: String,
    receiverCity: String,
    receiverState: String,
    receiverPinCode: String,
    itemDescription: String,
    itemWeight: Number
});

const Booking = mongoose.model('Booking', bookingSchema);

app.post('/api/bookings', async (req, res) => {
    try {
        const newBooking = new Booking({
            bookingId: uuidv4(), 
            ...req.body 
        });
        const savedBooking = await newBooking.save();

        res.redirect(`/confirmation.html?bookingId=${savedBooking.bookingId}`);
    } catch (error) {
        console.error('Error saving booking:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;

    const isValidUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id);

    if (!id || !isValidUUID) {
        return res.status(400).json({ message: 'Invalid Booking ID.' });
    }

    try {
        const deletedBooking = await Booking.findOneAndDelete({ bookingId: id });
        if (!deletedBooking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        res.json({ message: 'Booking canceled successfully.' });
    } catch (error) {
        console.error('Error canceling booking:', error);
        res.status(500).json({ message: 'Error canceling booking.' });
    }
});

const PORT = process.env.PORT || 3029;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
