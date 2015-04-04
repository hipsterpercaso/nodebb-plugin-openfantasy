"use strict";

var async = require('async'),
	character = require('../character'),
	battle = require('../battle');


module.exports = function(uid, events, battleData, characterData, monsterData, callback) {
	var dice = Math.floor(Math.random() * 20) + 1,
		monster_dice = Math.floor(Math.random() * 20) + 1;


	// To flee you must roll higher than opponent or roll straight 20. 1 = auto fail
	if((dice > monster_dice && dice !== 1) || (dice === 20)) {
		// todo:
		// Delete stolen items
		// Delete broken items
		events.push({
			message: '[[of:battle_flee, <strong>' + characterData.character_name + '</strong>]]'
		});

		async.parallel([
			function(next) {
				character.incrementCharacterFieldBy(uid, 'character_flees', 1, next);
			},
			function(next) {
				character.deleteObjectField(uid, 'battle_id', next);
			},
			function(next) {
				battle.deleteBattle(battleData.battle_id, next);
			}
		], function(err) {
			if (err) {
				throw new Error('Unable to flee: ' + err);
			}

			callback(err, {events: events, finished: 1});
		});
	} else {
		events.push({
			message: '[[of:battle_flee_fail, <strong>' + characterData.character_name + '</strong>]]'
		});

		battle.incrementTurn(battleData.battle_id, function(err, turn) {
			// if turn % 2 === 0, --> opponentTurn, but only if he didn't move already... hmmm...
			callback(err, {events: events});
		});
	}
};