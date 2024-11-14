// Урок 4. Создание REST API с Express
// Для того, чтобы пользователи хранились постоянно, а не только, когда запущен сервер, необходимо реализовать хранение массива в файле.

// Подсказки:
// — В обработчиках получения данных по пользователю нужно читать файл
// — В обработчиках создания, обновления и удаления нужно файл читать, чтобы убедиться, что пользователь существует, а затем сохранить в файл, когда внесены изменения
// — Не забывайте про JSON.parse() и JSON.stringify() - эти функции помогут вам переводить объект в строку и наоборот.

// Алгоритм действия
// 1. создаем новую директорию
// 2. инициализируем npm init или npm init -y
// 3. инициализируем библиотеку express npm i express
// 4. создаем файл index.js
// 5. Написать валидацию ч/з joy. Установка joy командой npm i joi.

// Импортируем нужные модули
const express = require('express');
const joi = require('joi');
const fs = require("fs");

const app = express();

let uniqueID = 0; //сгенерировать уникальный идентификатор
const users = []; //Объявляем массив пользователей

// Обозначаем схему для валидации 
const userSchema = joi.object({
  firstName: joi.string().min(1).required(),
  lastName: joi.string().min(1).required(),
  age: joi.number().min(0).max(150).required(),
  city: joi.string().min(1)
});

app.use(express.json());

//Функция для чтения JSON файла
function readJson() {
  try {
    let readJsonResult = fs.readFileSync('./users.json');
    parseResult =  JSON.parse(readJsonResult);
    return parseResult;     
  } catch (error) {
    return [];   
  } 
}

//Функция для записи файла в JSON
function writeJson(users) {
  fs.writeFile('./users.json', JSON.stringify(users, null,2), (err) => {
    if(err) {
      console.error(err);
    } else {
      console.log('Значение записано в файл!');
    }
  })
}


// Роут получения всех users
app.get('/users', (req, res) => {
  const usersJson = readJson(); //читаем файл
  res.send({ usersJson }); //возвращаем данные из файла
});

// Роут для получения отдельного user по идентификатору(id)
app.get('/users/:id', (req, res) => {
  const usersJson = readJson(); //читаем файл

  const user = usersJson.find((user) => user.id === Number(req.params.id)); // ищем пользователя по id

  // Проверяем существует ли такой user
  if(user) {
    res.send({ user }); // Если user существует, то мы его возвращаем
  } else {
    res.status(404); // Если user нет, возвращаем код ошибки 404 - не найден и user со значением null
    res.send({ user:null });
  }  
});

// Роут создания users(создаем обработчик post)
app.post('/users', (req, res) => {
  const usersJson = readJson(); //читаем файл
  const result = userSchema.validate(req.body); //проверяем user на валидность
  if (result.error) {
    return res.status(404).send({error: result.error.details});
  }
  const maxId = usersJson.length > 0 ? Math.max(...usersJson.map((user) => user.id)) : 0;
  uniqueID = maxId + 1; 

  //Добавляем в массив users новую статью с значением Id и телом запроса
  usersJson.push({
    id: uniqueID,
    ...req.body 
  });

  writeJson(usersJson);

  //Возвращаем в качестве ответа идентификатор статьи, чтобы пользователь мог потом по нему найти статью
  res.send({
    id: uniqueID,
  });
});

// Реализация роута по обновлению users. 
app.put('/users/:id', (req, res) => {
  const readUsers = readJson();
  const result = userSchema.validate(req.body); //проверяем user на валидность
  if (result.error) {
    return res.status(404).send({error: result.error.details});
  }

  // ищем пользователя по id
  const user = readUsers.find((user) => user.id === Number(req.params.id));

  // Проверяем существует ли такая статья
  if(user) {
    user.firstName = req.body.firstName; 
    user.lastName = req.body.lastName;
    user.age = req.body.age;
    user.city = req.body.city;


    res.send({ user }); // Если user существует, то мы его возвращаем, с обновленными данными
    writeJson(readUsers); //Записываем данные в файл
  } else {
    res.status(404); // Если статьи нет, возвращаем код ошибки 404 - не найден и article со значением null
    res.send({ user:null });
  }  
});

// Роут по удалению user
app.delete('/users/:id', (req, res) => {
  const usersJson = readJson();
  const user = usersJson.find((user) => user.id === Number(req.params.id)) //ищем user по id

  // Проверяем существует ли такая статья
  if(user) {
    const userIndex = usersJson.indexOf(user); // Получаем индекс объекта в массиве
    usersJson.splice(userIndex,1); //удаляем объект из массива
    writeJson(usersJson); //Записываем данные в файл
    res.send({ user }); // возвращаем удаленную статью
    
  } else {
    res.status(404); // Если статьи нет, возвращаем код ошибки 404 - не найден и article со значением null
    res.send({ user:null });
  }  
});

app.listen(3000);

