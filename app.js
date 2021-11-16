require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const stripe = require('stripe')(process.env.STRIPE_API_KEY);
const STRIPE_API = require('./api/stripe-functions.js');
const db = require('./config/db.config');
const Payment = db.user

const app = express();
const port = 3000;
const router = express.Router();


/* Set up Express to serve HTML files using "res.render" with help of Nunjucks */
app.set('view engine', 'html');
app.engine('html', nunjucks.render);
nunjucks.configure('views', { noCache: true });

app.use(express.static(__dirname));
app.use('/styles', express.static('styles'));
app.use(bodyParser());
app.use('/', router);


/* Place all routes here */
router.get('/', (req, res) => {
  STRIPE_API.getAllProductsAndPlans().then(products => {
    res.render('adminView.html', { products: products });
  });
});

router.get('/home', (req, res) => {

  res.render('homeView.html');
});

router.post('/createItem', async (req, res) => {
  //    const { product } = req.body;
  const product = {
    "name": 'iPhone 12',
    "image": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-12-purple-select-2021?wid=470&hei=556&fmt=jpeg&qlt=95&.v=1617130317000",
    "amount": 100,
    "quantity": 1
  }
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: product.amount * 100,
        },
        quantity: product.quantity,
      },
    ],
    mode: "payment",
    success_url: 'http://localhost:4242/success',
    cancel_url: 'http://localhost:4242/cancel',
  });
  console.log('-------session--------', session)
  const payment_ = {

    userName: "ghassan"
    , price: session.amount_total / 100
    , status: "pending"
    , Tid: session.payment_intent

  }
  await Payment.create(payment_)
  res.redirect(session.url)

})


router.get('/success', (req, res) => {

  res.send('Payment Successful')
})
router.get('/cancel', (req, res) => { res.send('Payment cancelled') })


/* Create Product */
router.get('/createProduct', (req, res) => {
  res.render('createProduct.html');
});


router.post('/createProduct', (req, res) => {
  STRIPE_API.createProduct(req.body).then(() => {
    res.render('createProduct.html', { success: true });
  });
});


/* Create Plan */
router.post('/createPlan', (req, res) => {
  res.render('createPlan.html', {
    productId: req.body.productId,
    productName: req.body.productName
  });
});


router.post('/createPlanForReal', (req, res) => {
  STRIPE_API.createPlan(req.body).then(() => {
    res.render('createPlan.html', { success: true });
  });
});

router.get('/customerView', (req, res) => {
  STRIPE_API.getAllProductsAndPlans().then(products => {
    products = products.filter(product => {
      return product.plans.length > 0;
    });

    res.render('customerView.html', { products: products });
  });
});


router.post('/signUp', (req, res) => {
  var product = {
    name: req.body.productName
  };

  var plan = {
    id: req.body.planId,
    name: req.body.planName,
    amount: req.body.planAmount,
    interval: req.body.planInterval,
    interval_count: req.body.planIntervalCount
  }

  res.render('signUp.html', { product: product, plan: plan });
});


router.post('/processPayment', (req, res) => {
  var product = {
    name: req.body.productName
  };

  var plan = {
    id: req.body.planId,
    name: req.body.planName,
    amount: req.body.planAmount,
    interval: req.body.planInterval,
    interval_count: req.body.planIntervalCount
  }

  STRIPE_API.createCustomerAndSubscription(req.body).then(() => {

    res.render('signup.html', { product: product, plan: plan, success: true });
  }).catch(err => {
    res.render('signup.html', { product: product, plan: plan, error: true });
  });
});


app.post('/webhooks', express.json({ type: 'application/json' }), (request, response) => {
  const event = request.body;
  // Handle the event


  switch (event.type) {

    case 'checkout.session.completed':
      const checkout = event.data.object
      console.log('------Session completed------', checkout)
      response.status(200).send()
      // const payment = {

      // }
      // Payment.create()
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`PaymentIntent for ${paymentIntent.amount / 100} was successful!`, paymentIntent);
      //   console.log(`Finding Payment for id: --------- ${paymentIntent.id}`);
      // Payment.findOne({ where: { Tid: paymentIntent.id } })
      //   .then(record => {

      //     if (!record) {
      //       throw new Error('No record found')
      //     }

      //     console.log(`retrieved record ${JSON.stringify(record, null, 2)}`)

      //     let values = {
      //       status: 'successful'
      //     }

      //     record.update(values).then(updatedRecord => {
      //       console.log(`updated record ${JSON.stringify(updatedRecord, null, 2)}`)
      //       // login into your DB and confirm update
      //     })

      //   })
      //   .catch((error) => {
      //     // do seomthing with the error
      //     throw new Error(error)
      //   })
      // Then define and call a method to handle the successful payment intent.
      // handlePaymentIntentSucceeded(paymentIntent);
      break;
    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    case 'payment_intent.created':
      const paymentMethod1 = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
  }
  // Return a 200 response to acknowledge receipt of the event
  response.send();
});

/* Start listening on specified port */
app.listen(port, () => {
  console.info('App listening on port', port)
});

