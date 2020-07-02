const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");
const validator = require("email-validator");
const githubValidator = require("github-username-regex");
// All the requirements to make this generator execute correctly
const OUTPUT_DIR = path.resolve(__dirname, "output");
const outputPath = path.join(OUTPUT_DIR, "team.html");
// This render variable will be called at the end with the writeFile function
const render = require("./lib/htmlRenderer");

// Questions the user will have to asnwer to generate the team.html
const questions = [
  {
    type: "list",
    message: "Which type of employee would you like to add?",
    name: "role",
    choices: ["Engineer", "Manager", "Intern"],
  },
  {
    type: "input",
    message: "What is their name?",
    name: "name",
  },
  {
    type: "input",
    message: "What is their ID?",
    name: "id",
    validate: (input) => {
      if (Number.isInteger(parseInt(input))) {
        return true;
      } return "Please enter a valid ID number.";
    },
  },
  {
    type: "input",
    message: "What is their email?",
    name: "email",
    validate: (input) => {
      const pass = validator.validate(input);
      if (pass) {
        return true;
      }return "Please enter a valid email.";
    },
  },
  {
    type: "input",
    message: "What is the manager's office number?",
    name: "officeNumber",
     validate: (input) => {
      if (Number.isInteger(parseInt(input))) {
        return true;
      } return "Please enter a valid ID number.";
    },
        // When is a method a part of Inquirer that helps specify which questions should be called depending on which role the user chose
    when: (data) => data.role == "Manager",
  },
  {
    type: "input",
    message: "What is the engineer's GitHub username?",
    name: "github",
    validate: (input) => {
      const githubEl = githubValidator.test(input);
      if (githubEl) {
        return true;
      } return "Please enter a valid GitHub account.";
    },
    when: (data) => data.role == "Engineer",
  },
  {
    type: "input",
    message: "What school does the intern attend?",
    name: "school",
    when: (data) => data.role == "Intern",
  },
  {
    type: "confirm",
    message: "Would you like to add another team member?",
    name: "finished",
    // This final question is set to a boolean with "confirm", it helps run the questions again later on
  },
];
// We have to put all this data somewhere, and "employees" is already set within the renderer script
const employees = [];

// This is our inquirer prompt of, then a second function is passed through the then promise
const init = () => {
  inquirer.prompt(questions).then(questionCompile);
};
// This takes the data from the questions and compiles them into a let variable, which is stored in the empty employees array
const questionCompile = (data) => {
  let em;
  if (data.role == "Engineer") {
    em = new Engineer(data.name, data.id, data.email, data.github);
  } else if (data.role == "Intern") {
    em = new Intern(data.name, data.id, data.email, data.school);
  } else if (data.role == "Manager") {
    em = new Manager(data.name, data.id, data.email, data.officeNumber);
  }
// This is the data being pushed into the empty array here
  employees.push(em);
// If the boolean returns true, then the init function is ran again
  if (data.finished) return init();
// Finally, the writeFile function from fs does the magic using the outputPath given at the beginning and running the empty array through renderer
  fs.writeFile(outputPath, render(employees), function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("Success!");
  });
};
// Calling the init to start the show
init();