
function eventResearched(research, structure, player)
{
	if (LOG_RESEARCH_PATH && allianceExistsBetween(me, player))
	{
		dump(research.name);
	}
}

//updates a research list with whatever is passed to it.
function updateResearchList(stat, len)
{
	if (!isDefined(len))
	{
		len = 0;
	}

	var list = [];
	for (let x = 0, d = stat.length - len; x < d; ++x)
	{
		var st = stat[x];
		if (isDefined(st.res))
		{
			list.push(st.res);
		}
		else
		{
			list.push(st);
		}
	}

	return list;
}

//Initialization of research lists when eventStartLevel is triggered.
//Call this again when manually changing a personality.
function initializeResearchLists()
{
	techlist = subPersonalities[personality].res;
	antiAirTech = updateResearchList(subPersonalities[personality].antiAir.defenses);
	antiAirExtras = updateResearchList(subPersonalities[personality].antiAir.extras);
	extremeLaserTech = updateResearchList(weaponStats.AS.weapons);
	extremeLaserExtra = updateResearchList(weaponStats.AS.extras);
	laserTech = updateResearchList(weaponStats.lasers.weapons);
	laserExtra = updateResearchList(weaponStats.lasers.extras);
	weaponTech = updateResearchList(subPersonalities[personality].primaryWeapon.weapons);
	artilleryTech = updateResearchList(subPersonalities[personality].artillery.weapons);
	artillExtra = updateResearchList(subPersonalities[personality].artillery.extras);
	extraTech = updateResearchList(subPersonalities[personality].primaryWeapon.extras);
	secondaryWeaponTech = updateResearchList(subPersonalities[personality].secondaryWeapon.weapons);
	secondaryWeaponExtra = updateResearchList(subPersonalities[personality].secondaryWeapon.extras);
	defenseTech = updateResearchList(subPersonalities[personality].artillery.defenses);
	standardDefenseTech = updateResearchList(subPersonalities[personality].primaryWeapon.defenses);
	cyborgWeaps = updateResearchList(subPersonalities[personality].primaryWeapon.templates);
	machinegunWeaponTech = updateResearchList(weaponStats.machineguns.weapons);
	machinegunWeaponExtra = updateResearchList(weaponStats.machineguns.extras);
	empWeapons = updateResearchList(weaponStats.nexusTech.weapons);
}

function isPowerResearch(research)
{
	const POWERS = [
		"R-Struc-Power-Upgrade01",
		"R-Struc-Power-Upgrade01b",
		"R-Struc-Power-Upgrade01c",
		"R-Struc-Power-Upgrade02",
		"R-Struc-Power-Upgrade03",
		"R-Struc-Power-Upgrade03a",
	];

	for (let i = 0, len = POWERS.length; i < len; ++i)
	{
		if (research === POWERS[i])
		{
			return true;
		}
	}

	return false;
}

//This function aims to more cleanly discover available research topics
//with the given list provided. pursueResearch falls short in that it fails to
//acknowledge the availability of an item further into the list if a previous
//one is not completed... so lets help it a bit.
function evalResearch(lab, list)
{
	var sufficientPower = getRealPower() > 2500;

	for (let i = 0, a = list.length; i < a; ++i)
	{
		if (sufficientPower && isPowerResearch(list[i]))
		{
			//Don't research power upgrades if we have an absurd amount of power.
			continue;
		}

		if (pursueResearch(lab, list[i]))
		{
			return true;
		}
	}

	return false;
}

// Funky time magic that seems to yield good times to allow research of non-grey bodies.
function timeToResearchAdvancedBody()
{
	var time = 0;

	switch (getMultiTechLevel())
	{
		case 1:
			time = 600000;
			if (baseType === CAMP_BASE)
			{
				time = 420000;
			}
			else if (baseType === CAMP_WALLS)
			{
				time = 280000;
			}
			break;
		case 2:
			time = 180000;
			break;
		case 3:
			time = 120000;
			break;
		default:
			time = 900000;
	}

	if (playerAlliance(true).length > 0)
	{
		time = Math.floor(time / 2);
	}

	return time;
}

// Checks to make sure Cobra isn't going crazy with too many alloys, engine, body, material upgrades.
// Limits that to two labs at any one given time (except for the initial basic alloys and bodies in the beginning).
function atGenericDefensiveResearchLimit()
{
	if (playerAlliance(true).length > 0)
	{
		return false;
	}

	const LIMIT = 2;
	const LIMIT_TESTS = [
		"R-Vehicle-Metals01", "R-Vehicle-Metals02", "R-Vehicle-Metals03",
		"R-Vehicle-Metals04", "R-Vehicle-Metals05", "R-Vehicle-Metals06",
		"R-Vehicle-Metals07", "R-Vehicle-Metals08", "R-Vehicle-Metals09",
		"R-Cyborg-Metals01", "R-Cyborg-Metals02", "R-Cyborg-Metals03",
		"R-Cyborg-Metals04", "R-Cyborg-Metals05", "R-Cyborg-Metals06",
		"R-Cyborg-Metals07", "R-Cyborg-Metals08", "R-Cyborg-Metals09",
		"R-Vehicle-Armor-Heat01", "R-Vehicle-Armor-Heat02", "R-Vehicle-Armor-Heat03",
		"R-Vehicle-Armor-Heat04", "R-Vehicle-Armor-Heat05", "R-Vehicle-Armor-Heat06",
		"R-Vehicle-Armor-Heat07", "R-Vehicle-Armor-Heat08", "R-Vehicle-Armor-Heat09",
		"R-Cyborg-Armor-Heat01", "R-Cyborg-Armor-Heat02", "R-Cyborg-Armor-Heat03",
		"R-Cyborg-Armor-Heat04", "R-Cyborg-Armor-Heat05", "R-Cyborg-Armor-Heat06",
		"R-Cyborg-Armor-Heat07", "R-Cyborg-Armor-Heat08", "R-Cyborg-Armor-Heat09",
		"R-Vehicle-Engine01", "R-Vehicle-Engine02", "R-Vehicle-Engine03",
		"R-Vehicle-Engine04", "R-Vehicle-Engine05", "R-Vehicle-Engine06",
		"R-Vehicle-Engine07", "R-Vehicle-Engine08", "R-Vehicle-Engine09",
		"R-Vehicle-Body01", "R-Vehicle-Body02", "R-Vehicle-Body03",
		"R-Vehicle-Body04", "R-Vehicle-Body05", "R-Vehicle-Body06",
		"R-Vehicle-Body07", "R-Vehicle-Body08", "R-Vehicle-Body09",
		"R-Vehicle-Body10", "R-Vehicle-Body11", "R-Vehicle-Body12",
		"R-Vehicle-Body13", "R-Vehicle-Body14",
		"R-Struc-Materials01", "R-Struc-Materials02", "R-Struc-Materials03",
		"R-Struc-Materials04", "R-Struc-Materials05", "R-Struc-Materials06",
		"R-Struc-Materials07", "R-Struc-Materials08", "R-Struc-Materials09",
		"R-Defense-WallUpgrade01", "R-Defense-WallUpgrade02", "R-Defense-WallUpgrade03",
		"R-Defense-WallUpgrade04", "R-Defense-WallUpgrade05", "R-Defense-WallUpgrade06",
		"R-Defense-WallUpgrade07", "R-Defense-WallUpgrade08", "R-Defense-WallUpgrade09",
		"R-Defense-WallUpgrade10", "R-Defense-WallUpgrade11", "R-Defense-WallUpgrade12",
		"R-Sys-Engineering01", "R-Sys-Engineering02", "R-Sys-Engineering03"
	];
	let count = 0;

	for (let i = 0, len = LIMIT_TESTS.length; i < len; ++i)
	{
		let test = LIMIT_TESTS[i];
		if (getResearch(test, me).started)
		{
			++count;
			if (count == LIMIT)
			{
				break;
			}
		}
	}

	return count >= LIMIT;
}

function research()
{
	if (currently_dead || !countDroid(DROID_CONSTRUCT, me) || !(isDefined(techlist) && isDefined(turnOffCyborgs)))
	{
		return;
	}

	var labList = enumStruct(me, structures.lab).filter((lb) => (
		lb.status === BUILT && structureIdle(lb)
	));

	var enemyPlayer = getMostHarmfulPlayer();
	var antiCyborgChance = Math.floor(playerCyborgRatio(enemyPlayer) * 100);
	var highOil = highOilMap();
	var haveAllies = playerAlliance(true).length > 0;
	const HIGH_OIL_RES_PRICE = -200;

	if (!startAttacking || (isDefined(scavengerPlayer) && (enemyPlayer === scavengerPlayer)))
	{
		antiCyborgChance = 35;
	}
	if (antiCyborgChance > 0 && antiCyborgChance < 10)
	{
		antiCyborgChance = 10; //just in case...
	}

	for (let i = 0, a = labList.length; i < a; ++i)
	{
		var atGenericDefenseLimit = atGenericDefensiveResearchLimit();
		var lab = labList[i];
		var forceLaser = false;
		var found = false;

		if (forceHover)
			found = pursueResearch(lab, "R-Vehicle-Prop-Hover");
		if (enemyUsedElectronicWarfare)
			found = pursueResearch(lab, "R-Sys-Resistance-Circuits");

		if (!found && highOil)
			found = evalResearch(lab, MODULE_RESEARCH);
		if (!found)
			found = evalResearch(lab, MOST_ESSENTIAL);

		if (!found)
			found = evalResearch(lab, ESSENTIALS);
		if (!found)
			found = evalResearch(lab, techlist);
		//Careful not to focus too much on these research topics since offensive capability can be harmed
		if ((random(100) < ((haveAllies || highOil || (gameTime > 2400000)) ? 60 : 20)))
		{
			if (!found && getResearch("R-Struc-Research-Upgrade02").done)
				found = pursueResearch(lab, "R-Vehicle-Body11");
			if (!found && random(100) < ((highOil || haveAllies) ? 75 : 33))
				found = evalResearch(lab, ESSENTIALS_2);
			if (!found && random(100) < (getResearch("R-Struc-Research-Upgrade04").done ? 40 : 15))
				found = evalResearch(lab, ESSENTIALS_3);
		}

		if (!found && (getRealPower() > (highOil ? HIGH_OIL_RES_PRICE : -SUPER_LOW_POWER)) && (countEnemyVTOL() || componentAvailable("V-Tol")))
		{
			// Prepare the most basic AA defense.
			if (antiAirTech.length > 0)
			{
				found = pursueResearch(lab, antiAirTech[0]);
			}

			if ((random(100) < 30) && countEnemyVTOL())
			{
				if (!found)
					found = evalResearch(lab, antiAirTech);
				if (!found)
					found = evalResearch(lab, antiAirExtras);
			}
		}

		if (!found && getRealPower() > ((gameTime < 180000) ? MIN_POWER : (highOil ? HIGH_OIL_RES_PRICE : SUPER_LOW_POWER)))
		{
			if ((haveAllies && highOil) || (random(100) < ((highOil) ? 45 : 20)))
			{
				found = (!cyborgOnlyGame && pursueResearch(lab, "R-Vehicle-Metals03"));

				if (!found && !turnOffCyborgs && (countStruct(structures.cyborgFactory, me) || cyborgOnlyGame))
					found = pursueResearch(lab, "R-Cyborg-Metals03");

				if (!atGenericDefenseLimit && ((gameTime > timeToResearchAdvancedBody()) || cyborgOnlyGame || highOil))
				{
					if (random(100) < (subPersonalities[personality].alloyPriority + (highOil ? 20 : 0) + ((haveAllies && highOil) ? 30 : 0)))
					{
						if (!found && !cyborgOnlyGame && getResearch("R-Struc-Research-Upgrade03").done && random(100) < 40)
							found = pursueResearch(lab, "R-Vehicle-Metals05");
						if (!found && !turnOffCyborgs && countStruct(structures.cyborgFactory, me) && random(100) < (cyborgOnlyGame ? 75 : 50))
						{
							found = evalResearch(lab, CYBORG_ARMOR);
							if (!found && random(100) < 15 && getResearch("R-Cyborg-Metals04").done)
								found = evalResearch(lab, CYBORG_ARMOR_THERMAL);
						}
						if (!found && (!cyborgOnlyGame || (cyborgOnlyGame && random(100) < 20)))
						{
							found = evalResearch(lab, TANK_ARMOR);
							if (!found && random(100) < 15 && getResearch("R-Vehicle-Metals04").done)
								found = evalResearch(lab, TANK_ARMOR_THERMAL);
						}
					}

					if (!found && getResearch("R-Struc-Research-Upgrade03").done && (random(100) < (componentAvailable("Body8MBT") ? 45 : 30)))
						found = evalResearch(lab, BODY_RESEARCH);
				}
			}

			if (!found && !cyborgOnlyGame && getResearch("R-Struc-Research-Upgrade05").done && random(100) < 15)
			{
				found = pursueResearch(lab, extremeLaserTech);

				if (!found && componentAvailable("PlasmaHeavy") && random(100) < 70)
					found = evalResearch(lab, FLAMER);

				if (componentAvailable("Laser4-PlasmaCannon"))
				{
					if (!found)
						found = evalResearch(lab, empWeapons);
					if (!found && random(100) < 80)
						found = evalResearch(lab, extremeLaserExtra);
				}
			}

			if (!found &&
				((subPersonalities[personality].resPath === "defensive") ||
				(!atGenericDefenseLimit && random(100) < subPersonalities[personality].defensePriority)))
			{
				if (!highOil || haveAllies)
				{
					found = evalResearch(lab, standardDefenseTech);
					if (!found && useArti)
						found = evalResearch(lab, defenseTech);
					if (!found)
						found = evalResearch(lab, DEFENSE_UPGRADES);
				}
			}

			if (subPersonalities[personality].resPath === "generic")
			{
				if ((!turnOffMG || cyborgOnlyGame) && random(100) < antiCyborgChance)
				{
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponTech);
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponExtra);
					if (!found && useLasersForCyborgControl())
					{
						found = true;
						forceLaser = true;
					}
				}

				if (!found && random(100) < 50)
					found = evalResearch(lab, weaponTech);
				if (!found && random(100) < 20 && personalityIsRocketMain())
					found = pursueResearch(lab, "R-Wpn-Rocket03-HvAT");
				if (!found && !turnOffCyborgs && random(100) < (cyborgOnlyGame ? 75 : 50))
					found = evalResearch(lab, cyborgWeaps);

				if (!found && useVtol && random(100) < 70)
				{
					// Basic VTOL pads tried after Python.
					if (componentAvailable("Body11ABT") && random(100) < 70)
						found = pursueResearch(lab, "R-Struc-VTOLPad-Upgrade01");
					if (!found && componentAvailable("V-Tol") && random(100) < subPersonalities[personality].vtolPriority)
						found = evalResearch(lab, VTOL_RES);
				}

				if (!found && random(100) < 33)
					found = evalResearch(lab, extraTech);
				if (!found && useArti && random(100) < 40)
					found = evalResearch(lab, artillExtra);
				if (!found && useArti && random(100) < (personalityIsRocketMain() ? (componentAvailable("Missile-A-T") ? 50 : 20) : 30))
					found = evalResearch(lab, artilleryTech);

				if (!found)
					found = evalResearch(lab, SYSTEM_UPGRADES);

				if (!found)
					found = evalResearch(lab, SENSOR_TECH);

				var cyborgSecondary = updateResearchList(subPersonalities[personality].secondaryWeapon.templates);
				var len = subPersonalities[personality].primaryWeapon.weapons.length - 1;
				if (componentAvailable(subPersonalities[personality].primaryWeapon.weapons[len].stat))
				{
					if (!found && !turnOffCyborgs && cyborgSecondary.length > 0)
						found = pursueResearch(lab, cyborgSecondary);
					if (!found)
						found = evalResearch(lab, secondaryWeaponExtra);
					if (!found)
						found = evalResearch(lab, secondaryWeaponTech);
				}
			}
			else if (subPersonalities[personality].resPath === "defensive")
			{
				if (!found && random(100) < (personalityIsRocketMain() ? 20 : 50) && useArti)
					found = evalResearch(lab, artillExtra);
				if (!found && random(100) < (personalityIsRocketMain() ? (componentAvailable("Missile-A-T") ? 60 : 20) : 50) && useArti)
					found = evalResearch(lab, artilleryTech);

				if (!found)
					found = evalResearch(lab, SYSTEM_UPGRADES);
				if (!found)
					found = evalResearch(lab, SENSOR_TECH);

				if ((!turnOffMG || cyborgOnlyGame) && random(100) < antiCyborgChance)
				{
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponTech);
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponExtra);
					if (!found && useLasersForCyborgControl())
					{
						found = true;
						forceLaser = true;
					}
				}

				if (!found && useVtol && random(100) < 60)
				{
					// Basic VTOL pads tried after Python.
					if (componentAvailable("Body11ABT"))
						found = pursueResearch(lab, "R-Struc-VTOLPad-Upgrade01");
					if (!found && componentAvailable("V-Tol") && random(100) < subPersonalities[personality].vtolPriority)
						found = evalResearch(lab, VTOL_RES);
				}

				if (!found)
					found = evalResearch(lab, weaponTech);
				if (!found && personalityIsRocketMain())
					found = pursueResearch(lab, "R-Wpn-Rocket03-HvAT");
				if (!found && !turnOffCyborgs)
					found = evalResearch(lab, cyborgWeaps);
				if (!found)
					found = evalResearch(lab, extraTech);

				var cyborgSecondary = updateResearchList(subPersonalities[personality].secondaryWeapon.templates);
				var len = subPersonalities[personality].primaryWeapon.weapons.length - 1;
				if (componentAvailable(subPersonalities[personality].primaryWeapon.weapons[len].stat))
				{
					if (!found && !turnOffCyborgs && cyborgSecondary.length > 0)
						found = pursueResearch(lab, cyborgSecondary);
					if (!found)
						found = evalResearch(lab, secondaryWeaponExtra);
					if (!found)
						found = evalResearch(lab, secondaryWeaponTech);
				}
			}
			else if (subPersonalities[personality].resPath === "offensive")
			{
				if ((!turnOffMG || cyborgOnlyGame) && random(100) < antiCyborgChance)
				{
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponTech);
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponExtra);
					if (!found && useLasersForCyborgControl())
					{
						found = true;
						forceLaser = true;
					}
				}

				if (!found && random(100) < 40)
					found = evalResearch(lab, weaponTech);
				if (!found && !turnOffCyborgs && getResearch("R-Struc-Research-Upgrade04").done && random(100) < (cyborgOnlyGame ? 75 : 30))
					found = evalResearch(lab, cyborgWeaps);
				if (!found && random(100) < 60)
					found = evalResearch(lab, extraTech);

				if (!found && random(100) < 10 && personalityIsRocketMain())
					found = pursueResearch(lab, "R-Wpn-Rocket03-HvAT");
				if (!found && useArti && random(100) < (personalityIsRocketMain() ? (componentAvailable("Missile-A-T") ? 33 : 15) : 10))
					found = evalResearch(lab, artilleryTech);

				if (!found && useVtol && random(100) < 80)
				{
					// Basic VTOL pads tried after Python.
					if (componentAvailable("Body11ABT") && random(100) < 80)
						found = pursueResearch(lab, "R-Struc-VTOLPad-Upgrade01");
					if (!found && componentAvailable("V-Tol") && (random(100) < subPersonalities[personality].vtolPriority + 10))
						found = evalResearch(lab, VTOL_RES);
				}

				if (!found)
					found = evalResearch(lab, SYSTEM_UPGRADES);

				if (!found && useArti && random(100) < 66)
					found = evalResearch(lab, artillExtra);
				if (!found && useArti && random(100) < 50)
					found = evalResearch(lab, artilleryTech);

				var cyborgSecondary = updateResearchList(subPersonalities[personality].secondaryWeapon.templates);
				var len = subPersonalities[personality].primaryWeapon.weapons.length - 1;
				if (componentAvailable(subPersonalities[personality].primaryWeapon.weapons[len].stat))
				{
					if (!found && !turnOffCyborgs && cyborgSecondary.length > 0)
						found = pursueResearch(lab, cyborgSecondary);
					if (!found)
						found = evalResearch(lab, secondaryWeaponExtra);
					if (!found)
						found = evalResearch(lab, secondaryWeaponTech);
				}

				if (!found)
					found = evalResearch(lab, SENSOR_TECH);
			}
			else if (subPersonalities[personality].resPath === "air")
			{
				if (!useVtol)
					useVtol = true;

				if (!found)
					found = evalResearch(lab, SYSTEM_UPGRADES);

				if (!found)
					found = evalResearch(lab, VTOL_RES);

				if ((!turnOffMG || cyborgOnlyGame) && random(100) < antiCyborgChance)
				{
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponTech);
					if ((!turnOffMG || cyborgOnlyGame) && !found)
						found = evalResearch(lab, machinegunWeaponExtra);
					if (!found && useLasersForCyborgControl())
					{
						found = true;
						forceLaser = true;
					}
				}

				if (!found)
					found = evalResearch(lab, weaponTech);
				if (!found && personalityIsRocketMain())
					found = pursueResearch(lab, "R-Wpn-Rocket03-HvAT");
				if (!found && !turnOffCyborgs && random(100) < (cyborgOnlyGame ? 75 : 50))
					found = evalResearch(lab, cyborgWeaps);

				if (!found && random(100) < 50)
					found = evalResearch(lab, extraTech);

				if (!found)
					found = evalResearch(lab, SENSOR_TECH);

				if (!found && useArti && random(100) < 66)
					found = evalResearch(lab, artillExtra);
				if (!found && useArti && random(100) < (personalityIsRocketMain() ? (componentAvailable("Missile-A-T") ? 50 : 20) : 50))
					found = evalResearch(lab, artilleryTech);

				var cyborgSecondary = updateResearchList(subPersonalities[personality].secondaryWeapon.templates);
				var len = subPersonalities[personality].primaryWeapon.weapons.length - 1;
				if (componentAvailable(subPersonalities[personality].primaryWeapon.weapons[len].stat))
				{
					if (!found && !turnOffCyborgs && cyborgSecondary.length > 0)
						found = pursueResearch(lab, cyborgSecondary);
					if (!found)
						found = evalResearch(lab, secondaryWeaponExtra);
					if (!found)
						found = evalResearch(lab, secondaryWeaponTech);
				}
			}

			if (!found)
				found = evalResearch(lab, empWeapons);

			if (!found)
				found = pursueResearch(lab, extremeLaserTech);
			if (componentAvailable("Laser4-PlasmaCannon"))
			{
				if (!found)
					found = evalResearch(lab, extremeLaserExtra);
				if (!found && componentAvailable("PlasmaHeavy"))
					found = evalResearch(lab, FLAMER);
			}

			// Lasers
			if (forceLaser || (!found && subPersonalities[personality].useLasers))
			{
				var foundLaser = false;

				if (!turnOffCyborgs)
					foundLaser = pursueResearch(lab, "R-Cyborg-Hvywpn-PulseLsr");
				if (!foundLaser)
					foundLaser = evalResearch(lab, laserTech);
				if (!foundLaser)
					foundLaser = evalResearch(lab, laserExtra);
				//Rocket/missile AA does not need this. Still uses it if researched.
				if (!foundLaser && (returnAntiAirAlias() !== "rktaa"))
					pursueResearch(lab, "R-Defense-AA-Laser");
			}

			//Very likely going to be done with research by now.
			if ((getMultiTechLevel() === 4) || (!found && componentAvailable("Body14SUP") && componentAvailable("EMP-Cannon") && isStructureAvailable(structures.lassat)))
			{
				researchComplete = true;
			}
		}
	}
}
