export default class Controller {
    #view;
    #worker;
    #events = {
        alive: () => {
            console.log("alive");
        },
        progress: (total) => {
            this.#view.updateProgress(total);
        },
        ocurrenceUpdate: (data) => {
            console.log("ocurrenceUpdate");
        },
    };

    constructor({ view, worker }) {
        this.#view = view;
        this.#worker = this.#configureWorker(worker);
    }

    static init(deps) {
        const controller = new Controller(deps);
        controller.init();
        return controller;
    }

    init() {
        this.#view.configureOnFileChange(
            this.#configureOnFileChange.bind(this)
        );
        this.#view.configureOnFormSubmit(
            this.#configureOnFormSubmit.bind(this)
        );
    }

    #configureWorker(worker) {
        worker.onmessage = ({ data }) => this.#events[data.eventType](data);
        return worker;
    }

    #formtBytes(bytes) {
        const units = ["B", "KB", "MB", "GB", "TB"];

        for (var i = 0; bytes >= 1024 && i < 4; i++) {
            bytes /= 1024;
        }

        return `${bytes.toFixed(2)} ${units[i]}`;
    }

    #configureOnFileChange(file) {
        this.#view.setFileSize(this.#formtBytes(file.size));
    }

    #configureOnFormSubmit({ description, file }) {
        const query = {};
        query["call description"] = new RegExp(description, "i");
        if (this.#view.isWorkerEnabled()) {
            this.#worker.postMessage({ query, file });
            console.log("Executing on worker thread!");
            return;
        }

        console.log("Executing on main thread!");
    }
}
