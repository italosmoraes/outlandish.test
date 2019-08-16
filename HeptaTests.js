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

const testCase = () => {
    console.log('bungle === Bungle', 'bungle' === 'Bungle');
    console.log('Bungle === Bungle', 'Bungle' === 'Bungle');
    console.log('2^2', Math.pow(2, 2) === 4);
    console.log('3^3', Math.pow(3, 3) === 27);
    console.log('9.23076 x (26.7-16.2)^1.835 === 690.4302695',
        Math.round(9.23076 * Math.pow((26.7-16.2), 1.835)),
        Math.round(9.23076 * Math.pow((26.7-16.2), 1.835) === 690.4302695));

    const event = '200m'
    const result = (weightTable[event].A) *
        (Math.pow((weightTable[event].B - 10.88),
         weightTable[event].C))
    console.log('result 200m', result);
}

testCase();
