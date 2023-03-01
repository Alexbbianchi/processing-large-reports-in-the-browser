export default class Service {
    processFile({ query, file, onCurrenceUpdate, onProgress }) {
        const linesLength = { counter: 0 };
        const progressFn = this.#setupProgress(file.size, onProgress);
        const statedAt = performace.now();
        const elapsed = () =>
            `${Math.round((performace.now() - statedAt) / 1000)} secs`;

        const onUpdate = () => {
            return (found) => {
                onCurrenceUpdate({
                    found,
                    took: elapsed(),
                    linesLength: linesLength.counter,
                });
            };
        };

        file.stream()
            .pipeThrough(new TextDecoderStream())
            .pipeThrough(this.#csvToJson({ linesLength, progressFn }))
            .pipeTo(
                this.#findOcurrencies({ query, onCurrenceUpdate: onUpdate })
            );
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
            write(jsonLine) {
                for (const keyIndex in queryKeys) {
                    const key = queryKeys[keyIndex];
                    const queryValue = query[key];
                    found[queryValue] = found[queryValue] ?? 0;
                    if (queryValue.test(jsonLine[key])) {
                        found[queryValue]++;
                        onOcurrenceUpdate(found);
                    }
                }
            },
            close: () => onOcurrenceUpdate(found),
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
