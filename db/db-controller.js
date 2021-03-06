var Promise = require('bluebird');
var mysql = require('mysql');
// var redis = require('redis');
// Promise.promisifyAll(redis.RedisClient.prototype);
// Promise.promisifyAll(redis.Multi.prototype);
// var redisClient = redis.createClient();

var connection = mysql.createConnection({
  host: process.env.db || "localhost",
  database: process.env.database || "Orc",
  user: process.env.dbUser || "root",
  password: process.env.dbPassword ? "orcs" : ""
});

connection = Promise.promisifyAll(connection);

connection.connect();

// add quest router.
var addQuest = function(quest) {
	var that = this;
	return new Promise((resolve, reject) => {
		return that[quest.questType](quest).then(resolve);
	});
}

// adds a fetch quest to the db
var addFetchQuest = function(quest) {
	return new Promise(function(resolve, reject) {
		var bufferQuest = { name: quest.name, creator_id: quest.creator_id, lat: quest.lat, lng: quest.lng, questType: quest.questType, timestamp: quest.timestamp}
		return connection.queryAsync('INSERT INTO Quests SET ?', bufferQuest).then(resolve);
	});
}

// adds a crypto quest to the db
var addCryptoQuest = function(quest) {
	return new Promise(function(resolve, reject) {
		var bufferQuest = { name: quest.name, creator_id: quest.creator_id, lat: quest.lat, created_lat: quest.created_lat, lng: quest.lng, created_lng: quest.created_lng, questType: quest.questType, crypto: quest.crypto, timestamp: quest.timestamp}
		return connection.queryAsync('INSERT INTO Quests SET ?', bufferQuest).then(resolve);
	});
}

// adds a sundial quest to the db
var addSunDialQuest = function(quest) {
	return new Promise(function(resolve, reject) {
		var bufferQuest = { name: quest.name, creator_id: quest.creator_id, lat: quest.lat, lng: quest.lng, questType: quest.questType, timestamp: quest.timestamp, timestart: quest.timestart, timestop: quest.timestop}
		return connection.queryAsync('INSERT INTO Quests SET ?', bufferQuest).then(resolve);
	});
}

// adds a character the db
var createCharacter = function(character) {
	character.level = 1;
	character.experience = 0;
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('INSERT INTO Characters SET ?', character).then(resolve).catch(reject);
	});
}

// gets a quest
var getQuest = function(questId) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('SELECT * FROM Quests WHERE id = ' + questId).then(function(quest) { 
			return resolve(quest);
		}).catch(reject);
	});
}

// gets all quests
var getAllQuests = function(characterId) {
  return new Promise(function(resolve, reject) {
    return connection.queryAsync('SELECT q.id, q.name, q.creator_id, q.lat, q.lng, q.questType, q.complete, q.created_lat, q.created_lng, q.timestamp, q.timestart, q.timestop, c.active FROM Quests q LEFT OUTER JOIN CharacterQuests c ON (q.id = c.quest_id AND c.character_id = ' + characterId +')').then(function(result) {
      return resolve(result);
    }).catch(reject);
  });
}

// gets a character by id
var getCharacter = function(id) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('SELECT * FROM Characters WHERE user_id = \"' + id + '\"').then(function(result) {
			return resolve(result);
		}).catch(reject); 
	});
}

// gets a character by id
var getCharacterById = function(characterId) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('SELECT * FROM Characters WHERE id = ' + characterId).then(function(result) {
			return resolve(result);
		}).catch(reject); 
	});
}

// gets a character by name
var getCharacterByName = function(name) {
	return new Promise(function(resolve, reject) { 
		return connection.queryAsync('SELECT * FROM Characters WHERE name = \"' + name + '\"').then(function(result) {
			return resolve(result);
		}).catch(reject); 
	});
}

// updates a character
var updateCharacter = function(character) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('UPDATE Characters SET experience = ' + character.experience + ', level = ' + character.level + 'WHERE id = ' + character.id).then(resolve).catch(reject);
	});
}

// completes a quest
var completeQuest = function(characterId, questId) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('UPDATE Quests SET complete = ' + characterId + ' WHERE id = ' + questId).then(function() {
			connection.queryAsync('DELETE FROM CharacterQuests WHERE quest_id = ' + questId).then(resolve);
		}).catch(reject);
	});
}

// activates a quest in the CharacterQuests table
var activateQuest = function(characterId, questId) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('INSERT INTO CharacterQuests SET ?', {character_id: characterId, quest_id: questId}).then(resolve).catch(reject);
	});
}

// deactivates a quest in the CharacterQuests table
var deactivateQuest = function(characterId, questId) {
	return new Promise(function(resolve, reject) {
		return connection.queryAsync('DELETE FROM CharacterQuests WHERE character_id = ' + characterId + ' AND quest_id = ' + questId).then(resolve).catch(reject);
	});
}

exports.connection = connection;

exports.addQuest = addQuest;
exports.addFetchQuest = addFetchQuest;
exports.addCryptoQuest = addCryptoQuest;
exports.addSunDialQuest = addSunDialQuest;
exports.createCharacter = createCharacter;
exports.getQuest = getQuest;
exports.getAllQuests = getAllQuests;
exports.getCharacter = getCharacter;
exports.getCharacterById = getCharacterById;
exports.getCharacterByName = getCharacterByName;
exports.updateCharacter = updateCharacter;
exports.completeQuest = completeQuest;
exports.activateQuest = activateQuest;
exports.deactivateQuest = deactivateQuest;