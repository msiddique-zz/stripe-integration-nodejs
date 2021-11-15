# stripe-recurring-subscriptions

## Important Note 📌

An updated version of this codebase is available here: [stripe-subscriptions-sca](https://github.com/code-nebula/stripe-subscriptions-sca)

The updated version shows you how to set up recurring subscriptions that support SCA (Strong Customer Authentication). 

We recommend checking out the following tutorials, which complement the new codebase:

🌟[How to Set up a Basic Node Application with Stripe](https://codenebula.io/node.js/stripe/2020/03/03/how-to-set-up-a-basic-node-application-with-stripe/)

🌟[How to use Stripe’s new Payment Intents API with Node.js to create subscriptions with built-in SCA](https://codenebula.io/node.js/stripe/sca/2020/03/03/how-to-use-stripes-new-payment-intents-api-with-node-js-to-create-subscriptions-with-built-in-sca/)


## Overview

This repository shows you how to create recurring subscriptions with Stripe and Node.js.

It uses Express for creating a simple server, Nunjucks for templating, and the Stripe API.

It features 

1. An **Admin View** when you can create Stripe Products and Plans via the Stripe API.
2. A **Client View** where your users can view and pay for your subscription plans.

