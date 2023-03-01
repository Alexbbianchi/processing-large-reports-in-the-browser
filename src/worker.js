import Service from "./service";
const service = new Service();

console.log("I'm alive!");
postMessage({ eventType: "alive" });

onmessage = ({ data }) => {
    const { query, file } = data;

    service.processFile({
        query,
        file,
        onOcurrenceUpdate: (args) => {
            postMessage({ eventType: "ocurrenceUpdate", ...args });
        },
        onProgress: (total) => postMessage({ eventType: "progress", total }),
    });
};
