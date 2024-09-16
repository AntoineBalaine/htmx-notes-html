const fs = require("fs");
const mustache = require("mustache");
function renderNotesList(notes) {
  const template = fs.readFileSync("views/notes-list.html", "utf8");
  const rendered = mustache.render(template, { noteslist: notes });
  return rendered;
}

module.exports = { renderNotesList };
