const BOOK_ELEMENTS = {
  TITLE: { type: "h3", class: "book-title" },
  PAGE: { type: "p", class: "book-pages" },
  AUTHOR: { type: "p", class: "book-author" },
  READ: { type: "button", class: "btn book-read-status" },
  REMOVE: { type: "button", class: "btn book-remove" }
};

class Book {

  constructor( title, author, pages, read ) {
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.read = read;
    this.createCard();
  }

  static createElement( type, className ) {
    let element = document.createElement( type );
    element.className = className;
    return element;
  }

  static createBookElement( element, bookCard, textContent, add_read_attr =
    false ) {
    let domElement = Book.createElement( element.type, element.class );
    bookCard.appendChild( domElement );
    domElement.textContent = textContent;
    if ( add_read_attr )
      domElement.setAttribute( "read", "" );
    return domElement;
  }

  createCard = () => {
    this.card = Book.createElement( "div", "book-card" );
    Book.createBookElement( BOOK_ELEMENTS.TITLE, this.card, this.title );
    Book.createBookElement( BOOK_ELEMENTS.PAGE, this.card, this.pages );
    Book.createBookElement( BOOK_ELEMENTS.AUTHOR, this.card, this.author );

    let readStatusMessage = this.read ? "you read this book." :
      "you don't read this book.";
    let bookButtonRead = Book.createBookElement( BOOK_ELEMENTS.READ, this.card,
      readStatusMessage, this.read );
    let bookButtonRemove = Book.createBookElement( BOOK_ELEMENTS.REMOVE, this
      .card, "click to remove this book" );
    bookButtonRead.addEventListener( "click", this.changeStatus );
    bookButtonRemove.addEventListener( "click", this.delete );
  }

  get card() {
    return this._card;
  }

  set card( card ) {
    this._card = card;
  }

  delete = () => {
    this.card.remove();
    Library.instance.removeBook( this );
  }

  changeStatus = ( event ) => {
    let button = event.target;

    if ( this.read ) {
      button.removeAttribute( "read" );
      button.textContent = "you don't read this book.";
    } else {
      button.textContent = "you read this book.";
      button.setAttribute( "read", "" );
    }

    this.read = !this.read;
    Storage.instance.changeLibraryStorage();
  }
}

class Library {

  constructor( books = [] ) {
    if ( Library.instance )
      return Library.instance;

    Library.instance = this;

    this.addBookButton = document.querySelector(
      "#add-book-facade .btn.add-book-btn" );
    this.addBookFacade = document.querySelector( "#add-book-facade" );
    this.addBookContainer = document.getElementById( "add-book" );
    this.addBookForm = document.getElementById( "add-book-form" );
    this.cardAddBook = document.getElementById( "card-add-book" );
    this.booksList = document.getElementById( "books" );
    this.bookForm();
    this.books = [];

    if ( books.length > 0 ) {
      this.importBooks( books );
      this.loadBooks();
    }
    return this;
  }

  get books() {
    return this._books;
  }

  set books( books ) {
    return this._books = books;
  }

  loadBooks() {
    this.books.forEach( ( book ) => this.addBookCard( book ) );
  }

  addBook( title, author, pages, read ) {
    let book = new Book( title, author, pages, read );
    this.books.push( book );
    this.addBookCard( book );
    Storage.instance.changeLibraryStorage();
  }

  addBookCard( book ) {
    this.booksList.insertBefore( book.card, this.cardAddBook );
  }

  removeBook( book ) {
    this.books = this.books.filter( _book => _book != book );
    Storage.instance.changeLibraryStorage();
  }

  exportBooks() {
    return this.books.reduce( ( total, now ) => {
      total.push( {
        title: now.title,
        author: now.author,
        pages: now.pages,
        read: now.read
      } );
      return total;
    }, [] );
  }

  importBooks( json ) {
    json.forEach( ( bookProps ) => {
      let book = new Book( bookProps.title, bookProps.author, bookProps.pages,
        bookProps.read );
      this.books.push( book );
    } );
  }

  bookForm() {
    this.addBookButton.addEventListener( "click", () => {
      this.addBookFacade.classList.add( "hide" );
      this.addBookContainer.classList.remove( "hide" );
    } );

    this.addBookForm.addEventListener( "submit", () => {
      event.preventDefault();

      let elements = this.addBookForm.elements;
      let title = elements[ "title" ].value;
      let author = "by " + elements[ "author" ].value;

      let pages = elements[ "pages" ].value + " pages";
      let read = elements[ "read-status" ].checked;

      this.addBook( title, author, pages, read );

      this.addBookFacade.classList.remove( "hide" );
      this.addBookContainer.classList.add( "hide" );
      this.addBookForm.reset();
    } );
  }
}

// storage

class Storage {

  static instance = new Storage();

  constructor() {
    return Storage.instance;
  }

  getValidLibraryStorageItem() {
    if ( !this.localStorageAvailable() ) {
      return;
    }

    this.library = localStorage.getItem( "myLibrary" );

    if ( this.library == null )
      return;

    this.library = JSON.parse( this.library );

    if ( !( this.library instanceof Array ) )
      return;

    this.library = this.library.filter( book => book.title != null && book.pages !=
      null &&
      book.read != null && book.author != null )
    if ( this.library.length != 0 ) {
      return this.library;
    }
  }

  loadLibraryStorage() {
    this.library = this.getValidLibraryStorageItem();
    if ( this.library == null ) {
      new Library();
      return;
    }
    new Library( this.library );
  }

  changeLibraryStorage() {
    if ( !this.localStorageAvailable() )
      return;

    localStorage.setItem( "myLibrary", JSON.stringify( Library.instance.exportBooks() ) );
  }

  // adaptation of https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API#testing_for_availability storageAvailable function code.
  localStorageAvailable() {
    try {
      let storage = window.localStorage;
      let test = '__storage_test__';
      storage.setItem( test, test );
      storage.removeItem( test );
      return true;
    } catch ( e ) {
      return e instanceof DOMException && (
          e.code === 22 ||
          e.code === 1014 ||
          e.name === 'QuotaExceededError' ||
          e.name === 'NS_ERROR_DOM_QUOTA_REACHED' ) &&
        storage.length !== 0;
    }
  }
}

Storage.instance.loadLibraryStorage();
