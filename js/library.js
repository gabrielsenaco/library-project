let myLibrary = [];
let addBookButton = document.querySelector("#add-book-facade .btn.add-book-btn");
let addBookFacade = document.querySelector("#add-book-facade");
let addBookContainer = document.getElementById("add-book");
let addBookForm = document.getElementById("add-book-form");
let cardAddBook = document.getElementById("card-add-book");
let booksList = document.getElementById("books");
let BOOK_ELEMENTS = {
	TITLE: {type: "h3", class: "book-title"},
	PAGE: {type: "p", class: "book-pages"},
	AUTHOR: {type: "p", class: "book-author"},
	READ: {type: "button", class: "btn book-read-status"},
	REMOVE: {type: "button", class: "btn book-remove"}
};

loadLibraryStorage();

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
	
	createBookElement(BOOK_ELEMENTS.TITLE, bookCard, book.title);
	createBookElement(BOOK_ELEMENTS.PAGE, bookCard, book.pages);
	createBookElement(BOOK_ELEMENTS.AUTHOR, bookCard, book.author);

	let readStatusMessage = book.read ? "you read this book." : "you don't read this book.";
	let bookButtonRead = createBookElement(BOOK_ELEMENTS.READ, bookCard, readStatusMessage, book.read);
	bookButtonRead.addEventListener("click", changeBookStatus);

	let bookButtonRemove = createBookElement(BOOK_ELEMENTS.REMOVE, bookCard, "click to remove this book");
	bookButtonRemove.addEventListener("click", removeBook);
}

function createBookElement(element, bookCard, textContent, add_read_attr = false) {
	let domElement = createElement(element.type, element.class);
	insertElement(domElement, bookCard);
	domElement.textContent = textContent;
	if(add_read_attr) 
		domElement.setAttribute("read", "");
	
	return domElement;
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

function getValidLibraryStorage() {
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
		return library;
	}
}

function loadLibraryStorage() {
	library = getValidLibraryStorage();
	if (library == null)
		return;

	myLibrary = library;
	myLibrary.forEach(book => addBookCard(book));
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

