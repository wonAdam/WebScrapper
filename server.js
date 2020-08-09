const express = require('express');
const morgan = require('morgan');
const app = express();
const scrapper = require('./scrapper');
const dotenv = require('dotenv');
dotenv.config();

// Middlewares
app.use(express.json());
app.use(morgan('common'));

app.use(scrapper);
// Router
app.route('/').get((req, res) => {
    const data = req.data ;
    res.send({
        status: 'success',
        data
    });
});


const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});