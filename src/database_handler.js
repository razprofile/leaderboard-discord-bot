import mongodb from 'mongodb';
const { MongoClient, Collection, Db } = mongodb;
// Database Name
const dbName = 'main';
// Connection URL
const url = `mongodb+srv://main:EkIfMWpQYxoHUaTa@maincluster.vfqdj.mongodb.net/${dbName}?retryWrites=true&w=majority`;

// EkIfMWpQYxoHUaTa

const collectionName = 'users';

/**
 * @type {Db}
 */
let db;
// Use connect method to connect to the server
MongoClient.connect(url, function (err, client) {
  if (err) throw err;
  db = client.db(dbName);
});
export const getDatabse = () => db;

/**
 * @returns {Collection<any>}
 */
export const getUsers = () => db.collection(collectionName);

export const getUser = (id) => getUsers().findOne({ id });

export const getCollection = (id) => {
  console.log(db.runCommand({ listCollections: 1 }));
};
