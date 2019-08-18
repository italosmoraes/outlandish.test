# outlandish.test

Instructions
------------

This test is about demonstrating your programming skills primarily in terms of accuracy and clarity.

Your code should:
 - show that you have correctly interpreted all of the instructions
 - produce the correct output
 - be easy for other developers to understand
 - use appropriate approaches and tools
 - handle errors gracefully

We do not expect you to demonstrate every programming concept you've ever learnt, handle data at a massive scale
or speed, build the basis for a future app that can score any sport, etc.

The challenge is well-defined and limited in scope, but we recommend reading the instructions below at least
twice, so that you thoroughly understand them (paying close attention to inputs, outputs, units and formulae),
and we would expect you to take no longer than 4 hours to complete them.

Good luck!


Overview
--------

The Heptathlon is a sporting competition comprising seven events run over the course of several days.

The events are of three types:
- Running: 200m, 100m hurdles and 800m.
- Throwing: Javelin and shot put.
- Jumping: Long jump and high jump.

When calculating the scores for athletes:
- **Running** events are measured in **seconds** (the time taken to run from start to finish).
- **Throwing** events are measured in **metres** (the distance the piece of equipment is thrown).
- **Jumping** events are measured in **metres** (the height or distance jumped/vaulted).

The points formulae are as follows, and are taken from the scoring template of the International Association of
Athletics Federations (IAAF).

<pre>
- For running events: P = A(B-T)^C
- For throwing events: P = A(D-B)^C
- For jumping events: P = A(M-B)^C
</pre>

Where:
- **P** is the number of points scored for the event in question by an athlete.
- **M** is the measurement (in **centimetres**) for jumps.
- **D** is the distance (in **metres**) achieved in a throwing event.
- **T** is the time (in **seconds**) for running events.
- **A**, **B** and **C** are weightings taken from the table below.

| Event              | Abbreviation | A        | B     | C     |
|:------------------:|:------------:|:--------:|:-----:|:-----:|
| 200 metres         | 200m         | 4.99087  | 42.5  | 1.81  |
| 800 metres         | 800m         | 0.11193  | 254   | 1.88  |
| 100 metres hurdles | 100m         | 9.23076  | 26.7  | 1.835 |
| High jump          | High         | 1.84523  | 75.0  | 1.348 |
| Long jump          | Long         | 0.188807 | 210   | 1.41  |
| Shot put           | Shot         | 56.0211  | 1.50  | 1.05  |
| Javelin throw      | Javelin      | 15.9803  | 3.80  | 1.04  |

() In all cases P should be rounded down if it is not already an integer. So for instance 49.99 would round down to 49.

For example, a 100m time of 16.2 seconds would be calculated as 9.23076 x (26.7-16.2)^1.835, which works out to

690.4302695, which in turn rounds down to 690 points.



Input data
----------

You will be presented with lines of data for the results in each event, where each line represents a single score for
an athlete's event, and consists of comma-separated values for:

- The athlete's name, which will be a sequence of letters and may be hyphenated.
- The abbreviation for the event (as per the events table).
- The time or distance achieved by the athlete in the event.
- The date and time that the score was achieved.

(/) -You should expect the input data to be a little messy, so there may (or may not) be leading or -trailing whitespace for
each value, 
(/) -and some lines may be blank.
(/) -Names and event abbreviations must be treated as case-insensitive. 
(/) -Scores do
not necessarily include the unit suffix ('s' for seconds, 'm' for metres),
!this means I can simpy assume the number format when calculating the final score
() - but will always be of the form 1.23 (for
seconds or metres) or 1:23.45 (for minutes and seconds).

(?)
(just ignore these, as they should be assumptions?)
(OR check for these and return errors?)
You may assume that there will be no more than one entry in each data set for a given event for a given athlete,
and that there will not be more than one athlete with the same name.
Non-blank lines will always contain the four
relevant values in the correct order.

(?) should I do something about the name size?
None of the athletes' names is longer than 15 characters

(?) should I check for ranges? or is this then something that is not part of a 
requirement to for e.g. 'verify acceptable human ranges'?
- and that their scores will be within the normal scoring ranges
for professional heptathletes.



Output data
-----------

(/) Your program must calculate the daily cumulative scores for each athlete across all their events for each day of the
competition,
() and output a daily league table showing their names and scores, in descending order of score. 
(/) Each daily
summary should show the total cumulative score-to-date for each athlete
(/) (you may omit athletes whose cumulative score
is zero).
(/) You may assume that there will not be any athlete with the same cumulative score. (?) why does this matter?

(/) Names must start in the
first column of the output and be capitalised,
(/) and scores must be separated from names by the appropriate number of
space characters to enable them to be right-justified with the rightmost digit of the score in the 20th column
(see Sample input, below).

(/) Daily tables must have a header containing the date,
(/) and each day must be separated from the previous day with a blank
line.
(/ There should be no blank line at the end.
(/) For valid input data, there should be no other output.



Restrictions
------------

The code can be written in any web language (ideally javascript or php), but must live in a single file, and be 
appropriately commented. There must be no external libraries/frameworks except those that are built into the language. 
The input data will be named 'heptathlon.csv', but the program can take the filename as an argument if desired. Output 
should be to the console.

**The program must be executable from a shell and take the CSV file as input. For example:**

```sh
node heptathlon_score_calculator.js data.csv
```


Sample input
------------

Below is a sample of the sort of input to expect.

Note that your code will be tested with a somewhat larger data set that may suffer 
from the inconsistencies described in the "Input Data" section above (e.g. blank lines).

```
George, 100m,    10.64s,  2016-07-02 10:34:00
Bungle, 100m,    10.20s,  2016-07-02 10:34:00
zippy,  100m ,   10.30s,  2016-07-02 10:34:00
zippy,  Javelin, 60.4m,   2016-07-03 11:00:00
bungle, javelin, 64.3,    2016-07-03 11:49:00
George, long,    6.90m,   2016-07-04 10:02:00
george, 800m,    2:20.13, 2016-07-04 10:02:00
```


Sample output
-------------

```
--------------------
 Day 1: 02 Jul 2016
--------------------
BUNGLE          1582
ZIPPY           1564
GEORGE          1505

--------------------
 Day 2: 03 Jul 2016
--------------------
BUNGLE          2721
ZIPPY           2626
GEORGE          1505

--------------------
 Day 3: 04 Jul 2016
--------------------
GEORGE          3466
BUNGLE          2721
ZIPPY           2626
```
