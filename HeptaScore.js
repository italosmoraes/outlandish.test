const fs = require('fs');

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
 * Reads any input (m, s, or hour)
 * and returns the number in seconds
 * 
 * @param {*} name 
 */
// @todo rescrever convertendo os numeros descentemente
const treatRunningScoreInput = (name) => {
// se m ou s return

// se horas : converter as horas, minutos, segundos e retornar o valor final

    if (name.includes('s')) {
        return name.toLowerCase().trim().replace('s', ''); // @todo user regex
    }
    if (name.includes('m')) {
        return name.toLowerCase().trim().replace('m', ''); // @todo user regex
    }
    if (name.includes(':')) {
        // convert to seconds
        return name.toLowerCase().trim().replace('m', ''); // @todo user regex
    }
    return null;
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
    const normalised = csvList.map(row => {
        if (row !== '') {
            const scoreRow = row.split(',');

            // name | event | score | date
            // @todo treat each score type to a number, otherwise calculation fails
            return {
                name: treatInput(scoreRow[0]),
                event: treatInput(scoreRow[1]),
                score: treatRunningScoreInput(scoreRow[2]),
                date: treatInput(scoreRow[3]),
            }
        }
        return null;
    })

    console.log('normalised', normalised);
    return normalised;
}

// validate and format data for processing

// save data

// calculate scores - using formulas, weights, rules

// save calculated scores

// format return

// return scores

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
    }
}

/**
 * - For throwing events: P = A(D-B)^C
 * in meters
 * @param {*} event 
 * @param {*} score 
 */
const getThrowingFinalScore = (event, score) => {
    console.log(event, score);
}

/**
 * - For jumping events: P = A(M-B)^C
 * in meters
 * 
 * @param {*} event 
 * @param {*} score 
 */
const getJumpingFinalScore = (event, score) => {
    console.log(event, score);
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
        return getJumpingFinalScore(event, score);
    }
    else if (event === 'shot' || event === 'javelin') {
        return getThrowingFinalScore(event, score);
    }
    return null;
}


/**
 * Receives a list of daily scores objects and
 * returns a list with the cumulative daily score per athlete
 * 
 * a list retornada representa:
 * [{ name: cumulativeScore }]
 * @param {Array[Object]}
 * @returns {Array[Object]}
 */
const calculateScoresPerDay = (scoresRow) => {

    const cumulativeListPerName = [];
    const dailyScoresPerAthlete = scoresRow.map(item => {
        if (item) {
            const score = getScoreForEvent(item.event, item.score);
        }

        // mount score per name object

    })

}

const calculateScores = () => {
    // no need to validate the data file name exists for this exercise
    // nor validate more than one argument
    const scoresCsvList = getCsvFromInputFile(process.argv[2]);

    // create an object to represent the data extracted
    // ler o csv
    const scoresTableRepresentation = normaliseScoresData(scoresCsvList);

    // then process the scores for each pair
    const calculatedScoresTable = calculateScoresPerDay(scoresTableRepresentation);

    // sem necessidade de querer ser experto e fazer um codigo unfuckingreadable!
}

calculateScores();
