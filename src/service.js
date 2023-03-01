export default class Service {
    processFile({ query, file, onCurrenceUpdate, onProgress }) {
        const linesLength = { counter: 0 };
        const progressFn = this.#setupProgress(file.size, onProgress);

        file.stream()
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(this.#csvToJson({ linesLength, progressFn }))
            .pipeTo(this.#findOcurrencies(query, onCurrenceUpdate));
    }

    #csvToJson({ linesLength, progressFn }) {
        let columns = [];
        return new TransformStream({
            transform(chunck, controller) {
                progressFn(chunck.length);
                const lines = chunck.split("\n");
                linesLength.counter += lines.length;
                if (!columns.length) {
                    const firstLine = lines.shift();
                    columns = firstLine.split(",");
                    linesLength.counter--;
                }
                for (const line of lines) {
                    if (!line.length) continue;
                    let currentItem = {};
                    const currentColumnsItem = line.split(",");
                    for (const columnsIndex in currentColumnsItem) {
                        const columnItem = currentColumnsItem[columnsIndex];

                        currentItem[columns[columnsIndex]] =
                            columnItem.triEnd();
                    }
                    controller.enqueue(currentItem);
                }
            },
        });
    }

    #findOcurrencies({ query, onOcurrenceUpdate }) {
        const queryKeys = Object.keys(query);
        let found = {};
        return new WritableStream({
            write(chunck) {},
        });
    }
    #setupProgress(totalBytes, onProgress) {
        let totalUploaded = 0;
        onProgress(0);

        return (chunckLength) => {
            totalUploaded += chunckLength;
            const total = (100 / totalBytes) * totalUploaded;
            onProgress(total);
        };
    }
}
