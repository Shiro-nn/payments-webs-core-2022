<img src="https://cdn.scpsl.store/qurre.store/img/payments.png" align="right" />

# Qurre-Pay
## Using
**Create a Qurre-Pay API class**

```js
const QurreAPI = require('qurre-pay');
const Qurre = new QurreAPI(private_key, public_key);
```
**Get information about your store**

```js
const Store = await Qurre.GetShopInfo();
```
**Get information about payment by id**

```js
const Payment = await Qurre.GetPaymentInfo('3gui7GYus798');
```
**Create payment**

```js
const Payment = await Qurre.CreatePayment(100, 'Test payment');
```
**Get the IP-addresses of the service**

```js
const Ips = await Qurre.GetServiceIps();
```
**Cancel payment**

```js
const Payment = await Qurre.CancelPayment('3gui7GYus798');
```
**Payment processing example**

```js
//req - the variable passed by express
const ip = (req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress)?.replace('::ffff:', '');
const Ips = await Qurre.GetServiceIps();
if(!Ips.includes(ip)) return;
const Pay = await Qurre.GetPaymentInfo(req.body.payment);
if(!Pay.paid) return;
// your code
```
