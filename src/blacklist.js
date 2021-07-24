const mongo = require("../db/connect");
const collection = 'Offers';

var insertDocument = function(db, callback) {
  db.collection('families').insertOne( {
          "id": "AndersenFamily",
          "lastName": "Andersen",
          "parents": [
              { "firstName": "Thomas" },
              { "firstName": "Mary Kay" }
          ],
          "children": [
              { "firstName": "John", "gender": "male", "grade": 7 }
          ],
          "pets": [
              { "givenName": "Fluffy" }
          ],
          "address": { "country": "USA", "state": "WA", "city": "Seattle" }
      }, function(err, result) {
      assert.equal(err, null);
      console.log("Inserted a document into the families collection.");
      callback();
  });
  };

module.exports = {
  list: 0
}