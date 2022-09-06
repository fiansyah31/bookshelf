const STORAGE_KEY = 'BOOKSHELF_APPS';
const RENDER_EVENT = 'render_bookshelf';
const SAVED_EVENT = 'save_data';

let bookshelf = [];
let tempBooks = [];

function isStorageExist() {
    if (typeof (Storage) !== undefined) return true;
  
    alert('Storage tidak tersedia');
    return false;
  }
document.addEventListener('DOMContentLoaded', function() {
    const submitForm = document.getElementById('inputBook');
    const searchForm = document.getElementById('searchBook');
    loadDataStorage();
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
        saveLocalStorage();
    });
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        loadDataStorage();
        searchBookList();
    });

    document.addEventListener(SAVED_EVENT, function () {
        loadDataStorage();
      });
    
    });

function addBook() {
    const title = document.getElementById('inputBookTitle').value;
    const author =  document.getElementById('inputBookAuthor').value;
    const year = parseInt(document.getElementById('inputBookYear').value);
    const isComplete = document.getElementById('inputBookIsComplete').checked
    
    const generatedId = generateId();
    const bookObject = generateBookObject(generatedId, title, author, year, isComplete);
    bookshelf.push(bookObject);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

document.addEventListener(RENDER_EVENT, function() {
    const uncompletedBOOKList = document.getElementById('incompleteBookshelfList');
    uncompletedBOOKList.innerHTML = '';
    const completedBOOKList = document.getElementById('completeBookshelfList');
    completedBOOKList.innerHTML = '';

    for(const bookItem of bookshelf){
        const bookElement = makeBook(bookItem);
        if(!bookItem.isComplete){
            uncompletedBOOKList.append(bookElement);
        } else {
            completedBOOKList.append(bookElement);
        }
    }

});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.classList.add('title-book');
    textTitle.innerText =  bookObject.title;
    const textAuthor = document.createElement('p');
    textAuthor.innerText =  bookObject.author;
    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;
    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(
        textTitle,
        textAuthor,
        textYear,
    );

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');
    const buttonDelete = document.createElement('button');
    buttonDelete.classList.add('red');
    buttonDelete.innerText = 'Hapus Buku';
     buttonDelete.addEventListener('click', function () { 
        let confirmDelete = confirm(
            "Are you sure you want to delete the book '" + bookObject.title + "'?"
          );
          if (confirmDelete) {
            removeBooks(bookObject.id);
          }
    });

    const buttonRead = document.createElement('button');
    buttonRead.classList.add('green');
    buttonRead.addEventListener('click', function () {
        completedStatus(bookObject.id);
    });
    if(bookObject.isComplete) {
        buttonRead.innerText = 'Belum Selesai dibaca';
        buttonRead.addEventListener('click' , function () {
            undoBooksCompleted(bookObject.id);
        })
    }else {
        buttonRead.innerText = 'Selesai dibaca';
    }
    buttonContainer.append(buttonRead, buttonDelete);
    container.append(buttonContainer);

    return container;
}

function undoBooksCompleted(bookid) {
    const bookTarget = findBook(bookid);
    if(bookTarget == null) return;

    bookTarget.isComplete = false;
    saveLocalStorage();
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function completedStatus(bookid) {
    const bookTarget = findBook(bookid);

    if(bookTarget == null) return;

    bookTarget.isComplete = true;
    saveLocalStorage();
    document.dispatchEvent(new Event(RENDER_EVENT));
}
function removeBooks(bookid) {
    const bookTarget = findDataIndex(bookid); 
    if(bookTarget === -1) return;
    bookshelf.splice(bookTarget, 1);
    saveLocalStorage();
    
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function findBook(bookid) {
    for(const bookItem of bookshelf) {
        if(bookItem.id === bookid) {
            return bookItem;
        }
    }
    return null;
}
function findDataIndex(bookid) {
    for (const index in bookshelf) {
      if (bookshelf[index].id === bookid) {
        return index;
      }
    }
    return -1;
  }

function saveLocalStorage() {
    const jsonStringify = JSON.stringify(bookshelf);
    localStorage.setItem(STORAGE_KEY, jsonStringify);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }

  function loadDataStorage() {
    if (!isStorageExist()) return;
  
    const serializedData = localStorage.getItem(STORAGE_KEY);
    const bookSave = JSON.parse(serializedData);
  
    if (bookSave == null) return;
  
    bookshelf = [];
    tempBooks = [];
    bookSave.map((bookObject) => {
      bookshelf.push(bookObject);
      tempBooks.push(bookObject);
    });
  
  
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

const searchInput = document.getElementById('searchBookTitle');
    searchInput.addEventListener("keyup", function(e){
    const searchInput = e.target.value.toLowerCase();
    const containerBook = document.querySelectorAll(".book_item");

    containerBook.forEach((book) => {
        const bookDesc = book.childNodes[0];
        const bookTitle = bookDesc.firstChild.textContent.toLowerCase();

        if(bookTitle.indexOf(searchInput) != -1){
            book.setAttribute("style", "display: block;");
        }else{
            book.setAttribute("style", "display: none !important;");
        }
    });
}); 