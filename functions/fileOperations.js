const fs = require("fs");
const path = require("path");
const pathToFile = path.join(__dirname, "..", "users.json");

function readFile() {
  try {
    const data = fs.readFileSync(pathToFile, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function writeFile(users) {
  try {
    fs.writeFileSync(pathToFile, JSON.stringify(users, null, 2));
  } catch (error) {
    console.log(error);
  }
}

module.exports = { readFile, writeFile };
