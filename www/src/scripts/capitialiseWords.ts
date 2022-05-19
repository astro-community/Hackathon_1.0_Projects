export default function capitalizeWords(string:string) {
    return string.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};