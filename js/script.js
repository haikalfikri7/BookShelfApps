const books = [];
const RENDER_EVENT = "render-book";
const STORAGE_KEY = "BOOKS_APPS";
const addBtn = document.querySelector("button#addButton");
const modal = document.querySelector(".modals");
const closeBtn = document.querySelector(".close");
const isBookComplete = document.querySelector("input#inputBookIsComplete");
const bookSubmit = document.querySelector("button#bookSubmit span");
const search = document.getElementById("search_book");
const title = document.querySelector(".input-section h2");
let edit = false;

search.addEventListener("submit", search_book);

addBtn.addEventListener("click", () => {
  resetForm();
  title.innerHTML = "Add Book";
  modal.classList.toggle("hide");
  edit = false;
});

closeBtn.addEventListener("click", () => {
  modal.classList.toggle("hide");
});

isBookComplete.addEventListener("click", (e) => {
  if (e.target.checked) bookSubmit.innerText = "Finished";
  else bookSubmit.innerText = "Unfinished";
});

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert("Your browser does not support local storage");
    return false;
  }
  return true;
}

document.addEventListener("DOMContentLoaded", () => {
  if (isStorageExist()) {
    readBook();
  } else {
    return null;
  }

  const bookForm = document.getElementById("inputBook");

  bookForm.addEventListener("submit", (e) => {
    modal.classList.toggle("hide");
    e.preventDefault();

    if (edit == true) {
      updateBook(e.target.getAttribute("data-id"));
      Swal.fire({
        icon: "success",
        title: "Book Modified Successfully",
        showConfirmButton: false,
        timer: 2000,
      });
    } else {
      addBook();
      Swal.fire({
        icon: "success",
        title: "Books Added Successfully",
        showConfirmButton: false,
        timer: 2000,
      });
    }

    resetForm();
  });
});

function resetForm() {
  document.getElementById("inputBook").reset();
}

function addBook() {
  const id = +new Date();
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = parseInt(document.getElementById("inputBookYear").value);
  const isCompleted = document.getElementById("inputBookIsComplete").checked;
  const bookObj = { id, title, author, year, isCompleted };
  books.push(bookObj);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function readBook() {
  const bookData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(bookData);
  if (data !== null) {
    for (bookItem of data) {
      books.push(bookItem);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function deleteBook(bookId) {
  const bookTarget = findBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function editBook(e) {
  const bookTarget = findBook(e);
  const editTitle = document.getElementById("inputBookTitle");
  const editAuthor = document.getElementById("inputBookAuthor");
  const editYear = document.getElementById("inputBookYear");
  const editComplete = document.getElementById("inputBookIsComplete");
  const formInputBook = document.getElementById("inputBook");

  formInputBook.setAttribute("data-id", bookTarget.id);
  title.innerText = "Book Edit";
  editTitle.value = bookTarget.title;
  editAuthor.value = bookTarget.author;
  editYear.value = bookTarget.year;
  editComplete.checked = bookTarget.isCompleted;
  edit = true;
}

function updateBook(e) {
  const bookTarget = findBookIndex(e);
  const newTitle = document.getElementById("inputBookTitle").value;
  const newAuthor = document.getElementById("inputBookAuthor").value;
  const newYear = document.getElementById("inputBookYear").value;
  const newComplete = document.getElementById("inputBookIsComplete").checked;

  books[bookTarget].title = newTitle;
  books[bookTarget].author = newAuthor;
  books[bookTarget].year = newYear;
  books[bookTarget].isCompleted = newComplete;

  saveData();
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function searchBook(e) {
  e.preventDefault();
  const keyword = document.getElementById("searchBookField").value.toLowerCase();
  const booksDisplay = document.getElementsByClassName("item");
  for (const bookItem of booksDisplay) {
    const title = bookItem.firstElementChild.textContent;
    if (title.toLocaleLowerCase().indexOf(keyword) != -1) {
      bookItem.style.display = "";
    } else {
      bookItem.style.display = "none";
    }
  }
}

function findBook(bookId) {
  for (bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookId) {
  for (index in books) {
    if (books[index].id == bookId) {
      return index;
    }
  }
  return -1;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

function displayBook(bookObj) {
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObj.title;
  const textAuthor = document.createElement("h4");
  textAuthor.innerText = "Author : " + bookObj.author;
  const textYear = document.createElement("p");
  textYear.innerText = bookObj.year;
  const textContainer = document.createElement("div");
  textContainer.classList.add("book");
  textContainer.append(textTitle, textAuthor, textYear);

  const container = document.createElement("div");
  container.classList.add("item", "card");
  const editBtn = document.createElement("button");
  editBtn.classList.add("button", "btn-third");
  editBtn.innerHTML = '<i class="large material-icons">edit</i>';
  editBtn.setAttribute("id", `${bookObj.id}`);
  editBtn.addEventListener("click", () => {
    modal.classList.toggle("hide");
    editBook(bookObj.id);
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("button", "button-danger");
  deleteBtn.innerHTML = '<i class="large material-icons">delete</i>';
  deleteBtn.addEventListener("click", () => {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "button button-primary",
        cancelButton: "button button-danger",
      },
      buttonsStyling: false,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Sure, Delete?",
        text: "Deleted books cannot be returned",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete!",
        cancelButtonText: "Cancelled",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.isConfirmed) {
          swalWithBootstrapButtons.fire("Deleted!", "Your book was removed from the shelf", "success");
          deleteBook(bookObj.id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire("Undelete", "Your book is still on the shelf", "error");
        }
      });
  });

  const readBtn = document.createElement("button");
  if (bookObj.isCompleted) {
    readBtn.classList.add("button", "button-secondary");
    readBtn.innerHTML = '<i class="large material-icons">replay</i>';
    readBtn.addEventListener("click", () => {
      removeFromCompleted(bookObj.id);
      Swal.fire({
        icon: "success",
        title: "Moved",
        text: "The book is moved to the shelf unfinished",
        showConfirmButton: false,
        timer: 2000,
      });
    });
  } else {
    readBtn.classList.add("button", "button-secondary");
    readBtn.innerHTML = '<i class="large material-icons">done</i>';
    readBtn.addEventListener("click", () => {
      moveToCompleted(bookObj.id);
      Swal.fire({
        icon: "success",
        title: "Moved",
        text: "The book is moved to the shelf after reading",
        showConfirmButton: false,
        timer: 2000,
      });
    });
  }
  const containerBtn = document.createElement("div");
  containerBtn.classList.add("container-btn");
  containerBtn.append(readBtn, editBtn, deleteBtn);
  container.append(textContainer, containerBtn);
  container.setAttribute("id", `book-${bookObj.id}`);
  return container;
}

function moveToCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;
  bookTarget.isCompleted = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.addEventListener(RENDER_EVENT, function () {
  const unFinishBook = document.getElementById("not-finished");
  unFinishBook.innerHTML = "";

  const finishBook = document.getElementById("finished");
  finishBook.innerHTML = "";

  for (bookItem of books) {
    const bookElement = displayBook(bookItem);
    if (bookItem.isCompleted == false) unFinishBook.append(bookElement);
    else finishBook.append(bookElement);
  }
  const eMessage = "Blank Book list";
  !finishBook.hasChildNodes() ? (finishBook.innerHTML = "<h3>" + eMessage + "</h3>") : 0;
  !unFinishBook.hasChildNodes() ? (unFinishBook.innerHTML = "<h3>" + eMessage + "</h3>") : 0;
});