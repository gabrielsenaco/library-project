let myLibrary = [];
let addBookButton = document.querySelector("#add-book-facade .btn.add-book-btn");
let addBookFacade = document.querySelector("#add-book-facade");
let addBookContainer = document.getElementById("add-book");
let addBookForm = document.getElementById("add-book-form");
let cardAddBook = document.getElementById("card-add-book");
let booksList = document.getElementById("books");

loadLibrary();

function Book(title, author, pages, read) {
	this.title = title;
	this.author = author;
	this.pages = pages;
	this.read = read;
}

function addBookToLibrary(title, author, pages, read){
	let book = new Book(title, author, pages, read);
	myLibrary.push(book);
	addBookCard(book);
	changeLibraryStorage();
}

function addBookCard(book) {
	let bookCard = createElement("div", "book-card");
	booksList.insertBefore(bookCard, cardAddBook);

	let bookTitle = createElement("h3", "book-title");
	insertElement(bookTitle, bookCard);
	bookTitle.textContent = book.title;

	let bookPages = createElement("p", "book-pages");
	insertElement(bookPages, bookCard);
	bookPages.textContent = book.pages;

	let bookAuthor = createElement("p", "book-author");
	insertElement(bookAuthor, bookCard);
	bookAuthor.textContent = book.author;

	let bookButtonRead = createElement("button", "btn book-read-status");
	insertElement(bookButtonRead, bookCard);
	let readStatusMessage = "you don't read this book.";
	if(book.read) {
		readStatusMessage = "you read this book.";
		bookButtonRead.setAttribute("read", "");
	}
	bookButtonRead.textContent = readStatusMessage;
	bookButtonRead.addEventListener("click", changeBookStatus);

	let bookButtonRemove = createElement("button", "btn book-remove");
	insertElement(bookButtonRemove, bookCard);
	bookButtonRemove.textContent = "click to remove this book";
	bookButtonRemove.addEventListener("click", removeBook);
}

function getBookByCard(card) {
	let title = card.querySelector(".book-title").textContent;
	let author = card.querySelector(".book-author").textContent;
	return myLibrary.filter(book => book.title == title && book.author == author)[0];
}

function removeBook(event) {
	let card = event.target.parentNode;
	let originalBook = getBookByCard(card);
	myLibrary = myLibrary.filter(book => book != originalBook);
	card.remove();
	changeLibraryStorage();
}

function changeBookStatus(event) {
	let button = event.target;
	let book = getBookByCard(event.target.parentNode);

	if(book.read){
		button.removeAttribute("read");
		button.textContent = "you don't read this book.";
	} else {
		button.textContent = "you read this book.";
		button.setAttribute("read", "");
	}

	book.read = !book.read;
	changeLibraryStorage();
}

// dom manipulation

function createElement(type, className) {
	let element = document.createElement(type);
	element.className = className;
	return element;
}

function insertElement(element, parent) {
	parent.appendChild(element);
}


// listeners

addBookButton.addEventListener("click", () => {
	addBookFacade.classList.add("hide");
	addBookContainer.classList.remove("hide");
});

addBookForm.addEventListener("submit", () => {
	event.preventDefault();

	let elements = addBookForm.elements;
	let title = elements["title"].value;
	let author = "by "+elements["author"].value;

	let pages =  elements["pages"].value+" pages";
	let read = elements["read-status"].checked;

	addBookToLibrary(title, author, pages, read);

	addBookFacade.classList.remove("hide");
	addBookContainer.classList.add("hide");
	addBookForm.reset();
});


// storage

function loadLibrary() {
	if (!localStorageAvailable()){
		return;
	}

	library = localStorage.getItem("myLibrary");

	if (library == null) 
		return;
	
	library = JSON.parse(library);

	if (!(library instanceof Array)) 
		return;

	library = library.filter(book => book.title != null && book.pages != null && book.read != null && book.author != null)

	if (library.length != 0) {
		myLibrary = library;
		myLibrary.forEach(book => addBookCard(book));
	} else {
		return;
	}
}

function changeLibraryStorage() {
	if (!localStorageAvailable())
		return;
	
	localStorage.setItem("myLibrary", JSON.stringify(myLibrary));
}


// adaptation of https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability storageAvailable function code.
function localStorageAvailable() {
    try {
        let storage = window.localStorage;
        let test = '__storage_test__';
        storage.setItem(test, test);
        storage.removeItem(test);
        return true;
    }
    catch(e) {
        return e instanceof DOMException && (
            e.code === 22 ||
            e.code === 1014 ||
            e.name === 'QuotaExceededError' ||
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
            storage.length !== 0;
    }
}

