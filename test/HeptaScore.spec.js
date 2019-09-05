const { expect } = require('chai');
const heptaScore = require('../HeptaScore');

describe('tests', () => {
    const scoresTableWithPoints = [
        {
            name: 'george',
            event: '100m',
            score: 10.64,
            date: '2016-07-02 10:34:00',
            totalScore: 1505
        },
        { name: 'zippy',
            event: 'javelin',
            score: 60.4,
            date: '2016-07-03 11:00:00',
            totalScore: 1063 },
        { name: 'bungle',
            event: 'javelin',
            score: 64.3,
            date: '2016-07-03 11:49:00',
            totalScore: 1139 },
        { name: 'george',
            event: 'long',
            score: 6.9,
            date: '2016-07-04 10:02:00',
            totalScore: 1139 },
        { name: 'george',
            event: '800m',
            score: 140.13,
            date: '2016-07-04 10:02:00',
            totalScore: 822
        },
        {
            name: 'italo',
            event: '100m',
            score: 8.9,
            date: '2016-07-03 10:02:00',
            totalScore: 1819
        }
    ];
        
    it('calculates running events correctly', () => {
        const result = heptaScore.getScoreForEvent('100m', 16.2);

        expect(result).to.equal(690);
    })

    it('returns correct results for running events', () => {
        const georgeDay1result = heptaScore.getScoreForEvent('100m', 10.64)

        expect(georgeDay1result).to.equal(1505);

        let georgeDay3result = heptaScore.getScoreForEvent('long', 6.90);
        georgeDay3result += heptaScore.getScoreForEvent('800m', 140.13);

        expect(georgeDay3result).to.equal(1961); // day 3 cumulative - day 1
    })

    it('returns correct score for GEORGE day 1,2,3', () => {
        const result = heptaScore.getDailyCumulativeScores(scoresTableWithPoints);

        day1Score = 1505;

        const day1 = new Date('2016-07-02');

        let georgeResult = result.find(r => {
            return r.name === 'george' && r.date.getTime() === day1.getTime();
        })

        // show/verify
        expect(georgeResult.score).to.equal(day1Score);

        // calculate day 2 score
        day2Score = 1505;

        const day2 = new Date('2016-07-03');

        georgeResult = result.find(r => {
            return r.name === 'george' && r.date.getTime() === day2.getTime();
        })

        // show/verify
        expect(georgeResult).to.equal(undefined); // not calculated

        // calculate day 3 score
        day3Score = 3466;

        const day3 = new Date('2016-07-04');

        const georgeResults = result.filter(item => {
            return item.name === 'george' && item.date.getTime() === day3.getTime();
        })

        // show verify
        expect(georgeResults[1].score).to.equal(day3Score);
    });

    xit('does not skip any badly formatted lines', () => {
        // load file

        // blank lines are fine

        // 

    });

})

