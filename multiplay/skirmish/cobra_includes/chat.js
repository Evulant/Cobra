
//A way to control chat messages sent to Cobra AI.
function sendChatMessage(msg, receiver)
{
	if (isDefined(msg))
	{
		if (!isDefined(receiver))
		{
			receiver = ALLIES;
		}
		if (lastMsg !== msg)
		{
			lastMsg = msg;
			chat(receiver, msg);
		}
	}
}

function eventChat(from, to, message)
{
	if ((to !== me) || !allianceExistsBetween(from, to))
	{
		return;
	}

	//Here are all chat messages that can be executed by itself.
	if ((message === "AC") || (message === "AR") || (message === "AB") || (message === "AM") || (message === "AL"))
	{
		if (personality !== message)
		{
			choosePersonality(message);
		}
	}
	else if (message === "toggle cyborg")
	{
		turnOffCyborgs = !turnOffCyborgs;
	}
	else if (message === "stats")
	{
		sendChatMessage(MostHarmfulPlayer(), to);
	}
	else if (message === "FFA")
	{
		freeForAll();
	}
	else if (message === "toggle hover")
	{
		forceHover = !forceHover;
	}
	else if (message === "oil level")
	{
		sendChatMessage("Map oil count is: " + mapOilLevel(), ALLIES);
	}
	else if (message === "toggle arti")
	{
		useArti = !useArti;
	}
	else if (message === "toggle vtol")
	{
		useVtol = !useVtol;
	}


	//Do not execute these statements if from is me or enemy.
	if (to === from)
	{
		return;
	}

	if (message === "need truck")
	{
		var droids = enumGroup(constructGroup).filter(function(dr) {
			return (dr.health > 90);
		});
		var cacheDroids = droids.length;
		if (cacheDroids > 2)
		{
			donateObject(droids[random(cacheDroids)], from);
		}
	}
	else if (message === "need power")
	{
		if (playerPower(me) > 50)
		{
			donatePower(playerPower(me) / 2, from);
		}
	}
	else if (message === "need tank")
	{
		donateFromGroup(from, "ATTACK");
	}
	else if (message === "need cyborg")
	{
		donateFromGroup(from, "CYBORG");
	}
	else if (message === "need vtol")
	{
		donateFromGroup(from, "VTOL");
	}

	//Here be commands that do something to a specific enemy.
	const REAL_MSG = message.slice(0, -1);
	if (REAL_MSG === "target")
	{
		var num = message.slice(-1);
		if (!allianceExistsBetween(num, me) && (num !== me))
		{
			targetPlayer(num);
		}
	}
}

//If played on the team that won, then break alliance with everybody and try to conquer them.
//Completely pointless feature, but makes everything a bit more fun.
//chat: 'FFA'.
function freeForAll()
{
	var won = true;
	for (var p = 0; p < maxPlayers; ++p)
	{
		if (p !== me && !allianceExistsBetween(p, me))
		{
			var factories = countStruct("A0LightFactory", p) + countStruct("A0CyborgFactory", p);
			var droids = countDroid(DROID_ANY, p);
			if (droids + factories)
			{
				won = false;
				break;
			}
		}
	}

	if (won === true)
	{
		const FRIENDS = playerAlliance(true);
		const CACHE_FRIENDS = FRIENDS.length;

		if (CACHE_FRIENDS)
		{
			if (isDefined(getScavengerNumber()) && allianceExistsBetween(getScavengerNumber(), me))
			{
				setAlliance(getScavengerNumber(), me, false);
			}

			for (var i = 0; i < CACHE_FRIENDS; ++i)
			{
				var idx = FRIENDS[i];
				chat(idx, "FREE FOR ALL!");
				setAlliance(idx, me, false);
			}
		}
	}
}
