var db = require('./db/db-controller');

var socketHandler = function(socket, io) {

  socket.on('super', function(data) {
		io.emit('super', { message: 'Got it' })
	});

	socket.on('create quest', function(quest) {
		db.addQuest(quest).then(function(allQuests) { 
			io.emit('update quests', allQuests);
		})
	});

	socket.on('create character', function(character) {
		db.createCharacter(character).then(function() {
			db.getCharacter(character.userId).then(function(newCharacter) {
				socket.emit('update character', newCharacter);
			});
		});
	});

	socket.on('get quests', function(userId) {
		db.getAllQuests(userId).then(function(allQuests) {
			socket.emit('update quests', allQuests);
		});
	});

	socket.on('get character', function(id) {
		db.getCharacter(id).then(function(character) {
			socket.emit('update character', character);
		});
	});

	socket.on('complete quest', function(userId, questId) {
		db.completeQuest(userId, questId).then(function() {
			db.getAllQuests().then(function(allQuests) {
				io.emit('update quests', allQuests);
			});
		});
	});

	socket.on('activate quest', function(userId, questId) {
		db.activateQuest(userId, questId).then(function() {
			db.getAllQuests(userId).then(function(allQuests) {
				socket.emit('update quests', allQuests);
			});
		});
	});

	socket.on('deactivate quest', function() {
		db.deactivateQuest(userId, questId).then(function() {
			db.getAllQuests(userId).then(function(allQuests) {
				socket.emit('update quests', allQuests);
			});
		});
	});
}

module.exports = socketHandler