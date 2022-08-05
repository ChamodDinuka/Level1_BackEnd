const express = require('express')
const bodyParser = require('body-parser')
const uuid = require('uuid').v4
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config({path:'./config.env'})
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.post('/', async (req, res) => {
    let error, status
    try {
        const token = req.body
        const customer = await stripe.customers.create({
            email: req.body.email,
            source: req.body.id

        })
        const key = uuid();
        const charge = await stripe.charges.create(
            {
                amount: 100,
                currency: "USD",
                customer: customer.id,
                receipt_email: token.email,
                description: "Reservation Payment",
            },
            { idempotencyKey: key }
        );
        status = "success";
    } catch (error) {
        console.log(error)
        status = "failure";
    }
    res.json({ error, status });
})

const PORT = process.env.PORT || 3001
app.listen(PORT)