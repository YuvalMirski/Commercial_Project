import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'Ads'

export function sendToMongo() {

    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            const db = client.db(databaseName);

            db.dropCollection("advertisements", function (err) {
                if (err)
                    console.log("collection advertisements doesn't exist");
                else
                    console.log("collection advertisements deleted");
            });

            db.dropCollection("screens", function (err) {
                if (err)
                    console.log("collection screens doesn't exist");
                else
                    console.log("collection screens deleted");
            });

            db.dropCollection("clients", function (err) {
                if (err)
                    console.log("collection clients doesn't exist");
                else
                    console.log("collection clients deleted");
            });

            db.dropCollection("admin", function (err) {
                if (err)
                    console.log("collection admin doesn't exist");
                else
                    console.log("collection admin deleted");
            });


            db.createCollection("advertisements", function (err, res) {
                if (err)
                    console.log("collection advertisments doesn't exist")
                else
                    console.log("advertisments added")
            });

            db.createCollection("screens", function (err, res) {
                if (err)
                    console.log("collection screens doesn't exist")
                else
                    console.log("screens added")
            });

            db.createCollection("admin", function (err, res) {
                if (err)
                    console.log("collection admin doesn't exist")
                else
                    console.log("admin added")
            });

            db.createCollection("clients", function (err, res) {
                if (err)
                    console.log("collection clients doesn't exist")
                else
                    console.log("clients added")
            });

            //add new data to collections
            db.collection('admin').insertMany([
                    {
                        "username": "aaa",
                        "password": "123"
                    }
                ],
                (error, result) => {
                    if (error) {
                        return console.log('Could not insert')
                    }
                });

            db.collection('advertisements').insertMany([
                    {
                        "id": "1",
                        "title": "ad no.1",
                        "templateRef": "hotels",
                        "templateParams": {
                            "name": "Dubai",
                            "image": "https://moderndiplomacy.eu/wp-content/uploads/2020/11/best-dubai-hotels-1280x720.jpg"
                        },
                        "displayMs": "2000"
                    },
                    {
                        "id": "2",
                        "title": "ad no.2",
                        "templateRef": "tvShow",
                        "templateParams": {
                            "name": "Friends",
                            "image": "https://images.indianexpress.com/2021/05/friends-the-reunion-1200-2.jpg"
                        },
                        "displayMs": "2000"
                    },
                    {
                        "id": "3",
                        "title": "ad no.3",
                        "templateRef": "hotels",
                        "templateParams": {
                            "name": "Setai",
                            "image": "https://cdn2.portal.tambourine.com/thesetaihotels/application/files/2215/3833/3534/php-mh-GAL_02-Pool.jpg"
                        },
                        "displayMs": "3000"
                    },
                    {
                        "id": "4",
                        "title": "ad no.4",
                        "templateRef": "tvShow",
                        "templateParams": {
                            "name": "Simpsons",
                            "image": "http://www.yardbarker.com/media/e/d/ed33e854563fa37192686bef3e94e8b553e1e3b5/thumb_16x9/tv-shows-produced-episodes.jpg?v=1"
                        },
                        "displayMs": "3000"
                    },
                    {
                        "id": "5",
                        "title": "ad no.5",
                        "templateRef": "hotels",
                        "templateParams": {
                            "name": "LasVegas",
                            "image": "https://q-xx.bstatic.com/xdata/images/hotel/max500/193378702.jpg?k=8e3e78ab83f7de53eed35dc4f0e7627e991ac060d934cc0c981568fa246885f9&o="
                        },
                        "displayMs": "4000"
                    },
                    {
                        "id": "6",
                        "title": "ad no.6",
                        "templateRef": "tvShow",
                        "templateParams": {
                            "name": "GoodDoctor",
                            "image": "https://torontopubliclibrary.typepad.com/.a/6a00e5509ea6a18834022ad3a8be18200b-pi"
                        },
                        "displayMs": "3000"
                    }
                ],
                (error, result) => {
                    if (error) {
                        return console.log('Could not insert')
                    }
                });

            db.collection('screens').insertMany([
                    {
                        "id": "1",
                        "adsShow": ["1", "2", "3"],
                        "status": "notConnected",
                        "lastConnection": "",
                        "numberOfConnection": 0
                    },
                    {
                        "id": "2",
                        "adsShow": ["4", "5", "6"],
                        "status": "notConnected",
                        "lastConnection": "",
                        "numberOfConnection": 0
                    },
                    {
                        "id": "3",
                        "adsShow": ["1", "3", "5"],
                        "status": "notConnected",
                        "lastConnection": "",
                        "numberOfConnection": 0
                    }
                ],
                (error, result) => {
                    if (error) {
                        return console.log('Could not insert')
                    }
                });

        });
}