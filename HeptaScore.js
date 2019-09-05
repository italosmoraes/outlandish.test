const fs = require('fs');

const weightTable = {
    '200m': {
        A: 4.99087,
        B: 42.5,
        C: 1.81
    },
    '800m': {
        A: 0.11193,
        B: 254,
        C: 1.88
    },
    '100m': {
        A: 9.23076,
        B: 26.7,
        C: 1.835
    },
    'high': {
        A: 1.84523,
        B: 75.0,
        C: 1.348
    },
    'long': {
        A: 0.188807,
        B: 210,
        C: 1.41
    },
    'shot': {
        A: 56.0211,
        B: 1.50,
        C: 1.05
    },
    'javelin': {
        A: 15.9803,
        B: 3.80,
        C: 1.04
    }
}

/**
 * Make all names lower case, remove white spaces
 * 
 * This is not treating for any unexpected characters
 * 
 * @param {} name 
 */
const treatInput = (name) => {
    return name.toLowerCase().trim();
}

/**
 * splits when score like: 2:20.13
 * @param {string} score 
 */
const convertFromMinutesToSeconds = (score) => {
    const split = score.split(':');
    const minute = Number.parseFloat(split[0]);
    const seconds = Number.parseFloat(split[1]);

    return minute * 60 + seconds;
}

/**
 * Reads any input (m, s, or hour)
 * and returns the number in seconds
 * 
 * @param {*} name 
 */
const treatRunningScoreInput = (score) => {
    if (score.includes('s') || score.includes('m')) {
        return Number.parseFloat(score.toLowerCase().trim().replace(/[ms]/, ''));
    }
    if (score.includes(':')) {
        return convertFromMinutesToSeconds(score);
    }
    return Number.parseFloat(score);
}


/**
 * Transforms the CSV into an array of processable objects
 * 
 * @param string
 * @returns {Array[Object]}
 */
const normaliseScoresData = (csvList) => {
    // since we know the order of the table
    // we just assume: name | event | score | date
    const normalised = csvList.map(row => {
        if (row.length !== 0) {
            const scoreRow = row.split(',');

            return {
                name: treatInput(scoreRow[0]),
                event: treatInput(scoreRow[1]),
                score: treatRunningScoreInput(scoreRow[2]),
                date: treatInput(scoreRow[3]),
            }
        }
        return;
    })

    const normalisedNoEmptyLines = normalised.filter(row => row !== undefined);

    return normalisedNoEmptyLines;
}

/**
 * @param {String} file
 * @returns {Array[string]}
 */
const getCsvFromInputFile = (file) => { 
    // no need to handle asynchonicity here
    const content = fs.readFileSync(file, 'utf-8', (error, data) => {
        if (error) {
            console.log('Error processing file:', error);
        }
        return data;
    })

    return content.split('\n');
}

const convertToCentimeters = meters => meters * 100;

/**
 * - For throwing events: P = A(D-B)^C
 * - Throwing events are measured in metres (the distance the piece of equipment is thrown)
 * @param {String} event 
 * @param {Number} score - in meters
 */
const getThrowingFinalScore = (event, score) => {
    return (weightTable[event].A) *
             (Math.pow(score - (weightTable[event].B),
              weightTable[event].C));
}

/**
 * - For jumping events: P = A(M-B)^C
 * M = score in meters
 * 
 * - Jumping events are measured in metres (the height or distance jumped/vaulted).
 * Convert the input score from meters to centimeters
 * 
 * @param {String} event 
 * @param {Number} score 
 */
const getJumpingFinalScore = (event, score) => {
    const scoreInCentimeters = convertToCentimeters(score);

    return (weightTable[event].A) *
             (Math.pow((scoreInCentimeters - weightTable[event].B),
              weightTable[event].C));
}

/**
 * - For running events: P = A(B-T)^C
 * 
 * assumes T is the score in seconds
 * @param {String} event 
 * @param {Number} score
 */
const getRunningFinalScore = (event, score) => {
    return (weightTable[event].A) *
             (Math.pow((weightTable[event].B - score),
              weightTable[event].C));
}

/**
 * @param {String} event 
 * @param {Number} score 
 */
const getScoreForEvent = (event, score) => {
    let result = null;
    
    if (event.includes('200') || event.includes('800') || event.includes('100')) {
        return Math.trunc(getRunningFinalScore(event, score));
    }
    else if (event === 'long' || event === 'high') {
        return Math.trunc(getJumpingFinalScore(event, score));
    }
    else if (event === 'shot' || event === 'javelin') {
        return Math.trunc(getThrowingFinalScore(event, score));
    }
    return null;
}


/**
 * Receives a list of daily scores (in seconds) objects and
 * returns a list with the cumulative daily score per athlete
 * Rounded to the default Math.round()
 * 
 * returns
 * [{ ...scoreTable, totalScore: number }]
 * 
 * @param {Array[Object]}
 * @returns {Array[Object]}
 */
const calculateScoresPerDay = (scoresTable) => {
    const scoresTableWithPoints = [];

    scoresTable.map(scoreRow => {
        
        let score = 0;
        if (scoreRow) {
            score = getScoreForEvent(scoreRow.event, scoreRow.score);
        }
        // mount score per name object
        scoresTableWithPoints.push({
            ...scoreRow,
            totalScore: score,
        });
    });

    return scoresTableWithPoints;
}

/**
 * Gets date: '2016-07-02 10:34:00' and returns '2016-07-02'
 * @param {String} text 
 */
const getDateFromString = text => {
    const date = new Date(text.split(' ')[0]);
    return date;
}

/**
 * Gets the total score per athlete name (since they will be the unique property)
 * Calculates the daily scores
 * Returns daily cumulative table per name and date
 * @param {Array[Object]}
 * @returns {Array[Object({ name: string, score: number, date: Date })]}
 */
const getDailyCumulativeScores = calculatedScoresTable => {
    const scorePerNamePerDate = calculatedScoresTable.map(scoreRow => {
        date = getDateFromString(scoreRow.date);

        return { name: scoreRow.name, score: scoreRow.totalScore, date: date };
    })

    // skip already calculated
    const alreadyCalculated = [];

    const cumulativeScoresPerDay = [];

    scorePerNamePerDate.forEach(scoreRow => {
        if (!alreadyCalculated.find(el => el === scoreRow.name)) {
            const name = scoreRow.name;
            
            let tempTotalScore = 0;
            let temp = { name };
            let cumulativeScoresPerDatePerName = [];

            for (let x = 0; x < calculatedScoresTable.length; x++) {
                if (calculatedScoresTable[x].name === name) {
                    tempTotalScore += calculatedScoresTable[x].totalScore;

                    temp = {
                        ...temp,
                        score: tempTotalScore,
                        date: new Date(calculatedScoresTable[x].date.split(' ')[0]),
                    }
                    cumulativeScoresPerDatePerName.push(temp);
                }
            }

            cumulativeScoresPerDatePerName.forEach(item => {
                cumulativeScoresPerDay.push(item);
            });

            alreadyCalculated.push(scoreRow.name);
        }
    })

    return cumulativeScoresPerDay;
}

/**
 * 
 * @param {Date} date 
 * @param {Array[Object]} table 
 * @param {Number} index
 */
const showFormattedTable = (date, table, index) => {
    const dottedLine = '--------------------';

    const dateString = date.toDateString().split(' ');
    const formattedDateString = `${dateString[2]} ${dateString[1]} ${dateString[3]}`;
    const dayLabel = `Day ${index}: `;

    const noBlanks = 20 - (formattedDateString.length + dayLabel.length);
    let blanks = '';
    for (let x=0; x<noBlanks; x++) {
        blanks += ' ';
    }

    const header = `${dayLabel}${blanks}${formattedDateString}`

    console.log(dottedLine);
    console.log(header);
    console.log(dottedLine);

    table.forEach(item => {
        const noBlanks = 20 - (item.name.length + item.score.toString().length);
        const capitalizedScore = item.score.toString().toUpperCase();

        let blanks = '';
        for (let x=0; x<noBlanks; x++) {
            blanks += ' ';
        }

        const scoreLine = `${item.name.toUpperCase()}${blanks}${capitalizedScore}`

        console.log(scoreLine);
    })
}

/**
 * @param {Array[Object({ name: string, score: number, date: Date })]} totalScoresPerDate
 */
const showDailyScores = (totalScoresPerDate) => {
    let scoresToDate = [];

    let dateProcessedHelper = [];

    // order the scores per date
    const scoresPerDateOrdered =
        totalScoresPerDate.sort((a, b) => a.date.getTime() - b.date.getTime());

    let noOfDays = 0;

    // loop per date - assuming the first one is the smallest date value
    for (let x = 0; x < scoresPerDateOrdered.length; x++) {
        const currentDate = scoresPerDateOrdered[x].date.getTime();

        // find each athletes scores, each day
        if (!dateProcessedHelper.includes(currentDate)) {
            if (scoresToDate.length > 0) {
                // blank line
                console.log('');
            }
            noOfDays += 1;

            for (let y=0; y < scoresPerDateOrdered.length; y++) {
                // find athletes today
                // replace existing each day, to maintain the non scoring in the list
                // no need to show if score is zero
                if (scoresPerDateOrdered[y].date.getTime() === currentDate) {
                    const name = scoresPerDateOrdered[y].name;

                    let idx = null;
                    if (scoresToDate.find(
                            (el, index) => {
                                if (el.name === name) {
                                    idx = index;
                                    return true;
                                }
                            })) {
                        
                            const updated = {
                                name,
                                score: scoresPerDateOrdered[y].score
                            };
                            scoresToDate.splice(idx, 1, updated);
                    } else {
                        scoresToDate.push({
                            name,
                            score: scoresPerDateOrdered[y].score
                        });
                    }
                }

            }

            dateProcessedHelper.push(currentDate);

            // order scores
            const orderedScoresTable = scoresToDate.sort((a, b) => b.score - a.score);

            // format final and show per day
            showFormattedTable(totalScoresPerDate[x].date, scoresToDate, noOfDays);
        }
    }
}

const calculateScores = () => {
    // no need to validate the data file name exists for this exercise
    // nor validate more than one argument
    // so I either take the file path arg
    const scoresCsvList = getCsvFromInputFile(process.argv[2]);

    const scoresTableRepresentation = normaliseScoresData(scoresCsvList);

    const calculatedScoresTable = calculateScoresPerDay(scoresTableRepresentation);

    const dailyCumulativeScoresTable = getDailyCumulativeScores(calculatedScoresTable);

    showDailyScores(dailyCumulativeScoresTable);
}

calculateScores();

module.exports = {
    getDailyCumulativeScores,
    getScoreForEvent,
};
