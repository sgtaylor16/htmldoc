function downloadJSON(content,fileName,contentType){
    const a = document.createElement("a");
    const file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click()
}

function onDownload(filepath){
    //function to download a json file from the data.
   fetch(filepath)
    .then((response) => response.json())
    .then((data) => {
        console.log(data)
        downloadJSON(JSON.stringify(data),"json-file-name.json","text/plain")
    })

    }
