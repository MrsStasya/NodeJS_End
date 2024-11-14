/* Урок 4. Создание REST API с Express
Для того, чтобы пользователи хранились постоянно, а не только, когда запущен сервер, необходимо реализовать хранение массива в файле.
Подсказки:
— В обработчиках получения данных по пользователю нужно читать файл
— В обработчиках создания, обновления и удаления нужно файл читать, чтобы убедиться, что пользователь существует, а затем сохранить в файл, когда внесены изменения
— Не забывайте про JSON.parse() и JSON.stringify() - эти функции помогут вам переводить объект в строку и наоборот. */
const express = require("express");
// const uuid = require("uuid");
const { userScheme } = require("./validation/scheme");
const { readFile, writeFile } = require("./functions/fileOperations");

const app = express();

const users = [];
// let uniqueID = 0;

app.use(express.json());

app.get("/users", (req, res) => {
  const users = readFile();
  res.send({ users });
  // res.json(users);
});

app.get("/users/:id", (req, res) => {
  const users = readFile();
  const userID = +req.params.id;
  /* Это выражение преобразует параметр id из строки в число с помощью унарного оператора +  аналогично использованию Number() */
  const user = users.find((user) => user.id === userID);

  if (user) {
    res.send({ user });
    // res.json(user);
  } else {
    // res.status(404).send({ user: null });
    res.status(404).json({ message: `Пользователь id:${userID} не найден` });
  }
});

app.post("/users", (req, res) => {
  const users = readFile();
  const result = userScheme.validate(req.body);

  if (result.error) {
    return res.status(404).send({ error: result.error.details });
  }

  // uniqueID += 1;
  // const uniqueID = uuid.v4();
  const maxId = users.length > 0 ? Math.max(...users.map((user) => user.id)) : 0;
  const uniqueID = maxId + 1;

  users.push({
    id: uniqueID,
    ...req.body,
  });
  writeFile(users);
  // res.status(201).send({ id: uniqueID });
  res.status(201).json({ message: `Создан пользователь id:${uniqueID}` });
  // res.status(201).send({ users: users[users.length - 1] });
});

app.put("/users/:id", (req, res) => {
  const users = readFile();
  const result = userScheme.validate(req.body);
  if (result.error) {
    return res.status(404).send({ error: result.error.details });
  }

  const userID = +req.params.id;

  const user = users.find((user) => user.id === userID);
  if (user) {
    const { firstName, lastName, age, city } = req.body;
    user.firstName = firstName;
    user.lastName = lastName;
    user.age = age;
    user.city = city;

    writeFile(users);
    res.send({ user });
  } else {
    // res.status(404).send({ user: null });
    res.status(404).json({ message: `Пользователь id:${userID} не найден` });
  }
});

app.delete("/users/:id", (req, res) => {
  const users = readFile();
  const userID = +req.params.id;
  const user = users.find((user) => user.id === userID);

  if (user) {
    const userIndex = users.indexOf(user);
    users.splice(userIndex, 1);
    writeFile(users);
    res.json({ message: `Пользователь id:${userID} удален` });
    // res.send({ user });
  } else {
    // res.status(404).send({ user: null });
    res.status(404).json({ message: `Пользователь id:${userID} не найден` });
  }
});

app.delete("/users", (req, res) => {
  const confirmDelete = req.headers["confirm-delete"];

  if (confirmDelete !== "true") {
    return res.status(400).json({
      message: "Для удаления всех пользователей необходимо подтверждение. Добавьте заголовок Confirm-Delete: true",
    });
  }

  writeFile([]);
  res.json({ message: "Все пользователи удалены" });
});

const port = 3000;
app.listen(port, () => console.log(`Сервер запущен на порту ${port}`));
