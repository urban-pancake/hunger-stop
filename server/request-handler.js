'use strict'
// TODO NEED TO SCRAPE PARTICIPATING TRUCKS FROM FOODEVENT TWITTER FEEDS
// LOCATIONS ARE NOTED TRUCKSCHEDULES.JS

const db = require('../db/config');
const mongoose = require('mongoose');
const https = require('https')
const Truck = require('../db/truckSchema');
const { getLocation } = require('./getLocationFromTweets');
const { createTruckWithGeoInfo } = require('./updateTruckInfo');
const { getTruckTwitterInfo } = require('./updateTruckInfo');
const { createOrUpdateDB } = require('./updateTruckInfo');
const { geoCoder } = require('../utils/utils');
const { getYelpInfo } = require('./updateTruckInfo');

// make sure to add the exact Twitter handle minus the @
const foodTrucks = ['JapaCurry', 'CurryUpNow', 'chairmantruck', 'slidershacksf', 'KokioRepublic', 'finsonthehoof', 'chowdermobile'];
const foodEvents = ['gloungesf', 'otgsf', 'SPARKsocialSF', 'mvblfeast', 'somastreatfoodpark', 'truckstopSF'];
// Don't try to get Twitter info from these trucks - you will FAIL
// badFoodTrucks equalz ['senorsisig'];

const foodTrucksObj = {
  JapaCurry: { twitterHandle: 'JapaCurry', yelpBizID: 'japacurry-truck-san-francisco'},
  CurryUpNow: { twitterHandle: 'CurryUpNow', yelpBizID: 'curry-up-now-san-francisco'},
  chairmantruck: { twitterHandle: 'chairmantruck', yelpBizID: 'the-chairman-truck-san-francisco'},
  slidershacksf: { twitterHandle: 'slidershacksf', yelpBizID: 'slider-shack-san-francisco'},
  KokioRepublic: { twitterHandle: 'KokioRepublic', yelpBizID: 'kokio-republic-san-francisco'},
};

foodTrucks.forEach(foodTruck => {
  return getTruckTwitterInfo(foodTruck)
  .then(newTruckObj => getLocation(newTruckObj))
  .then(newTruckObj => geoCoder(newTruckObj))
  .then(newTruckObj => createTruckWithGeoInfo(newTruckObj))
  .then(newTruckObj => createOrUpdateDB(newTruckObj))
  .catch(e => {
    console.log('Truck ', e.name, ' could not be located, so new info for this truck was not stored in the database');
  });
});

module.exports = (app) => {
  app.get('/API/fetchAll', (req, res) => {
    Truck.find((err, trucks) => res.status(200).send(trucks));
  });
  app.get('/API/fetch', (req, res) => {
    // handle must be different for test and client
    const handle = req.body.params ? req.body.params.handle : req.query.handle;
    Truck.findOne({ handle }, (err, truck) => res.status(200).send(truck));
  });
  app.get('/API/yelp', (req, res) => {
    const truckName = req.query.truckName;
    getYelpInfo(foodTrucksObj.truckName.yelpBizID)
    .then(truckInfo => {
      console.log("request-handler API/yelp truckInfo", truckInfo);
      res.status(200).send(truckInfo);
    })

    .catch((err) =>{
      res.status(400).send(err)
    });
  });
};
