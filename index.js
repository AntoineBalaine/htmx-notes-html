const express = require("express");
const bodyParser = require("body-parser");
const marked = require("marked");
const { v4 } = require("uuid");
const compression = require("compression");
const helpers = require("./helpers.js");
const PORT = process.env.PORT || 3000;

const app = express();

let notes = require("./data/notes");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("assets"));
app.use(compression());

const mustache = require("mustache");
const fs = require("fs");
const path = require("path");

app.get("/", (req, res) => {
  const indexHtml = fs.readFileSync(
    path.join(__dirname, "views", "index.html"),
    "utf8",
  );

  const empty = fs.readFileSync(
    path.join(__dirname, "views", "empty.html"),
    "utf8",
  );
  const loading = fs.readFileSync(
    path.join(__dirname, "views", "loading.html"),
    "utf8",
  );
  renderNotesList(notes);
  const html = mustache.render(indexHtml, { _notes, loading, empty });
  res.send(html);
});

app.get("/note/:id", (req, res) => {
  const { id } = req.params;
  const note = notes.find((n) => n.id == id);
  // const template = pug.compileFile('views/_note.pug');
  const templateHtml = fs.readFileSync(
    path.join(__dirname, "views", "note.html"),
    "utf8",
  );
  const markdown = marked(note.content);
  mustache.render(templateHtml, { markdown, update: note.update });
  res.send(markup);
});

app.get("/new", (req, res) => {
  // const template = pug.compileFile('views/_new-note.pug');
  const markup = template({});
  res.send(markup);
});

app.post("/preview", (req, res) => {
  const { draft } = req.body;
  const markup = marked(draft);
  res.send(markup);
});

app.post("/note", (req, res) => {
  console.log(req.body);
  const { title, draft } = req.body;
  // const template = pug.compileFile('views/_note.pug');
  const markdown = marked(draft);
  const note = {
    id: v4(),
    title,
    content: draft,
    createdAt: new Date().toLocaleString(),
  };
  notes.unshift(note);
  // const tmpltNotesList = pug.compileFile('views/_notes-list.pug');
  let markup = tmpltNotesList({ notes });
  markup += template({ note, markdown });
  res.send(markup);
});

app.put("/note/:id", (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const note = notes.find((n) => n.id == id);
  const { title, draft } = req.body;
  // const template = pug.compileFile('views/_note.pug');
  const markdown = marked(draft);
  note.title = title;
  note.content = draft;
  const markup = template({ note, markdown });
  res.send(markup);
});

app.get("/edit/:id", (req, res) => {
  const { id } = req.params;
  const note = notes.find((n) => n.id == id);
  // const template = pug.compileFile('views/_edit-note.pug');
  const markdown = marked(note.content);
  const markup = template({ note, markdown });
  res.send(markup);
});

app.delete("/note/:id", (req, res) => {
  const { id } = req.params;
  notes = notes.filter((n) => n.id != id);
  // const template = pug.compileFile('views/_notes-list.pug');
  let markup = template({ notes });
  // const emptyTemplate = pug.compileFile('views/_empty.pug');
  markup += emptyTemplate();
  res.send(markup);
});

app.post("/search", (req, res) => {
  const { query } = req.body;
  const results = notes.filter((n) => n.title.toLowerCase().includes(query));
  // const template = pug.compileFile('views/_notes-list.pug');
  let markup = template({ notes: results });
  res.send(markup);
});

app.listen(PORT);

console.log("Listening on port: ", PORT);
