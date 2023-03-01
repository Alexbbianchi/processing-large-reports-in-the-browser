export default class View {
    #csvFile = document.querySelector("#csv-file");
    #fileSize = document.querySelector("#file-size");
    #form = document.querySelector("#form");
    #debug = document.querySelector("#debug");
    #progress = document.querySelector("#progress");
    #worker = document.querySelector("#worker");

    setFileSize(size) {
        this.#fileSize.innerHTML = `File size: ${size}\n`;
    }

    configureOnFileChange(fn) {
        this.#csvFile.addEventListener("change", (e) => {
            fn(e.target.files[0]);
        });
    }

    configureOnFormSubmit(fn) {
        this.#form.reset();
        this.#form.addEventListener("submit", (e) => {
            e.preventDefault();
            const file = this.#csvFile.files[0];
            // isso aqui deveria esta na camada de controller
            if (!file) {
                alert("Please select a file!");
                return;
            }

            this.updateDebugLog("");
            const form = new FormData(e.currentTarget);
            const description = form.get("description");
            fn({ description, file });
        });
    }

    updateDebugLog(text, reset = true) {
        if (reset) {
            this.#debug.innerHTML = text;
            return;
        }

        this.#debug.innerHTML += text;
    }

    updateProgress(value) {
        this.#progress.value = value;
    }

    isWorkerEnabled() {
        return this.#worker.checked;
    }
}
