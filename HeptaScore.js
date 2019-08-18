const fs = require('fs');

/**
 * Scope
 * 
 * 
// validate and format data for processing

// save data

// calculate scores - using formulas, weights, rules

// save calculated scores

// format return

// return scores
 * 
 */

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
 * Transforms the CSV into an array of processable objects for score calculation
 * 
 * @param string
 * @returns {Array[Object]}
 */
const normaliseScoresData = (csvList) => {
    console.log(csvList);
    
    // since we know the order of the table
    // we just assume: name | event | score | date
    const normalised = csvList.map(row => {
        console.log('row: ', row.length);
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

    const normalisedNoEmpty = normalised.filter(row => row !== undefined);

    console.log('normalised', normalised);
    console.log('normalised No Empty', normalisedNoEmpty);
    return normalisedNoEmpty;
}

/**
 * 
 * @param {*} arg
 * @returns {Array[string]}
 */
const getCsvFromInputFile = (fileName) => { 
    // no need to handle asynchonicity here
    const content = fs.readFileSync(fileName, 'utf-8', (error, data) => {
        if (error) {
            console.log('Error processing file:', error);
        }
        return data;
    })

    return content.split('\n');
}

/**
| Event              | Abbreviation | A        | B     | C     |
|:------------------:|:------------:|:--------:|:-----:|:-----:|
| 200 metres         | 200m         | 4.99087  | 42.5  | 1.81  |
| 800 metres         | 800m         | 0.11193  | 254   | 1.88  |
| 100 metres hurdles | 100m         | 9.23076  | 26.7  | 1.835 |
| High jump          | High         | 1.84523  | 75.0  | 1.348 |
| Long jump          | Long         | 0.188807 | 210   | 1.41  |
| Shot put           | Shot         | 56.0211  | 1.50  | 1.05  |
| Javelin throw      | Javelin      | 15.9803  | 3.80  | 1.04  |
 * @param {*} event 
 * @param {*} score 
 */
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
        C: 1.141
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



const convertToCentimeters = meters => meters * 100;

/**
 * - For throwing events: P = A(D-B)^C
 * - **Throwing** events are measured in **metres** (the distance the piece of equipment is thrown)
 * @param {*} event 
 * @param {*} score - in meters
 */
const getThrowingFinalScore = (event, score) => {
    console.log('throwing...', event, score);
    return (weightTable[event].A) *
             (Math.pow(score - (weightTable[event].B),
              weightTable[event].C));
}

/**
 * - For jumping events: P = A(M-B)^C
 * M = score in meters
 * 
 * - **Jumping** events are measured in **metres** (the height or distance jumped/vaulted).
 * Convert the input score from meters to centimeters
 * ... they are taken in meters, but formula expects them in centimeters
 * 
 * @param {*} event 
 * @param {*} score 
 */
const getJumpingFinalScore = (event, score) => {
    const scoreInCentimeters = convertToCentimeters(score);

    return (weightTable[event].A) *
             (Math.pow((scoreInCentimeters - weightTable[event].B),
              weightTable[event].C));
}

// Where:
// - **P** is the number of points scored for the event in question by an athlete.
// - **M** is the measurement (in **centimetres**) for jumps.
// - **D** is the distance (in **metres**) achieved in a throwing event.
// - **T** is the time (in **seconds**) for running events.
// - **A**, **B** and **C** are weightings taken from the table below.

/**
 * - For running events: P = A(B-T)^C
 * in seconds
 * 
 * assumes T is the score in seconds
 */
const getRunningFinalScore = (event, score) => {
    return (weightTable[event].A) *
             (Math.pow((weightTable[event].B - score),
              weightTable[event].C));
}

/**
 * @param {*} event 
 * @param {*} score 
 */
const getScoreForEvent = (event, score) => {
    if (event.includes('200') || event.includes('800') || event.includes('100')) {
        console.log('getScoreForEvent running', getRunningFinalScore(event, score));
        return getRunningFinalScore(event, score);
    }
    else if (event === 'long' || event === 'high') {
        console.log('getScoreForEvent jumping', getJumpingFinalScore(event, score));
        return getJumpingFinalScore(event, score);
    }
    else if (event === 'shot' || event === 'javelin') {
        console.log('getScoreForEvent throwing', getThrowingFinalScore(event, score));
        return getThrowingFinalScore(event, score);
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
 * @param {Array[Object]}
 * @returns {Array[Object]}
 */
const calculateScoresPerDay = (scoresTable) => {
    const scoresTableWithPoints = [];

    const dailyScoresPerAthlete = scoresTable.map(scoreRow => {
        let score = 0;
        if (scoreRow) {
            score = Math.round(getScoreForEvent(scoreRow.event, scoreRow.score));
        }
        // mount score per name object
        scoresTableWithPoints.push({
            ...scoreRow,
            totalScore: score,
        });
        // add the score to the object to return
        // preciso ter a data como parte do obj
    });

    console.log('total daily score table: ');
    console.log(scoresTableWithPoints);
    return scoresTableWithPoints;
}

/**
 * Gets date: '2016-07-02 10:34:00' and returns '2016-07-02'
 * @param {*} text 
 */
const getDateFromString = text => {
    const date = new Date(text.split(' ')[0]);
    console.log('date', date);
    return date;
}

const getDateLabel = text => text.split(' ')[0];

/**
 * Gets the total score per athlete name (since they will be the unique property)
 * Calculates the daily scores
 * Returns daily cumulative table per name and date
 * (since we care about these two for final output)
 * { [name]: cumulativeScore, [date]: Date }
 * 
 * { [date]: { [name]: score, [name_2]: score } }
 * 
 * This way I am also storing the cumulative instead of calculating everytime I need it
 * 
 * organizar por data/nome/score pq o objetivo eh retornar os resultados filtrados por dia
 * 
 * 
 * @param Array[Object]
 * @returns Array[Object]
 */
const getDailyCumulativeScores = calculatedScoresTable => {
    const scorePerNamePerDate = calculatedScoresTable.map(scoreRow => {
        date = getDateFromString(scoreRow.date);

        return { name: scoreRow.name, score: scoreRow.totalScore, date: date };
    })

    console.log('scorePerNamePerDate', scorePerNamePerDate);

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
                    console.log('tempTotalScore', tempTotalScore)
                    console.log('calculatedScoresTable[x].totalScore', calculatedScoresTable[x].totalScore)

                    tempTotalScore += calculatedScoresTable[x].totalScore;

                    temp = {
                        ...temp,
                        score: tempTotalScore,
                        date: new Date(calculatedScoresTable[x].date.split(' ')[0]),
                    }
                    cumulativeScoresPerDatePerName.push(temp);
                }
            }
            console.log('cumulativeScoresPerDatePerName', cumulativeScoresPerDatePerName);
            cumulativeScoresPerDatePerName.forEach(item => {
                cumulativeScoresPerDay.push(item);
            });

            alreadyCalculated.push(scoreRow.name);
        }
    })
    console.log('cumulativeScoresPerDay', cumulativeScoresPerDay);
    return cumulativeScoresPerDay;
}

/**
 * 
 * @param Date date 
 * @param Array[Object] table 
 */
const showFormattedTable = (date, table, index) => {
    const dottedLine = '--------------------';

    const dateString = date.toDateString().split(' ');
    const newDateString = `${dateString[1]} ${dateString[2]} ${dateString[3]}`;
    const dayLabel = `Day ${index}: `;

    const noBlanks = 20 - (newDateString.length + dayLabel.length);
    let blanks = '';
    for (let x=0; x<noBlanks; x++) {
        blanks += ' ';
    }

    const header = `${dayLabel}${blanks}${newDateString}`

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
 * 
 * @param totalScoresPerDate 
 */
const showDailyScores = (totalScoresPerDate) => {
    let scoresToDate = [];
    let dateProcessedHelper = [];

    // order the scores per date
    const scoresPerDateOrdered =
        totalScoresPerDate.sort((a, b) => a.date.getTime() - b.date.getTime());

    let noOfDays = 0;
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
                
                if (scoresPerDateOrdered[y].date.getTime() === currentDate) {
                    // find athletes today
                    // replace existing each day, which maintains the non scoring in the list
                    // no need to show if score is zero
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
                            }
                            scoresToDate.splice(idx, 1, updated)
                            
                    } else {
                        
                        scoresToDate.push({
                            name,
                            score: scoresPerDateOrdered[y].score
                        })
                        
                    }
                }

            }

            // console.log('--------------------');
            // console.log(totalScoresPerDate[x].date);
            // console.log(scoresToDate);

            dateProcessedHelper.push(currentDate);

            // order scores
            const orderedScoresTable = scoresToDate.sort((a, b) => b.score - a.score);

            // format final
            showFormattedTable(totalScoresPerDate[x].date, scoresToDate, noOfDays);
        }
        
        
    }




    // console.log('inside totalScoresPerDate', totalScoresPerDate);
    // listOfAlreadySearched = [];
    // let xDayList = [];
    // for (let x=0; x < totalScoresPerDate.length; x++) {
    //     const date = new Date(totalScoresPerDate[x].date).getTime();

        

    //     if (date !== listOfAlreadySearched.find(el => el === date)) {
    //     console.log('-----------------')
    //     console.log('date', totalScoresPerDate[x].date);

    //         for (let y = 0; y < totalScoresPerDate.length; y++) {
    //             const dateT = new Date(totalScoresPerDate[y].date).getTime();
    //             if (date === dateT) {
    //                 xDayList.push({
    //                     name: totalScoresPerDate[y].name,
    //                     score: totalScoresPerDate[y].score
    //                 })
    //                 // console.log(totalScoresPerDate[y].name, totalScoresPerDate[y].score);
    //             }

    //         }
    //     }

    //     // push Date to listOfAlreadySearched
    //     listOfAlreadySearched.push(date);

    //     xDayList.forEach(item => {
    //         console.log(item);
    //     })
    //     xDayList = [];
    // }




    // order all dates
    // go through the list and get the smallest

    // go through list showing all scores per name per date
    // with formatted output

    // dateShownListHelper = [];
    // for (let x=0; x < totalScoresPerDate.length; x++) {

    //     // formatDailyScoreHeader(x, totalScoresPerDate[x].date)
    //     const date = new Date(totalScoresPerDate[x].date).getTime();

    //     console.log('totalScoresPerDate[x].date.getTime()', date)
    //     // vai pela lista e pela todos os items dessa data
    //     if (!dateShownListHelper.find(el => el === date)) {
    //         totalScoresPerDate.forEach(row => {
    //             if (date === new Date(row.date).getTime()) {

    //                 console.log(row.name, row.score);
    //             }
    //         })
    //     }

    //     dateShownListHelper.push(date);
    // }



}

const calculateScores = () => {
    // no need to validate the data file name exists for this exercise
    // nor validate more than one argument
    // so I either take the file name or user the file path arg
    const scoresCsvList = getCsvFromInputFile(process.argv[2]);

    // create an object to represent the data extracted
    // ler o csv
    const scoresTableRepresentation = normaliseScoresData(scoresCsvList);

    // then process the scores for each pair
    const calculatedScoresTable = calculateScoresPerDay(scoresTableRepresentation);

    // @ go through the calcualted scores per day 
    // show the cumulative
    const dailyCumulativeScoresTable = getDailyCumulativeScores(calculatedScoresTable);

    // order the date list - separate function
    // format output
    showDailyScores(dailyCumulativeScoresTable);
}

calculateScores();
