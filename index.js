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

  const readview = (fileName) => fs.readFileSync(
    path.join(__dirname, "views", fileName),
    "utf8",
  )

  const empty = readview("empty.html");
  const loading = readview("loading.html");

  const noteslist = helpers.renderNotesList(notes);
  const html = mustache.render(indexHtml, {}, { noteslist, loading, empty });
  res.send(html);
});

app.get("/note/:id", (req, res) => {
  const { id } = req.params;
  const note = notes.find((n) => n.id == id);
  const templateHtml = fs.readFileSync(
    path.join(__dirname, "views", "note.html"),
    "utf8",
  );
  const markdown = marked(note.content);
  const markup = mustache.render(templateHtml, {
    markdown,
    title: note.title,
    update: note.createdAt,
    id: note.id
  });
  res.send(markup);
});

app.get("/new", (req, res) => {
  const templateHtml = fs.readFileSync(
    path.join(__dirname, "views", "new-note.html"),
    "utf8",
  );
  const markup = mustache.render(templateHtml, {});
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
  const markdown = marked(draft);
  const note = {
    id: v4(),
    title,
    content: draft,
    createdAt: new Date().toLocaleString(),
  };
  notes.unshift(note);
  const notesListHtml = helpers.renderNotesList(notes);
  const noteTemplateHtml = fs.readFileSync(
    path.join(__dirname, "views", "note.html"),
    "utf8",
  );
  const noteMarkup = mustache.render(noteTemplateHtml, { ...note, markdown });
  res.send(notesListHtml + noteMarkup);
});

app.put("/note/:id", (req, res) => {
  console.log(req.body);
  const { id } = req.params;
  const note = notes.find((n) => n.id == id);
  const { title, draft } = req.body;
  const markdown = marked(draft);
  note.title = title;
  note.content = draft;
  const templateHtml = fs.readFileSync(
    path.join(__dirname, "views", "note.html"),
    "utf8",
  );
  const markup = mustache.render(templateHtml, { ...note, markdown });
  res.send(markup);
});

app.get("/edit/:id", (req, res) => {
  const { id } = req.params;
  const note = notes.find((n) => n.id == id);
  const templateHtml = fs.readFileSync(
    path.join(__dirname, "views", "edit-note.html"),
    "utf8",
  );
  const markdown = marked(note.content);
  const markup = mustache.render(templateHtml, { ...note, markdown });
  res.send(markup);
});

app.delete("/note/:id", (req, res) => {
  const { id } = req.params;
  notes = notes.filter((n) => n.id != id);
  const notesListHtml = helpers.renderNotesList(notes);
  const emptyTemplateHtml = fs.readFileSync(
    path.join(__dirname, "views", "empty.html"),
    "utf8",
  );
  const emptyMarkup = mustache.render(emptyTemplateHtml, {});
  res.send(notesListHtml + emptyMarkup);
});

app.post("/search", (req, res) => {
  const { query } = req.body;
  const results = notes.filter((n) =>
    n.title.toLowerCase().includes(query.toLowerCase()),
  );
  const notesListHtml = helpers.renderNotesList(results);
  res.send(notesListHtml);
});

app.listen(PORT);

console.log("Listening on port: ", PORT);
