require('fs')
const GeneticAlgorithmConstructor = require('geneticalgorithm')
const hash = require('object-hash')
const json = require('./data.json')
const populationSize = 50
let courses = json
const Days = 7
const Hours = 13
courses = courses.courses

function howMachHour (json) {
  const flagContent = [0, 0, 0]

  if (json.lecture.length > 0) {
    flagContent[0] += hourToNumber(json.lecture[0].finishHour[0]) - hourToNumber(json.lecture[0].startHour[0])
    if (json.lecture[0].finishHour[1] != null) flagContent[0] += hourToNumber(json.lecture[0].finishHour[1]) - hourToNumber(json.lecture[0].startHour[1])
  }

  if (json.exercise.length > 0) {
    flagContent[1] += hourToNumber(json.exercise[0].finishHour[0]) - hourToNumber(json.exercise[0].startHour[0])
    if (json.exercise[0].finishHour[1] != null) flagContent[1] += hourToNumber(json.exercise[0].finishHour[1]) - hourToNumber(json.exercise[0].startHour[1])
  }

  if (json.lab.length > 0) {
    flagContent[2] += hourToNumber(json.lab[0].finishHour[0]) - hourToNumber(json.lab[0].startHour[0])
    if (json.lab[0].finishHour[1] != null) flagContent[2] += hourToNumber(json.lab[0].finishHour[1]) - hourToNumber(json.lab[0].startHour[1])
  }

  return flagContent[0] + flagContent[1] + flagContent[2]
}

function fillSchedule (data, Schedule) {
  data.day.forEach((value, i) => {
    if (value != null) {
      const startHour = hourToNumber(data.startHour[i])
      const finishHour = hourToNumber(data.finishHour[i])
      let dif = finishHour - startHour

      for (; dif > 0; dif--) {
        if (!isEmpty(dayToNumber(data.day[i]), finishHour - dif, Schedule)) {
          deleteSchedule(dayToNumber(data.day[i]), finishHour - dif, Schedule)
          Schedule.FlagChange++
        }
        Schedule.data[dayToNumber(data.day[i])][finishHour - dif] = data
        Schedule.BusyHours++
      }
    }
  })
}

function hourToNumber (Hour) {
  if (Hour === null) return null
  Hour = Hour.replace(/\s/g, '')
  switch (Hour) {
    case '08:30':
      return 0
    case '09:30':
      return 1
    case '10:30':
      return 2
    case '11:30':
      return 3
    case '12:20':
      return 4
    case '12:50':
      return 4
    case '13:50':
      return 5
    case '14:50':
      return 6
    case '15:50':
      return 7
    case '16:50':
      return 8
    case '17:50':
      return 9
    case '18:50':
      return 10
    case '19:50':
      return 11
    case '20:50':
      return 12
    case '21:50':
      return 13
    default:
      return null
  }
}

function dayToNumber (day) {
  if (day === null) return null
  day = day.replace(/\s/g, '')
  switch (day) {
    case 'א':
      return 0
    case 'ב':
      return 1
    case 'ג':
      return 2
    case 'ד':
      return 3
    case 'ה':
      return 4
    case 'ו':
      return 5
    case 'ז':
      return 6
    default:
      return null
  }
}

function deleteSchedule (day, hour, Schedule) {
  Schedule.data[day][hour] = null

  Schedule.BusyHours--
}

function deleteById (courseId, schedule) {
  schedule.data.forEach((day, i) => {
    day.forEach((hour, j) => {
      if ((hour != null) && hour.courseId === courseId) deleteSchedule(i, j, schedule)
    })
  })
}

function isEmpty (day, hour, schedule) {
  return schedule.data[day][hour] === null
}

function fillListOfCoursesRandomly (courses, schedule) {
  restSchedule(schedule)
  let trys = 200
  do {
    trys--
    restSchedule(schedule)

    courses.forEach((value) => {
      const res = choiceOneEachType(value)
      res.forEach((window) => {
        fillSchedule(window, schedule)
      })
    })
  } while (schedule.FlagChange !== 0 && trys > 0)
}

function restSchedule (schedule) {
  schedule.BusyHours = 0
  schedule.FlagChange = 0
  schedule.data = [[], [], [], [], [], [], [], []]
  schedule.data.forEach(value => {
    for (let i = 0; i <= Hours; i++) value.push(null)
  })
  return 1
}

function initSchedule () {
  const schedule = {
    BusyHours: 0, FlagChange: 0, data: [[], [], [], [], [], [], [], []]
  }
  return schedule
}

function typeOfContent (course) {
  const FlagContent = [0, 0, 0]
  if (course.lecture.length > 0) FlagContent[0] = 1
  if (course.exercise.length > 0) FlagContent[1] = 1
  if (course.lab.length > 0) FlagContent[2] = 1
  return FlagContent
}

function choiceOneEachType (data, flags = typeOfContent(data)) {
  const coursesToFill = []
  if (flags[0] === 1) {
    coursesToFill.push({
      ...data.lecture[Math.floor(Math.random() * data.lecture.length)],
      Type: 'הרצאה',
      courseName: data.courseName,
      courseId: data.courseId
    })
  }
  if (flags[1] === 1) {
    coursesToFill.push({
      ...data.exercise[Math.floor(Math.random() * data.exercise.length)],
      Type: 'תרגול',
      courseName: data.courseName,
      courseId: data.courseId
    })
  }
  if (flags[2] === 1) {
    coursesToFill.push({
      ...data.lab[Math.floor(Math.random() * data.lab.length)],
      Type: 'מעבדה',
      courseName: data.courseName,
      courseId: data.courseId
    })
  }
  return coursesToFill
}

function fitnessFunctionEmptyDays (phenotype) {
  let fitness = 7
  phenotype.data.forEach(day => {
    let flag = 0
    day.forEach(hour => {
      if (hour != null) {
        flag = 1
      }
    })
    if (flag === 1) {
      fitness--
    }
  })
  let total = 0
  courses.forEach(course => {
    total += howMachHour(course)
  })
  if (total !== phenotype.BusyHours) fitness = 0

  return fitness
}

// eslint-disable-next-line no-unused-vars
function fitnessFunctionEmptyHour (phenotype) {
  let fitness = Days * Hours
  phenotype.data.forEach(day => {
    let flagClass = 0
    let count = 0
    day.forEach(hour => {
      if (hour != null) {
        flagClass = 1
        if (count > 0) {
          fitness -= count
          count = 0
        }
      } else {
        if (flagClass === 1) count++
      }
    })
  })
  let total = 0
  courses.forEach(course => {
    total += howMachHour(course)
  })
  if (total !== phenotype.BusyHours) fitness = 0
  return fitness
}

function mutationFunction (oldPhenotype) {
  const vecIndex = []

  oldPhenotype.data.forEach((day, i) => {
    day.forEach((hour, j) => {
      if (hour != null) {
        vecIndex.push({ i, j })
      }
    })
  })

  const whatDelete = vecIndex[Math.floor(Math.random() * vecIndex.length)]
  const courseToRetake = oldPhenotype.data[whatDelete.i][whatDelete.j].courseId
  deleteById(courseToRetake, oldPhenotype)
  courses.forEach(value => {
    let flagIsFill
    const res = choiceOneEachType(value)
    if (value.courseId === courseToRetake) {
      let trys = 0
      do {
        trys++
        flagIsFill = 0
        res.forEach(window => {
          if (!isEmpty(dayToNumber(window.day[0]), hourToNumber(window.startHour[0]), oldPhenotype)) flagIsFill = 1
        })
      } while (flagIsFill && trys < 10)
      if (trys !== 10) {
        res.forEach((window) => {
          fillSchedule(window, oldPhenotype)
        })
      } else fillListOfCoursesRandomly(courses, oldPhenotype)
    }
  })
  return oldPhenotype
}

function createEmptyPhenotype (size) {
  const array = []
  let schedule
  for (; size > 0; size--) {
    schedule = initSchedule()
    fillListOfCoursesRandomly(courses, schedule)
    array.push(schedule)
  }

  return array
}

function getListOfSameScore (arr, phenotype, fitnessFunction) {
  const arrayOfResult = [phenotype]
  arr.forEach((value) => {
    let flag = 1
    arrayOfResult.forEach((arrayOfResultValue) => {
      if (hash.sha1(arrayOfResultValue) === hash.sha1(value.phenotype)) {
        flag = 0
      }
    })
    if (value.score === fitnessFunction(phenotype) && flag === 1) arrayOfResult.push(value.phenotype)
  })

  return arrayOfResult
}

const main = () => {
  courses = json.courses
  const config = {
    mutationFunction, // crossoverFunction: yourCrossoverFunction,
    fitnessFunction: fitnessFunctionEmptyDays, // yourCompetitionFunction, (fitnessFunctionEmptyHour or fitnessFunctionEmptyDays)
    population: createEmptyPhenotype(populationSize),
    populationSize // defaults to 100
  }

  config.fitnessFunction = fitnessFunctionEmptyDays
  const ga = GeneticAlgorithmConstructor(config)
  for (let i = 0; i < 100; i++) {
    ga.evolve()
  }

  let scoreList = ga.scoredPopulation()
  scoreList = getListOfSameScore(scoreList, ga.best(), config.fitnessFunction)

  if (ga.bestScore() !== 0) {
    const scheduleExample = scoreList.pop()
    console.log('total hours:' + scheduleExample.BusyHours)
    console.log(scheduleExample.data)// if null is empty hour in day
  } else {
    console.log('Cant Build')
  }
}
main()
