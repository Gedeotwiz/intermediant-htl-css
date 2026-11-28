





"use strict";

const closeModel = document.querySelector(".close");
const model = document.querySelector("#book-form");
const openModel = document.querySelector(".add-book");
const cancelButton = document.querySelector(".cancel-btn");

const titleInput = document.querySelector("#title");
const authorInput = document.querySelector("#author");
const pageInput = document.querySelector("#page");
const noteInput = document.querySelector("#note");
const searchInput = document.querySelector("#search");

const imageInput = document.querySelector("#book-image");
const imagePreview = document.querySelector("#image-preview");
const pdfInput = document.querySelector("#book-file");

const booksContainer = document.querySelector(".my-books");
const submitButton = model.querySelector('button[type="submit"]');

const defaultBookImage = "../images/book.png";


const DB_NAME = "MyLibraryDB";
const DB_VERSION = 1;
const STORE_NAME = "books";

let db;
let myLibrary = [];
let previewURL = null;

const coverObjectURLs = new Set();
const pdfObjectURLs = new Set();


function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const database = event.target.result;

            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME, {
                    keyPath: "id"
                });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;

            db.onversionchange = () => {
                db.close();
            };

            resolve(db);
        };

        request.onerror = () => {
            reject(request.error);
        };

        request.onblocked = () => {
            console.warn(
                "Database upgrade is blocked. Close other tabs using this database."
            );
        };
    });
}


function getAllBooks() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readonly"
        );

        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = () => {
            reject(request.error);
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };
    });
}


function saveBookToDatabase(book) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(STORE_NAME);

        store.put(book);

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(
                transaction.error ||
                new Error("Unable to save the book.")
            );
        };

        transaction.onabort = () => {
            reject(
                transaction.error ||
                new Error("The save transaction was cancelled.")
            );
        };
    });
}


function deleteBookFromDatabase(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(
            STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(STORE_NAME);

        store.delete(id);

        transaction.oncomplete = () => {
            resolve();
        };

        transaction.onerror = () => {
            reject(transaction.error);
        };

        transaction.onabort = () => {
            reject(transaction.error);
        };
    });
}

function Book(title, author, pages, readStatus, note, image, pdf) {
    this.id = crypto.randomUUID();
    this.title = title;
    this.author = author;
    this.pages = pages;
    this.readStatus = readStatus;
    this.note = note;
    this.image = image;
    this.pdf = pdf;
}

Book.prototype.toggleRead = function () {
    this.readStatus = !this.readStatus;
};

openModel.addEventListener("click", () => {
    model.style.display = "block";
    titleInput.focus();
});

function resetImagePreview() {
    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    imagePreview.src = defaultBookImage;
}

function closeForm() {
    model.style.display = "none";
    model.reset();

    resetImagePreview();
}

closeModel.addEventListener("click", closeForm);
cancelButton.addEventListener("click", closeForm);

imageInput.addEventListener("change", () => {
    const file = imageInput.files[0];

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    if (!file) {
        imagePreview.src = defaultBookImage;
        return;
    }

    if (!file.type.startsWith("image/")) {
        alert("Please select a valid image.");

        imageInput.value = "";
        imagePreview.src = defaultBookImage;
        return;
    }

    previewURL = URL.createObjectURL(file);
    imagePreview.src = previewURL;
});

model.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!db) {
        alert("The database is not ready yet. Please try again.");
        return;
    }

    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const pages = Number(pageInput.value);
    const note = noteInput.value.trim();

    const selectedStatus = document.querySelector(
        'input[name="readStatus"]:checked'
    );

    const imageFile = imageInput.files[0];
    const pdfFile = pdfInput.files[0];

    if (!title || !author || !selectedStatus) {
        alert("Please fill in all required fields.");
        return;
    }

    if (!Number.isInteger(pages) || pages < 1) {
        alert("Page count must be a positive whole number.");
        pageInput.focus();
        return;
    }

    if (!pdfFile) {
        alert("Please upload the book as a PDF file.");
        pdfInput.focus();
        return;
    }

    const isPDF =
        pdfFile.type === "application/pdf" ||
        pdfFile.name.toLowerCase().endsWith(".pdf");

    if (!isPDF) {
        alert("Please select a valid PDF file.");
        return;
    }

    if (imageFile && !imageFile.type.startsWith("image/")) {
        alert("Please select a valid cover image.");
        return;
    }

    submitButton.disabled = true;

    try {
        const newBook = new Book(
            title,
            author,
            pages,
            selectedStatus.value === "Read",
            note,
            imageFile || defaultBookImage,
            pdfFile
        );

        await saveBookToDatabase(newBook);

        myLibrary.push(newBook);

        displayBooks(searchInput.value);
        closeForm();

    } catch (error) {
        console.error("Error saving book:", error);

        alert(
            "Unable to save this book. Check available browser storage " +
            "and try again with a smaller PDF or image."
        );
    } finally {
        submitButton.disabled = false;
    }
});

function getCoverSource(image) {
    if (image instanceof Blob) {
        const url = URL.createObjectURL(image);

        coverObjectURLs.add(url);

        return url;
    }

    return image || defaultBookImage;
}

function clearCoverObjectURLs() {
    coverObjectURLs.forEach((url) => {
        URL.revokeObjectURL(url);
    });

    coverObjectURLs.clear();
}

function displayBooks(searchTerm = "") {
    clearCoverObjectURLs();
    booksContainer.replaceChildren();

    const search = searchTerm.trim().toLowerCase();

    const filteredBooks = myLibrary.filter((book) => {
        return (
            book.title.toLowerCase().includes(search) ||
            book.author.toLowerCase().includes(search)
        );
    });

    if (filteredBooks.length === 0) {
        const message = document.createElement("p");

        message.textContent = search
            ? "No books found matching your search."
            : "Your library is empty. Click + New Book to add a book.";

        booksContainer.appendChild(message);
        return;
    }

    filteredBooks.forEach((book) => {
        const card = document.createElement("div");
        card.className = "book-card";

        const content = document.createElement("div");
        content.className = "book-content";

        const cover = document.createElement("img");

        cover.src = getCoverSource(book.image);
        cover.alt = `${book.title} book cover`;
        cover.className = "book-cover";

        cover.onerror = () => {
            cover.onerror = null;
            cover.src = defaultBookImage;
        };

        const details = document.createElement("div");
        details.className = "book-details";

        const title = document.createElement("h2");
        title.textContent = book.title;

           

const downloadButton = document.createElement("button");

downloadButton.type = "button";
downloadButton.className = "download-btn";
downloadButton.title = "Download Book";
downloadButton.setAttribute("aria-label", "Download Book");


downloadButton.innerHTML = `
    <svg
        class="icon"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
`;

downloadButton.addEventListener("click", () => {
    if (!(book.pdf instanceof Blob)) {
        alert("No valid PDF is available for this book.");
        return;
    }

    const pdfURL = URL.createObjectURL(book.pdf);

    const link = document.createElement("a");
    link.href = pdfURL;

    const safeTitle = book.title
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
        .trim() || "book";

    link.download = `${safeTitle}.pdf`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => {
        URL.revokeObjectURL(pdfURL);
    }, 1000);
});



        const author = document.createElement("p");
        author.className = "author";
        author.textContent = book.author;

        const pages = document.createElement("p");
        pages.className = "pages";
        pages.textContent = `${book.pages} pages`;

        const status = document.createElement("span");
        status.className = "read-status";
        status.textContent = book.readStatus
            ? "✓ Read"
            : "○ Not Read";

        details.append(title, author, pages, status);

        if (book.note) {
            const note = document.createElement("p");

            note.className = "book-note";
            note.textContent = book.note;

            details.appendChild(note);
        }

        content.append(cover, details);

        const actions = document.createElement("div");
        actions.className = "book-actions";

       const readButton = document.createElement("button");

readButton.type = "button";
readButton.className = "read-book-btn";
readButton.textContent = "Read Book";

readButton.disabled = !book.readStatus;

readButton.addEventListener("click", () => {
    if (!(book.pdf instanceof Blob)) {
        alert("No valid PDF is available for this book.");
        return;
    }

    const readerWindow = window.open("", "_blank");

    if (!readerWindow) {
        alert("Please allow pop-ups to read this book.");
        return;
    }

    const pdfURL = URL.createObjectURL(book.pdf);
    pdfObjectURLs.add(pdfURL);

    readerWindow.document.title = book.title;

    const iframe = readerWindow.document.createElement("iframe");

    iframe.src = pdfURL;
    iframe.title = book.title;
    iframe.style.width = "100%";
    iframe.style.height = "100vh";
    iframe.style.border = "none";

    readerWindow.document.body.style.margin = "0";
    readerWindow.document.body.appendChild(iframe);
});

        const removeButton = document.createElement("button");

        removeButton.type = "button";
        removeButton.className = "remove-btn";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", async () => {
            removeButton.disabled = true;

            try {
                await deleteBookFromDatabase(book.id);

                myLibrary = myLibrary.filter(
                    (item) => item.id !== book.id
                );

                displayBooks(searchInput.value);
            } catch (error) {
                console.error("Unable to remove book:", error);

                alert("Could not remove this book. Please try again.");
                removeButton.disabled = false;
            }
        });

        actions.append(readButton,  downloadButton, removeButton);

        card.append(content, actions);

        booksContainer.appendChild(card);
    });
}

searchInput.addEventListener("input", () => {
    displayBooks(searchInput.value);
});


async function initializeLibrary() {
    try {
        await openDatabase();

        myLibrary = await getAllBooks();

        displayBooks(searchInput.value);

        console.log("My Library database is ready.");
    } catch (error) {
        console.error("Unable to initialize library:", error);

        booksContainer.replaceChildren();

        const message = document.createElement("p");
        message.textContent =
            "Unable to open your library database. Please refresh the page and try again.";

        booksContainer.appendChild(message);
    }
}

window.addEventListener("pagehide", () => {
    clearCoverObjectURLs();

    if (previewURL) {
        URL.revokeObjectURL(previewURL);
        previewURL = null;
    }

    pdfObjectURLs.forEach((url) => {
        URL.revokeObjectURL(url);
    });

    pdfObjectURLs.clear();
});

initializeLibrary();
