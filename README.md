
  > ## ?? Deprecation warning:
> As the efforts of the Servicebot team are focused on the new [Servicebot.io](https://www.servicebot.io/) version, this version is no longer under active development.
> If you're looking for a modern integration with [Stripe](https://stripe.com/), super easy to set up, and priced for startups, check out the [new project](https://www.servicebot.io/).
> The open source version will be available indefinitely until further notice. For inquiries on continuing development of this project, email us at team@servicebot.io.
<p align="center">
<a href="https://servicebot.io">
<img width="700" heigth="250" src="https://cdn-images-1.medium.com/max/2000/1*NrKUKTgZlEsJNctOKLctjg@2x.png">
</a>
</p>

___
<p align="center">
<b>Open-source Subscription Management System</b>
<p align="center">Automate what happens when customers subscribe, cancel, and upgrade</p>
</p>

## Overview
Servicebot is an XaaS (Anything-as-a-service) platform. You can define requestable service templates with an advanced service designer that supports many input types and pricing models. You can even develop plugins which can run code when these services are requested. The goal being that Servicebot manages the lifecycle of any type of service a business can offer.

[![Try in PWD](https://cdn.rawgit.com/play-with-docker/stacks/cff22438/assets/images/button.png)](http://play-with-docker.com?stack=/servicebot/latest)

## Features
- **Automate Billing:** Create and sell anything as a service in minutes.
    - **Service designer:** Design service offerings that link directly to Stripe.
    - **Subscription management:** Supports automatic recurring charges.
    - **Quote system:** You can allow your customers to request quotes for your services before charging them.
    - **Free trials:** Give out free trials of your subscription offerings to your customers.
    - **Add-ons and Upsell:** Add custom fields to your service request form which influence the final price.
    - **Adding charges:** Add one-time charges to a running service for custom work your clients want.
    - **Refunds:** You can issue partial or full refunds on your customer invoices.

- **Manage Customers:**.
    - **Store-front:** Let your customers order from your catalog without needing another website.
    - **Automatic invoicing:** Invoices are generated and sent to customers automatically.
    - **Service cancellations:** Customers can request cancellations.
    - **RBAC:** Customize roles for staff
    - **Communication:** Customers can send your business messages when they have questions

- **Extensibility:**
    - **Full REST API:** Integrate Servicebot with your existing website or application
    - **Plugin framework:** Develop plugins to extend the functionality of servicebot (documentation coming soon)


## Installation

**Self Hosting Solution** &mdash; Manual installation guide could be found here: [Installation Guide](https://hackernoon.com/install-and-configure-an-open-source-crm-for-your-xaas-business-f976451221f0)

## API

**API reference** &mdash; <https://api-docs.servicebot.io/>


## Built With
- [NodeJS](https://github.com/nodejs/node) &mdash; Our back end API is a Node express app. It responds to requests RESTfully in JSON.
- [React](https://github.com/facebook/react) &mdash; Our front end is a React app that communicates with the Node Express api server.
- [PostgreSQL](http://www.postgresql.org/) &mdash; Our database is Postgres.
- [Stripe](https://stripe.com/) &mdash; Our platform integrates with Stripe to handle billing

## Contributing

ServiceBot is **open source** and accepts contributions from the public

We look forward to working with you!

## Get the Latest News

- **Twitter** - Follow [Servicebot](https://twitter.com/servicebot_io)
- **Blog** - Get the latest updates from the [Servicebot Blog](https://blog.servicebot.io/)

## Credit
- Built by [Servicebot Team](https://www.servicebot.io/)
- Supported by [BrowserStack](https://www.browserstack.com/)

## License
Copyright (C) 2018 ServiceBot

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.


You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.