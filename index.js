const express = require('express');
const paypal = require('paypal-rest-sdk');
const mongoose = require('mongoose');
const dotenv = require('dotenv').config();
const User = require('./models/model');



 port = process.env.PORT || 3000;


paypal.configure({
    'mode':'sandbox',
    'client_id':'AT48fzUnLrRZaDzI4m0E_I8U1-w388M0j2LF9-wUMYd7Ir3NHMEpt_acPM-R5XQPvDaTDvH-LmEvnUDf',
    'client_secret' :'ELjA61jNmwPfG_G4QiGnEU-Gy7jHRaKIeLn-8KodqWl3S-1kt3uTsL9bjdLIWPFyItDbptz9zqF9k2eO'


})


const app = express();
app.use(express.json());
app.use(express.urlencoded());

mongoose.connect(process.env.DB_LINK,{useUnifiedTopology:true});
const db = mongoose.connection;
db.on('error',error=>console.log("Error"));
db.once('open',()=>console.log("Connected Successfully!!!!!"));





app.get('/',function(req,res){
    res.sendFile(__dirname +"/index.html");
})


app.post('/pay', (req, res) => {
    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"

      },
      "redirect_urls": {
          "return_url": "http://localhost:3000/success",
          "cancel_url": "http://localhost:3000/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Redhock Bar Soap",
                  "sku": "001",
                  "price": "25.00",
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": "25.00"
          },
          "description": "Washing Bar soap"
      }],
      

  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });


  app.get('/success', (req, res) => {

    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const token = req.query.token;
  
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": "25.00"
          }
      }]
    };
  
 
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        
      if (error) {
          console.log(error.response);
          throw error;
      } else {
          console.log(JSON.stringify(payment));
          res.send('Success');




      }
  });
  });

app.get('/cancel', (req, res) => res.send('Cancelled'));


app.listen(port,()=>{
    console.log(`App is listening on the port ${port}`);
})
