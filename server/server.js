import express from "express";
import path from 'path';
import {createRequire} from 'module';
import {sendToMongo} from "./serverMongo.js"
import timestamp from "time-stamp";

const require = createRequire(import.meta.url);
const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'Ads'
const __dirname = path.join("" + path.resolve(), '../');
//const __dirname = path.join("" + path.resolve());//+'/ex1-final';
console.log("dirname: " + __dirname);
var server = express();
var http = require('http').Server(server);
var io = require('socket.io')(http);
var adminUsername = "aaa";
var adminPassword = "123";
sendToMongo();

server.get('/:file.js', function (req, res) {
    const fileName = req.params.file;
    res.sendFile(path.join(__dirname, `client/${fileName}.js`));
});

server.get('/templates/:templateName.html', function (req, res) {
    const templateName = req.params.templateName;
    res.sendFile(path.join(__dirname, `client/templates/${templateName}.html`));
});

async function addConnectionToScreen(screenNumber, isUserAdded) {
    const ts = timestamp('DD/MM/YYYY-HH:mm:ss');
    MongoClient.connect(connectionURL, { useNewUrlParser: true },
        async (error, client) => {
            const db = client.db(databaseName);
            const screenCollection = db.collection('screens');
            const clientCollection = db.collection('clients');
            await screenCollection.updateOne(
                isUserAdded ?   // if need to add connection to screen then update screen with id == screenNumber
                    { id: String(screenNumber) } : // if need to remove connection from screen then update screen with id == screenNumber && numberOfConnection > 0
                    { id: String(screenNumber), numberOfConnection: { $gt: 0 } },
                [
                    {
                        $set: {
                            numberOfConnection: { $add: ['$numberOfConnection', isUserAdded ? 1 : -1] }
                        },
                    },
                    {
                        $set: {
                            status: {
                                $cond: {
                                    if: { $gt: ["$numberOfConnection", 0] },
                                    then: 'connected',
                                    else: "notConnected"
                                }
                            },
                            lastConnection: ts
                        }
                    }
                ]);
        });
}

async function addConnectionToClient(socketId, clientId, isUserAdded) {
    const ts = timestamp('DD/MM/YYYY-HH:mm:ss');
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            const db = client.db(databaseName);
            const clientCollection = db.collection('clients');
            var screenNumber = clientId % 3;
            if (screenNumber == 0)
                screenNumber = 3;

            await clientCollection.findOne({socketId: socketId}, async function (err, doc) {
                if (doc == null || err) {
                    await clientCollection.insertOne({
                        socketId: socketId,
                        clientId: clientId,
                        connected: isUserAdded,
                        screenNumber: screenNumber
                    })
                } else {
                    await clientCollection.updateOne({socketId: socketId},
                        {
                            $set:
                                {
                                    socketId: socketId,
                                    clientId: clientId,
                                    connected: isUserAdded,
                                    screenNumber: screenNumber
                                }
                        });
                }
            });
        });
}

function connectToSocket() {
    console.log("enter connectToSocket");
    io.on('connection', function (socket) {
        console.log("Connection Added");
        const socketId = socket.id;
        socket.on('user_display_screen', async function (clientId) {
            console.log("User Connected");
            var screenNumber = clientId % 3;
            if (screenNumber == 0)
                screenNumber = 3;
            await addConnectionToScreen(screenNumber, true);
            await addConnectionToClient(socketId, clientId, true);

            socket.on('disconnect', async function () {
                console.log("User Disconnected");
                await addConnectionToScreen(screenNumber, false);
                await addConnectionToClient(socketId, clientId, false);
            });
        });
    });
}

connectToSocket();

server.get('/screen/:id', async function (req, res) {
    let id = req.params.id;
    if (!isNaN(id)) {
        res.sendFile(path.join(__dirname, 'client/index.html'));
    } else if (id == 'admin') {
        res.sendFile(path.join(__dirname, 'client/Login.html'));
    } else res.sendFile(path.join(__dirname, 'client/ErrorPage.html'));
});

server.get('/ads/:id', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            const db = client.db(databaseName);
            var selectedScreen = request.params.id % 3;
            if (selectedScreen == 0)
                selectedScreen = 3;

            const findResult = await db.collection('screens').findOne({ id: "" + selectedScreen }, {
                projection: { _id: 0, adsShow: 1 }
            });

            let adsArray = [];
            if (findResult.hasOwnProperty("adsShow")) {
                console.log("selectedAds: " + findResult.adsShow);
                for (const id of findResult.adsShow.values()) {
                    const result = await db.collection('advertisements').findOne({ id: "" + id }, {
                        projection: { _id: 0, id: 0 }
                    });
                    // console.log(JSON.stringify(result));
                    adsArray.push(JSON.stringify(result)); //array of ads json
                }
            }
            response.send(JSON.parse(JSON.stringify(adsArray)));
        });
});

server.get('/getAdmin', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            const db = client.db(databaseName);
            let adminResult = await db.collection('admin').findOne({username: adminUsername});
            // console.log(JSON.stringify(adminResult));
            response.send(adminResult);
        });
});

server.get('/getAds', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            const db = client.db(databaseName);
            await db.collection('advertisements').find()
                .toArray(function (error, result) {
                    response.send(result);
                });
        });
});

server.get('/getScreens', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            const db = client.db(databaseName);
            await db.collection('screens').find()
                .toArray(function (error, result) {
                    response.send(result);
                });
        });
});

server.get('/setAdmin/username=:usr/password=:pwd', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            let new_username = request.params.usr;
            let new_password = request.params.pwd;

            const db = client.db(databaseName);
            let adminResult = await db.collection('admin').findOne({username: adminUsername});
            db.collection('admin').updateOne({_id: adminResult._id},
                {
                    $set: {
                        "username": new_username,
                        "password": new_password
                    }
                }
            );
            adminUsername = new_username;
            adminPassword = new_password;
            console.log("Admin details updated!");

            response.send(); //ack
        });
});

server.get('/setAds/index=:adIndex/name=:adName/display=:adDisplay', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            let index = request.params.adIndex;
            let new_name = request.params.adName;
            let new_display = request.params.adDisplay;

            const db = client.db(databaseName);
            let adResult = await db.collection('advertisements').findOne({id: index});

            db.collection('advertisements').updateOne({_id: adResult._id},
                {
                    $set: {
                        templateParams: {"name": new_name, "image": adResult.templateParams.image},
                        "displayMs": new_display
                    }
                }
            );
            console.log("Ad details updated!");
            response.send(); //ack
        });
});

server.get('/deleteAd/index=:adIndex', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            let index = request.params.adIndex;
            const db = client.db(databaseName);
            let adResult = await db.collection('advertisements').findOne({id: index});

            db.collection('advertisements').deleteOne({_id: adResult._id});
            db.collection('screens').updateMany({}, {$pull: {adsShow: {$in: [index]}}});
            console.log("Ad removed!");

            response.send(); //ack
        });
});

server.get('/setScreens/index=:screenIndex/arr=:imgArray', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            let index = request.params.screenIndex;
            let new_array = request.params.imgArray.split(",");

            const db = client.db(databaseName);

            //check if all ad nums exist in mongo
            let adsExistFlag = true;
            let adsArrMongo = await db.collection('advertisements').distinct('id', {}, {});
            for (var i = 0; i < new_array.length; i++) {
                if (!adsArrMongo.includes(new_array[i])) {
                    console.log("Can't update to Mongo! one of the ads doesnt exist");
                    adsExistFlag = false;
                }
            }

            if (adsExistFlag) {
                let adResult = await db.collection('screens').findOne({id: index});
                db.collection('screens').updateOne({_id: adResult._id},
                    {
                        $set: {
                            adsShow: new_array
                        }
                    }
                );
                console.log("Screen details updated!");
            }
            response.send(); //ack
        });
});

server.get('/deleteScreen/index=:screenIndex', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            let index = request.params.screenIndex;
            const db = client.db(databaseName);
            let adResult = await db.collection('screens').findOne({id: index});

            db.collection('screens').deleteOne({_id: adResult._id});
            console.log("Screen removed!");

            response.send(); //ack
        });
});

server.get('/addNewAd/id=:adId/name=:adName/imgDisplay=:adDisplay', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            let adId = request.params.adId;
            let adName = request.params.adName;
            let adImgSrc = "https://imgcy.trivago.com/c_limit,d_dummy.jpeg,f_auto,h_1300,q_auto,w_2000/itemimages/86/71/867186_v2.jpeg"; //default img added
            let adDisplayMs = request.params.adDisplay;

            const db = client.db(databaseName);
            db.collection('advertisements').insertMany([
                    {
                        "id": adId,
                        "title": "ad no." + adId,
                        "templateRef": "hotels",
                        "templateParams": {
                            "name": adName,
                            "image": adImgSrc
                        },
                        "displayMs": adDisplayMs
                    }],
                (error, result) => {
                    if (error) {
                        return console.log('Could not insert')
                    }
                });
            response.send(); //ack for adding succeeded
        });
});

server.get('/getClients', function (request, response) {
    MongoClient.connect(connectionURL, {useNewUrlParser: true},
        async (error, client) => {
            if (error) {
                return console.log("Can't connect to db")
            }
            const db = client.db(databaseName);
            await db.collection('clients').find()
                .toArray(function (error, result) {
                    response.send(result);
                });
        });
});


http.listen(8080, () => {
    console.log("listening to port 8080");
});